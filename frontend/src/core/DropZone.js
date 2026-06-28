function toggleAccordion(headerElement) {
    const currentItem = headerElement.parentElement;
    const parentContainer = currentItem.parentNode;

    Array.from(parentContainer.children).forEach(childElement => {
        if (childElement.classList.contains('accordion-item') && childElement !== currentItem) {
            childElement.classList.remove('active');
        }
    });

    currentItem.classList.toggle('active');
}

function toFileUrl(filePath) {
    if (!filePath) return "";
    return encodeURI(`file:///${filePath.replace(/\\/g, '/')}`);
}

function getMediaStorageKey(inputElement) {
    if (!inputElement) return null;
    if (inputElement.id === 'videoFile') return 'videoPath';
    if (inputElement.id === 'audioFile') return 'audioPath';
    return null;
}

function saveSelectedMedia(inputElement, fileObject) {
    const mediaKey = getMediaStorageKey(inputElement);
    const filePath = fileObject && window.electronAPI && window.electronAPI.getPathForFile
        ? window.electronAPI.getPathForFile(fileObject)
        : "";

    if (!mediaKey || !filePath) return;

    const mediaConfig = storage.getMediaConfig();
    mediaConfig[mediaKey] = filePath;
    storage.saveMediaConfig(mediaConfig);
}

function renderMediaPreviewFromPath(zoneElement, filePath, mediaType) {
    if (!zoneElement || !filePath || !mediaType) return;

    Array.from(zoneElement.childNodes).forEach(node => {
        if (node.tagName !== 'INPUT') {
            node.remove();
        }
    });

    const mediaNode = document.createElement(mediaType);
    mediaNode.src = toFileUrl(filePath);
    mediaNode.controls = true;

    if (mediaType === 'video') {
        mediaNode.style.maxWidth = '100%';
        mediaNode.style.maxHeight = '100%';
        mediaNode.style.borderRadius = 'var(--borderRadius)';
    } else {
        mediaNode.style.width = '100%';
        mediaNode.style.marginTop = 'var(--spacing--m)';
    }

    zoneElement.appendChild(mediaNode);
}

function loadSavedMediaPreviews() {
    const mediaConfig = storage.getMediaConfig();

    renderMediaPreviewFromPath(
        document.getElementById('videoDropZone'),
        mediaConfig.videoPath,
        'video'
    );

    renderMediaPreviewFromPath(
        document.getElementById('audioDropZone'),
        mediaConfig.audioPath,
        'audio'
    );
}

function initializeDropZonesListeners() {
    document.addEventListener('click', (event) => {
        const dropZoneElement = event.target.closest('.drop-zone');
        if (!dropZoneElement) return;

        const inputElement = dropZoneElement.querySelector('input[type="file"]');
        const clickedTag = event.target.tagName;
        if (event.target === inputElement || clickedTag === 'VIDEO' || clickedTag === 'AUDIO') return;

        inputElement.click();
    });

    document.addEventListener('change', (event) => {
        if (event.target.matches('input[type="file"].hidden-file-input')) {
            const dropZoneElement = event.target.closest('.drop-zone');
            if (event.target.files.length) {
                saveSelectedMedia(event.target, event.target.files[0]);
                renderMediaPreview(dropZoneElement, event.target.files[0]);
            }
        }
    });

    ['dragover', 'dragleave', 'dragend', 'drop'].forEach(eventType => {
        document.addEventListener(eventType, (event) => {
            const dropZoneElement = event.target.closest('.drop-zone');
            if (!dropZoneElement) return;

            event.preventDefault();

            if (eventType === 'dragover') {
                dropZoneElement.classList.add('dragover');
            } else if (eventType === 'dragleave' || eventType === 'dragend') {
                dropZoneElement.classList.remove('dragover');
            } else if (eventType === 'drop') {
                dropZoneElement.classList.remove('dragover');
                const inputElement = dropZoneElement.querySelector('input[type="file"]');

                if (event.dataTransfer.files.length) {
                    inputElement.files = event.dataTransfer.files;
                    saveSelectedMedia(inputElement, event.dataTransfer.files[0]);
                    renderMediaPreview(dropZoneElement, event.dataTransfer.files[0]);
                }
            }
        });
    });
}

function renderMediaPreview(zoneElement, mediaFile) {
    const isVideo = mediaFile.type.startsWith('video/');
    const isAudio = mediaFile.type.startsWith('audio/');

    if (!isVideo && !isAudio) return;

    Array.from(zoneElement.childNodes).forEach(node => {
        if (node.tagName !== 'INPUT') {
            node.remove();
        }
    });

    const targetTag = isVideo ? 'video' : 'audio';
    const mediaNode = document.createElement(targetTag);

    mediaNode.src = URL.createObjectURL(mediaFile);
    mediaNode.controls = true;

    if (isVideo) {
        mediaNode.style.maxWidth = '100%';
        mediaNode.style.maxHeight = '100%';
        mediaNode.style.borderRadius = 'var(--borderRadius)';
    } else {
        mediaNode.style.width = '100%';
        mediaNode.style.marginTop = 'var(--spacing--m)';
    }

    zoneElement.appendChild(mediaNode);
}
