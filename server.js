require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');
const multer = require('multer');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.firebasestorage.app`
});

const bucket = admin.storage().bucket();

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
        }
    }
});

// Helper function to generate fresh signed URL
async function generateSignedUrl(filePath, expiresIn = 7 * 24 * 60 * 60 * 1000) {
    try {
        const file = bucket.file(filePath);
        const [signedUrl] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + expiresIn // 7 days (max allowed by Firebase)
        });
        return signedUrl;
    } catch (error) {
        console.error('Error generating signed URL for:', filePath, error);
        throw error;
    }
}

// Get fresh signed URL for any image
app.get('/api/images/:fileName/url', async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const filePath = `images/${decodeURIComponent(fileName)}`;

        console.log('Generating fresh signed URL for:', filePath);

        const file = bucket.file(filePath);
        const [exists] = await file.exists();

        if (!exists) {
            console.log('File not found:', filePath);
            return res.status(404).json({ error: 'File not found' });
        }

        const signedUrl = await generateSignedUrl(filePath);

        console.log('Fresh signed URL generated');

        res.status(200).json({
            success: true,
            fileName: fileName,
            path: filePath,
            url: signedUrl,
            expiresIn: 7 * 24 * 60 * 60 * 1000
        });
    } catch (error) {
        console.error('Error generating URL:', error);
        res.status(500).json({ error: 'Failed to generate URL', details: error.message });
    }
});

// Routes
app.post('/api/upload', async (req, res) => {
    try {
        console.log('Upload request received');
        console.log('File:', req.file);
        
        // Handle multer errors
        upload.single('file')(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                console.error('Multer error:', err);
                return res.status(400).json({ error: 'File upload error', details: err.message });
            } else if (err) {
                console.error('Upload error:', err);
                return res.status(400).json({ error: 'File error', details: err.message });
            }

            // Check if file exists
            if (!req.file) {
                console.log('No file provided');
                return res.status(400).json({ error: 'No file uploaded' });
            }

            try {
                const timestamp = Date.now();
                const fileName = `${timestamp}_${req.file.originalname}`;
                const filePath = `images/${fileName}`;
                const file = bucket.file(filePath);

                console.log('Uploading file:', filePath);

                const blobStream = file.createWriteStream({
                    metadata: {
                        contentType: req.file.mimetype,
                        metadata: {
                            uploadedAt: new Date().toISOString(),
                            originalName: req.file.originalname
                        }
                    }
                });

                let uploadError = false;

                blobStream.on('error', (error) => {
                    console.error('Stream error:', error);
                    uploadError = true;
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Upload failed', details: error.message });
                    }
                });

                blobStream.on('finish', async () => {
                    if (uploadError) return;

                    try {
                        console.log('File uploaded, generating initial signed URL');
                        const signedUrl = await generateSignedUrl(filePath);

                        console.log('Upload successful');
                        res.status(200).json({
                            success: true,
                            message: 'Image uploaded successfully',
                            fileName: fileName,
                            url: signedUrl,
                            path: filePath,
                            note: 'URL expires in 7 days. Use /api/images/:fileName/url to get a fresh URL'
                        });
                    } catch (error) {
                        console.error('Error generating signed URL:', error);
                        res.status(500).json({ error: 'Failed to generate download URL', details: error.message });
                    }
                });

                blobStream.end(req.file.buffer);
            } catch (error) {
                console.error('Error in upload handler:', error);
                res.status(500).json({ error: 'Server error', details: error.message });
            }
        });
    } catch (error) {
        console.error('Error in upload route:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Get all images
app.get('/api/images', async (req, res) => {
    try {
        console.log('Fetching images...');
        const [files] = await bucket.getFiles({ prefix: 'images/' });

        console.log(`Found ${files.length} files`);

        const images = await Promise.all(
            files.map(async (file) => {
                try {
                    const signedUrl = await generateSignedUrl(file.name);

                    const [metadata] = await file.getMetadata();

                    return {
                        name: file.name.split('/').pop(),
                        path: file.name,
                        url: signedUrl,
                        size: (metadata.size / 1024).toFixed(2),
                        uploadedAt: metadata.timeCreated
                    };
                } catch (error) {
                    console.error(`Error processing file ${file.name}:`, error);
                    return null;
                }
            })
        );

        // Filter out null values
        const validImages = images.filter(img => img !== null);

        console.log(`Returning ${validImages.length} valid images`);

        res.status(200).json({
            success: true,
            count: validImages.length,
            images: validImages,
            note: 'URLs expire in 7 days. Refresh the page or call /api/images/:fileName/url for a fresh URL'
        });
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Failed to fetch images', details: error.message });
    }
});

// Delete image
app.delete('/api/images/:fileName', async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const filePath = `images/${decodeURIComponent(fileName)}`;

        console.log('Deleting file:', filePath);

        await bucket.file(filePath).delete();

        console.log('File deleted successfully');

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully',
            fileName: fileName
        });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Failed to delete image', details: error.message });
    }
});

// Download image
app.get('/api/download/:fileName', async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const filePath = `images/${decodeURIComponent(fileName)}`;

        console.log('Downloading file:', filePath);

        const file = bucket.file(filePath);

        const [exists] = await file.exists();
        if (!exists) {
            console.log('File not found:', filePath);
            return res.status(404).json({ error: 'File not found' });
        }

        const stream = file.createReadStream();
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        stream.pipe(res);

        stream.on('error', (error) => {
            console.error('Stream error:', error);
            res.status(500).json({ error: 'Failed to download image', details: error.message });
        });
    } catch (error) {
        console.error('Error downloading image:', error);
        res.status(500).json({ error: 'Failed to download image', details: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📁 Firebase Project: ${serviceAccount.project_id}`);
    console.log(`💾 Storage Bucket: ${serviceAccount.project_id}.firebasestorage.app`);
});
