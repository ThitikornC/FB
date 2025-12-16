// API endpoints
const API_BASE = '/api';

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const uploadStatus = document.getElementById('uploadStatus');
const gallery = document.getElementById('gallery');
const canvas = document.getElementById('canvas');
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const downloadBtn = document.getElementById('downloadBtn');
const deleteBtn = document.getElementById('deleteBtn');
const closeBtn = document.querySelector('.close');

let currentFileName = null;

// Upload Area Click
uploadArea.addEventListener('click', () => fileInput.click());

// Drag and drop
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
    const files = e.dataTransfer.files;
    handleFiles(files);
});

// File input change
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Handle file upload
async function handleFiles(files) {
    for (let file of files) {
        if (!file.type.startsWith('image/')) {
            showStatus('❌ เฉพาะไฟล์รูปภาพเท่านั้น', 'error');
            continue;
        }

        if (file.size > 10 * 1024 * 1024) {
            showStatus('❌ ขนาดไฟล์ต้องน้อยกว่า 10MB', 'error');
            continue;
        }

        await uploadFile(file);
    }
}

// Upload file to server
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    uploadProgress.style.display = 'block';
    uploadStatus.innerHTML = '';

    try {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressFill.style.width = percentComplete + '%';
                progressText.textContent = `อัพโหลด ${Math.round(percentComplete)}%`;
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                showStatus('✅ อัพโหลดสำเร็จ!', 'success');
                loadImages();
                setTimeout(() => {
                    uploadProgress.style.display = 'none';
                    progressFill.style.width = '0%';
                    fileInput.value = '';
                }, 1500);
            } else {
                showStatus('❌ อัพโหลดไม่สำเร็จ', 'error');
            }
        });

        xhr.addEventListener('error', () => {
            showStatus('❌ เกิดข้อผิดพลาดในการอัพโหลด', 'error');
        });

        xhr.open('POST', `${API_BASE}/upload`);
        xhr.send(formData);
    } catch (error) {
        console.error('Upload error:', error);
        showStatus('❌ เกิดข้อผิดพลาด: ' + error.message, 'error');
    }
}

// Show upload status
function showStatus(message, type) {
    uploadStatus.textContent = message;
    uploadStatus.className = `upload-status ${type}`;
}

// Load images from server
async function loadImages() {
    try {
        const response = await fetch(`${API_BASE}/images`);
        const data = await response.json();

        gallery.innerHTML = '';

        if (data.images && data.images.length > 0) {
            data.images.forEach(img => {
                createGalleryItem(img);
            });
        } else {
            gallery.innerHTML = '<div class="loading">ไม่มีภาพ</div>';
        }
    } catch (error) {
        console.error('Load images error:', error);
        gallery.innerHTML = '<div class="loading">❌ ไม่สามารถโหลดภาพได้</div>';
    }
}

// Create gallery item
function createGalleryItem(image) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.draggable = true;

    const img = document.createElement('img');
    img.src = image.url;
    img.alt = image.name;
    img.onerror = () => {
        console.error('Failed to load image:', image.name);
        item.style.display = 'none';
    };

    const info = document.createElement('div');
    info.className = 'gallery-item-info';
    info.textContent = image.name.substring(0, 20);

    item.appendChild(img);
    item.appendChild(info);

    // Click to open modal
    item.addEventListener('click', () => {
        currentFileName = image.name;
        modalImage.src = image.url;
        imageModal.style.display = 'flex';
    });

    // Drag start
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('imageUrl', image.url);
        item.classList.add('dragging');
    });

    item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
    });

    gallery.appendChild(item);
}

// Canvas drag and drop
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
    if (imageUrl) {
        displayImageOnCanvas(imageUrl);
    }
});

// Display image on canvas
function displayImageOnCanvas(imageUrl) {
    canvas.innerHTML = '';
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Canvas Image';
    canvas.appendChild(img);
}

// Modal functions
closeBtn.addEventListener('click', () => {
    imageModal.style.display = 'none';
});

imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) {
        imageModal.style.display = 'none';
    }
});

downloadBtn.addEventListener('click', async () => {
    if (!currentFileName) return;

    try {
        const response = await fetch(`${API_BASE}/download/${encodeURIComponent(currentFileName)}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentFileName;
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download error:', error);
        alert('❌ ดาวน์โหลดไม่สำเร็จ');
    }
});

deleteBtn.addEventListener('click', async () => {
    if (!currentFileName) return;

    if (!confirm('คุณแน่ใจหรือว่าต้องการลบภาพนี้?')) return;

    try {
        const response = await fetch(`${API_BASE}/images/${encodeURIComponent(currentFileName)}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            imageModal.style.display = 'none';
            loadImages();
        } else {
            alert('❌ ลบไม่สำเร็จ');
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('❌ เกิดข้อผิดพลาด');
    }
});

// Load images on page load
document.addEventListener('DOMContentLoaded', () => {
    loadImages();

    // Auto-refresh gallery every 30 seconds
    setInterval(loadImages, 30000);
});
