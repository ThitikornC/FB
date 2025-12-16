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
let currentImageFileName = null;
let images = [];
let urlRefreshInterval = null;

// API Base URL
const API_BASE = 'http://localhost:3000/api';

// Refresh URL every 6 days (before 7-day expiration)
const URL_REFRESH_INTERVAL = 6 * 24 * 60 * 60 * 1000; // 6 days

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

// Upload image to server
async function uploadImage(file) {
    try {
        uploadProgress.style.display = 'block';
        uploadStatus.textContent = '';
        
        const formData = new FormData();
        formData.append('file', file);

        // Track upload progress
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const progress = (e.loaded / e.total) * 100;
                progressFill.style.width = progress + '%';
                progressText.textContent = `กำลังอัพโหลด ${Math.round(progress)}%`;
            }
        });

        xhr.addEventListener('load', async () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                showStatus(`✅ ${file.name} อัพโหลดสำเร็จ!`, 'success');
                uploadProgress.style.display = 'none';
                fileInput.value = '';
                await loadImages();
            } else {
                const response = JSON.parse(xhr.responseText);
                showStatus(`❌ อัพโหลดล้มเหลว: ${response.error}`, 'error');
                uploadProgress.style.display = 'none';
            }
        });

        xhr.addEventListener('error', () => {
            showStatus('❌ เกิดข้อผิดพลาดในการอัพโหลด', 'error');
            uploadProgress.style.display = 'none';
        });

        xhr.open('POST', `${API_BASE}/upload`);
        xhr.send(formData);
    } catch (error) {
        showStatus(`❌ ข้อผิดพลาด: ${error.message}`, 'error');
        uploadProgress.style.display = 'none';
    }
}

// Load images from server
async function loadImages() {
    try {
        gallery.innerHTML = '<div class="loading">กำลังโหลดภาพ...</div>';
        images = [];

        const response = await fetch(`${API_BASE}/images`);
        const data = await response.json();

        if (!data.success || data.images.length === 0) {
            gallery.innerHTML = '<div class="loading">ยังไม่มีภาพ</div>';
            return;
        }

        gallery.innerHTML = '';
        images = data.images;

        images.forEach((image) => {
            const galleryItem = createGalleryItem(image.url, image.name, image.path);
            gallery.appendChild(galleryItem);
        });
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
    
    const img = document.createElement('img');
    img.src = url;
    img.alt = fileName;
    img.loading = 'lazy';
    
    const info = document.createElement('div');
    info.className = 'gallery-item-info';
    info.textContent = fileName;
    
    item.appendChild(img);
    item.appendChild(info);

    // Click to view details
    item.addEventListener('click', () => {
        currentImagePath = fullPath;
        currentImageFileName = fileName;
        modalImage.src = url;
        imageModal.style.display = 'flex';
        
        // Start refreshing URL periodically
        startUrlRefresh();
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
    stopUrlRefresh();
});

imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) {
        imageModal.style.display = 'none';
        stopUrlRefresh();
    }
});

// Refresh URL periodically
function startUrlRefresh() {
    stopUrlRefresh();
    
    // Refresh immediately on modal open
    refreshImageUrl();
    
    // Then set interval to refresh every 6 days
    urlRefreshInterval = setInterval(() => {
        refreshImageUrl();
    }, URL_REFRESH_INTERVAL);
}

function stopUrlRefresh() {
    if (urlRefreshInterval) {
        clearInterval(urlRefreshInterval);
        urlRefreshInterval = null;
    }
}

async function refreshImageUrl() {
    if (!currentImageFileName) return;
    
    try {
        console.log('Refreshing image URL...');
        const response = await fetch(`${API_BASE}/images/${encodeURIComponent(currentImageFileName)}/url`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Fresh URL obtained, expires in 7 days');
            modalImage.src = data.url;
        }
    } catch (error) {
        console.error('Error refreshing URL:', error);
    }
}

downloadBtn.addEventListener('click', async () => {
    try {
        const fileName = currentImagePath.split('/').pop();
        const link = document.createElement('a');
        link.href = `${API_BASE}/download/${encodeURIComponent(fileName)}`;
        link.download = fileName;
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
        const fileName = currentImagePath.split('/').pop();
        const response = await fetch(`${API_BASE}/images/${encodeURIComponent(fileName)}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showStatus('✅ ลบภาพสำเร็จ!', 'success');
            imageModal.style.display = 'none';
            await loadImages();
        } else {
            const data = await response.json();
            showStatus(`❌ ลบภาพล้มเหลว: ${data.error}`, 'error');
        }
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
