import { escape }       from '../../core/sanitize.js';
import { BaseView }     from '../../core/BaseView.js';
import { PERM, permissionLabel } from '../../core/Permission.js';

export class AlbumDetailView extends BaseView {
    renderDetail(album) {
        const perm  = Number(album.user_permission);
        const badge = permissionLabel(perm);

        const visibilityUI = perm >= PERM.OWNER ? `
            <div class="visibility-edit-container">
                <select id="updateVisibilitySelect">
                    <option value="public" ${album.visibility === 'public' ? 'selected' : ''}>Public</option>
                    <option value="private" ${album.visibility === 'private' ? 'selected' : ''}>Privé</option>
                </select>
            </div>
        ` : `<p>Visibilité : ${escape(album.visibility === 'public' ? 'Public' : 'Privé')}</p>`;

        this.appMain.innerHTML = `
        <div class="containerV">
            <div class="detail-header">
                <button id="backToListBtn" class="button">Retour aux albums</button>
            </div>
            
            <article class="album-detail-card containerV" id="albumCardContainer">
                <div class="space-btw">
                    
                    <div class="album-detail-info containerH">
                        <h3>${escape(album.title || album.name)}</h3>
                    </div>
                    
                    <div id="descriptionArea" class="column-layout">
                        ${album.description ? `<p id="descriptionText">${escape(album.description)}</p>` : ''}
                        ${perm >= PERM.MODIFY ? `<button type="button" id="editDescriptionBtn" class="button">Modifier la description</button>` : ''}
                    </div>

                    <div class="album-detail-actions">
                        <span class="permission-badge ${badge.cls}">${badge.text}</span>
                        ${visibilityUI}
                        ${perm >= PERM.OWNER ? `<button type="button" id="manageAccessBtn" class="button">Gérer les accès</button>` : ''}
                    </div>
                    
                </div>
            </article>

            <div id="actionArea" class="actions-group">
                ${perm >= PERM.MODIFY ? `<button id="addPhotoBtn" class="button">Uploader une photo</button>` : ''}
            </div>
            
            <section id="photoGallery" class="photo-gallery">
                <p class="loading-text">Chargement des photos...</p>
            </section>
        </div>
        `;
    }

    bindUpdateVisibility(handler) {
        const select = document.getElementById('updateVisibilitySelect');
        if (select) {
            select.addEventListener('change', (event) => handler(event.target.value));
        }
    }

    bindEditDescription(album, handler) {
        const editBtn = document.getElementById('editDescriptionBtn');
        if (!editBtn) return;

        editBtn.addEventListener('click', () => {
            const descriptionArea = document.getElementById('descriptionArea');
            const actionArea      = document.getElementById('actionArea');

            descriptionArea.innerHTML = `
                <label for="descriptionInput">Nouvelle description :</label>
                <textarea id="descriptionInput" rows="4"></textarea>
            `;
            document.getElementById('descriptionInput').value = album.description || '';

            actionArea.innerHTML = `
                <button type="button" id="saveDescriptionBtn" class="button">Sauvegarder</button>
                <button type="button" id="cancelEditBtn" class="button syntax-cancel">Annuler</button>
            `;

            document.getElementById('saveDescriptionBtn').addEventListener('click', () => {
                handler(document.getElementById('descriptionInput').value);
            });

            document.getElementById('cancelEditBtn').addEventListener('click', () => {
                this.renderDetail(album);
                this.bindEditDescription(album, handler);
            });
        });
    }

    bindBackToList(handler) {
        const btn = document.getElementById('backToListBtn');
        if (btn) btn.addEventListener('click', () => handler());
    }

    bindAddPhoto(handler) {
        const btn = document.getElementById('addPhotoBtn');
        if (btn) btn.addEventListener('click', () => handler());
    }

    bindManageAccess(handler) {
        document.getElementById('manageAccessBtn')?.addEventListener('click', () => handler());
    }
}