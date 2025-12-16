// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const gallery = document.getElementById('gallery');
const canvas = document.getElementById('canvas');
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const downloadBtn = document.getElementById('downloadBtn');
const deleteBtn = document.getElementById('deleteBtn');
const closeBtn = document.querySelector('.close');
const uploadStatus = document.getElementById('uploadStatus');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

let currentImagePath = null;
let images = [];

// Upload Area Interactions
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Handle file uploads
async function handleFiles(files) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    for (let file of files) {
        if (!allowedTypes.includes(file.type)) {
            showStatus(`❌ ${file.name} ไม่ใช่ไฟล์รูปภาพที่รองรับ`, 'error');
            continue;
        }

        await uploadImage(file);
    }
}

// Upload image to Firebase
async function uploadImage(file) {
    try {
        uploadProgress.style.display = 'block';
        uploadStatus.textContent = '';
        
        const timestamp = new Date().getTime();
        const fileName = `${timestamp}_${file.name}`;
        const storageRef = storage.ref(`images/${fileName}`);
        const uploadTask = storageRef.put(file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressFill.style.width = progress + '%';
                progressText.textContent = `กำลังอัพโหลด ${Math.round(progress)}%`;
            },
            (error) => {
                showStatus(`❌ อัพโหลดล้มเหลว: ${error.message}`, 'error');
                uploadProgress.style.display = 'none';
            },
            async () => {
                showStatus(`✅ ${file.name} อัพโหลดสำเร็จ!`, 'success');
                uploadProgress.style.display = 'none';
                fileInput.value = '';
                loadImages();
            }
        );
    } catch (error) {
        showStatus(`❌ ข้อผิดพลาด: ${error.message}`, 'error');
        uploadProgress.style.display = 'none';
    }
}

// Load images from Firebase
async function loadImages() {
    try {
        gallery.innerHTML = '<div class="loading">กำลังโหลดภาพ...</div>';
        images = [];

        const listResult = await storage.ref('images/').listAll();
        
        if (listResult.items.length === 0) {
            gallery.innerHTML = '<div class="loading">ยังไม่มีภาพ</div>';
            return;
        }

        gallery.innerHTML = '';

        for (let item of listResult.items) {
            const url = await item.getDownloadURL();
            const metadata = await item.getMetadata();
            
            images.push({
                name: item.name,
                url: url,
                path: item.fullPath,
                size: (metadata.size / 1024).toFixed(2)
            });

            const galleryItem = createGalleryItem(url, item.name, item.fullPath);
            gallery.appendChild(galleryItem);
        }
    } catch (error) {
        console.error('Error loading images:', error);
        gallery.innerHTML = '<div class="loading">❌ เกิดข้อผิดพลาดในการโหลดภาพ</div>';
    }
}

// Create gallery item element
function createGalleryItem(url, fileName, fullPath) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.draggable = true;
    
    item.innerHTML = `
        <img src="${url}" alt="${fileName}" loading="lazy">
        <div class="gallery-item-info">${fileName}</div>
    `;

    // Click to view details
    item.addEventListener('click', () => {
        currentImagePath = fullPath;
        modalImage.src = url;
        imageModal.style.display = 'flex';
    });

    // Drag functionality
    item.addEventListener('dragstart', (e) => {
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('imageUrl', url);
        e.dataTransfer.setData('fileName', fileName);
    });

    item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
    });

    return item;
}

// Canvas drag & drop
canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    canvas.classList.add('dragover');
});

canvas.addEventListener('dragleave', () => {
    canvas.classList.remove('dragover');
});

canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    canvas.classList.remove('dragover');

    const imageUrl = e.dataTransfer.getData('imageUrl');
    const fileName = e.dataTransfer.getData('fileName');

    if (imageUrl) {
        displayImageOnCanvas(imageUrl, fileName);
    }
});

// Display image on canvas
function displayImageOnCanvas(url, fileName) {
    canvas.innerHTML = '';
    const img = document.createElement('img');
    img.src = url;
    img.alt = fileName;
    img.title = fileName;
    canvas.appendChild(img);
}

// Modal controls
closeBtn.addEventListener('click', () => {
    imageModal.style.display = 'none';
});

imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) {
        imageModal.style.display = 'none';
    }
});

downloadBtn.addEventListener('click', async () => {
    try {
        const link = document.createElement('a');
        link.href = modalImage.src;
        link.download = currentImagePath.split('/').pop();
        link.click();
    } catch (error) {
        showStatus('❌ ดาวน์โหลดล้มเหลว', 'error');
    }
});

deleteBtn.addEventListener('click', async () => {
    if (!confirm('คุณแน่ใจหรือว่าต้องการลบภาพนี้?')) {
        return;
    }

    try {
        await storage.ref(currentImagePath).delete();
        showStatus('✅ ลบภาพสำเร็จ!', 'success');
        imageModal.style.display = 'none';
        loadImages();
    } catch (error) {
        showStatus(`❌ ลบภาพล้มเหลว: ${error.message}`, 'error');
    }
});

// Show status message
function showStatus(message, type) {
    uploadStatus.textContent = message;
    uploadStatus.className = `upload-status ${type}`;
    
    if (type === 'success') {
        setTimeout(() => {
            uploadStatus.textContent = '';
            uploadStatus.className = 'upload-status';
        }, 3000);
    }
}

// Load images on page load
window.addEventListener('load', () => {
    loadImages();
});

// Auto-refresh images every 30 seconds
setInterval(() => {
    loadImages();
}, 30000);
