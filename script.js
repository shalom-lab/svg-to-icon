function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function convertSVG() {
    const svgText = document.getElementById('svgInput').value;
    const sizeInput = document.getElementById('sizeInput').value;
    
    if (!svgText) {
        showToast('Please paste SVG code first!');
        return;
    }

    // Parse sizes from input
    const sizes = sizeInput.split(',')
        .map(size => parseInt(size.trim()))
        .filter(size => !isNaN(size) && size > 0);

    if (sizes.length === 0) {
        showToast('Please enter valid sizes (positive numbers separated by commas)');
        return;
    }

    // Clear preview area
    const previewContainer = document.getElementById('preview');
    previewContainer.innerHTML = '';

    // Create preview and download buttons for each size
    sizes.forEach(size => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        
        const img = new Image();
        const blob = new Blob([svgText], {type: 'image/svg+xml'});
        const url = URL.createObjectURL(blob);

        img.onload = function() {
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, size, size);
            URL.revokeObjectURL(url);

            // Add size label
            const sizeLabel = document.createElement('div');
            sizeLabel.textContent = `${size}x${size}`;
            sizeLabel.style.marginBottom = '5px';
            
            // Add download button
            const downloadBtn = document.createElement('button');
            downloadBtn.textContent = 'Download';
            downloadBtn.onclick = () => {
                canvas.toBlob(blob => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `icon${size}.png`;
                    a.click();
                    URL.revokeObjectURL(url);
                }, 'image/png');
            };

            previewItem.appendChild(sizeLabel);
            previewItem.appendChild(canvas);
            previewItem.appendChild(document.createElement('br'));
            previewItem.appendChild(downloadBtn);
        };

        img.src = url;
        previewContainer.appendChild(previewItem);
    });

    // Add logo.svg preview and download (always available, independent of sizes)
    const svgPreviewItem = document.createElement('div');
    svgPreviewItem.className = 'preview-item';

    const svgLabel = document.createElement('div');
    svgLabel.textContent = 'logo.svg';
    svgLabel.style.marginBottom = '5px';

    const svgPreview = document.createElement('img');
    const svgBlob = new Blob([svgText], {type: 'image/svg+xml'});
    const svgUrl = URL.createObjectURL(svgBlob);
    svgPreview.src = svgUrl;
    svgPreview.style.maxWidth = '128px';
    svgPreview.style.maxHeight = '128px';
    svgPreview.style.border = '1px solid #ccc';
    svgPreview.style.borderRadius = '4px';

    const svgDownloadBtn = document.createElement('button');
    svgDownloadBtn.textContent = 'Download';
    svgDownloadBtn.onclick = () => {
        const blob = new Blob([svgText], {type: 'image/svg+xml'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'logo.svg';
        a.click();
        URL.revokeObjectURL(url);
    };

    svgPreviewItem.appendChild(svgLabel);
    svgPreviewItem.appendChild(svgPreview);
    svgPreviewItem.appendChild(document.createElement('br'));
    svgPreviewItem.appendChild(svgDownloadBtn);
    previewContainer.appendChild(svgPreviewItem);
}

function handleFileUpload(file) {
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.svg')) {
        showToast('Please upload an SVG file');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        document.getElementById('svgInput').value = content;
        showToast('SVG file uploaded successfully');
    };
    reader.onerror = function() {
        showToast('Error reading file');
    };
    reader.readAsText(file);
}

// 保存数据到本地存储
function saveData() {
    const svgText = document.getElementById('svgInput').value;
    const sizeInput = document.getElementById('sizeInput').value;
    
    try {
        localStorage.setItem('svgInput', svgText);
        localStorage.setItem('sizeInput', sizeInput);
    } catch (e) {
        // 如果 localStorage 不可用，静默失败
        console.warn('localStorage not available:', e);
    }
}

// 从本地存储恢复数据
function loadData() {
    try {
        const svgText = localStorage.getItem('svgInput');
        const sizeInput = localStorage.getItem('sizeInput');
        
        if (svgText) {
            document.getElementById('svgInput').value = svgText;
        }
        if (sizeInput) {
            document.getElementById('sizeInput').value = sizeInput;
        }
    } catch (e) {
        // 如果 localStorage 不可用，静默失败
        console.warn('localStorage not available:', e);
    }
}

// Add event listener when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const convertButton = document.getElementById('convertButton');
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const svgInput = document.getElementById('svgInput');
    const sizeInput = document.getElementById('sizeInput');

    // 加载保存的数据
    loadData();

    // 监听输入变化，实时保存
    svgInput.addEventListener('input', saveData);
    sizeInput.addEventListener('input', saveData);

    convertButton.addEventListener('click', convertSVG);

    // Handle file upload button click
    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleFileUpload(file);
        // Reset file input so the same file can be selected again
        fileInput.value = '';
        // 文件上传后会自动更新 textarea，触发 input 事件，所以会自动保存
    });

    // Handle drag and drop
    const textarea = document.getElementById('svgInput');
    
    textarea.addEventListener('dragover', (e) => {
        e.preventDefault();
        textarea.style.borderColor = '#1976D2';
    });

    textarea.addEventListener('dragleave', () => {
        textarea.style.borderColor = '#2196F3';
    });

    textarea.addEventListener('drop', (e) => {
        e.preventDefault();
        textarea.style.borderColor = '#2196F3';
        const file = e.dataTransfer.files[0];
        handleFileUpload(file);
        // 拖拽上传后会自动更新 textarea，触发 input 事件，所以会自动保存
    });
}); 