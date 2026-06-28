import { API_BASE_URL } from '../../../config.js';
import { escape }       from '../../core/sanitize.js';
import { BaseView }     from '../../core/BaseView.js';
import { PERM }         from '../../core/Permission.js';

export class GalleryPhotoView extends BaseView {
    renderGallery(photos) {
        const gallery = document.getElementById('photoGallery');
        if (!gallery) return;

        if (!photos.length) {
            gallery.innerHTML = '<p class="loading-text">Aucune photo dans cet album.</p>';
            return;
        }

        const trashIcon = `<span class="material-symbols-outlined">delete_forever</span>`;

        gallery.innerHTML = `
            <div class="photos-grid">
                ${photos.map(photo => `
                    <figure class="photo-item">
                        <div class="photo-item-image-container action-open-photo" data-photo-id="${escape(photo.id)}">
                            <img src="${API_BASE_URL}${escape(photo.alt)}" alt="${escape(photo.caption || '')}" class="photo-item-image" />
                        </div>
                        <button class="delete-photo-btn" data-photo-id="${escape(photo.id)}" title="Supprimer la photo">${trashIcon}</button>
                    </figure>
                `).join('')}
            </div>
        `;
    }

    bindOpenPhoto(handler) {
        const gallery = document.getElementById('photoGallery');
        if (!gallery) return;

        gallery.querySelectorAll('.action-open-photo').forEach(container => {
            container.addEventListener('click', (event) => {
                const photoId = event.currentTarget.getAttribute('data-photo-id');
                handler(photoId);
            });
        });
    }

    renderPhotoModal(photoUrl, comments, permissionLevel) {
        const modalHtml = `
            <div id="photoModalOverlay" class="modal-overlay">
                <div class="modal-content-split">
                    <div class="modal-image-section">
                        <img src="${API_BASE_URL}${escape(photoUrl)}" class="modal-large-image" />
                    </div>
                    <div class="modal-comment-section">
                        <div class="modal-header">
                            <h3>Commentaires</h3>
                            <button id="closeModalBtn" class="button syntax-cancel">Fermer</button>
                        </div>
                        <div class="comment-list" id="commentListContainer">
                            ${comments.length === 0
            ? '<p class="any">Aucun commentaire.</p>'
            : comments.map(c => `
                                    <div class="comment-item">
                                        <span class="comment-author">${escape(c.user_name)}</span>
                                        <p class="comment-text">${escape(c.content)}</p>
                                    </div>
                                `).join('')}
                        </div>
                        ${permissionLevel >= PERM.COMMENT ? `
                            <form id="commentForm" class="comment-form">
                                <textarea id="commentInput" placeholder="Écrire un commentaire..." required></textarea>
                                <button type="submit" class="button">Publier</button>
                            </form>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    closeModal() {
        const modal = document.getElementById('photoModalOverlay');
        if (modal) modal.remove();
    }

    bindCloseModal() {
        const btn = document.getElementById('closeModalBtn');
        const overlay = document.getElementById('photoModalOverlay');

        if (btn) btn.addEventListener('click', () => this.closeModal());
        if (overlay) overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal();
        });
    }

    bindSubmitComment(handler) {
        const form = document.getElementById('commentForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('commentInput');
            handler(input.value);
        });
    }

    bindDeletePhoto(handler) {
        const gallery = document.getElementById('photoGallery');
        if (!gallery) return;

        gallery.querySelectorAll('.delete-photo-btn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                event.stopPropagation();
                const photoId = event.currentTarget.getAttribute('data-photo-id');
                if (confirm('Supprimer cette photo ?')) {
                    handler(photoId);
                }
            });
        });
    }

    renderUploadForm() {
        this.appMain.innerHTML = `
            <div class="containerV">
                <h2>Uploader une photo</h2>
                <div id="photoDropZone" class="drop-zone">
                    <p>Glissez-déposez une image ici ou cliquez pour sélectionner</p>
                    <input type="file" id="photoFileInput" accept="image/*" class="hidden" />
                </div>
                <div class="actions-group containerV">
                    <button type="button" id="submitPhotoBtn" class="button">Uploader</button>
                    <button type="button" id="cancelUploadBtn" class="button syntax-cancel">Annuler</button>
                </div>
            </div>
        `;
    }

    renderImagePreview(zoneElement, mediaFile) {
        if (!mediaFile.type.startsWith('image/')) return;

        Array.from(zoneElement.childNodes).forEach(node => {
            if (node.tagName !== 'INPUT') node.remove();
        });

        const img = document.createElement('img');
        img.src = URL.createObjectURL(mediaFile);
        img.className = 'photo';
        zoneElement.appendChild(img);
    }

    bindPhotoDropZone() {
        const dropZone  = document.getElementById('photoDropZone');
        const fileInput = document.getElementById('photoFileInput');
        if (!dropZone || !fileInput) return;

        dropZone.addEventListener('click', (event) => {
            if (event.target !== fileInput && event.target.tagName !== 'IMG') fileInput.click();
        });

        fileInput.addEventListener('change', (event) => {
            if (event.target.files.length > 0) this.renderImagePreview(dropZone, event.target.files[0]);
        });

        ['dragover', 'dragleave', 'dragend', 'drop'].forEach(eventType => {
            dropZone.addEventListener(eventType, (event) => {
                event.preventDefault();
                dropZone.classList.toggle('dragover', eventType === 'dragover');
                if (eventType === 'drop' && event.dataTransfer.files.length > 0) {
                    fileInput.files = event.dataTransfer.files;
                    this.renderImagePreview(dropZone, event.dataTransfer.files[0]);
                }
            });
        });
    }

    bindSubmitPhoto(handler) {
        const submitBtn = document.getElementById('submitPhotoBtn');
        const fileInput = document.getElementById('photoFileInput');
        if (submitBtn && fileInput) {
            submitBtn.addEventListener('click', () => {
                if (fileInput.files.length > 0) handler(fileInput.files[0]);
                else alert('Aucun fichier sélectionné.');
            });
        }
    }

    bindCancelUpload(handler) {
        const btn = document.getElementById('cancelUploadBtn');
        if (btn) btn.addEventListener('click', () => handler());
    }
}