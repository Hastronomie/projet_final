import { API_BASE_URL } from '../../../config.js';
import { escape }       from '../../core/sanitize.js';
import { BaseView }     from '../../core/BaseView.js';
import { PERM, permissionLabel } from '../../core/Permission.js';

export class AlbumListView extends BaseView {
    renderList(albums) {
        let htmlContent = `
            <div class="containerV">
                <div class="albums-container">
                    <div class="albums-header space-btw">
                        <h1>Albums</h1>
                        <button id="goToCreateAlbumBtn" class="button">Ajouter un album</button>
                    </div>
                    <div class="albums-grid">
        `;

        albums.forEach(album => {
            const perm  = Number(album.user_permission);
            const badge = permissionLabel(perm);

            const visibilityClass = album.visibility === 'public' ? 'visibility--public' : 'visibility--private';
            const visibilityText  = album.visibility === 'public' ? 'Public' : 'Privé';
            const visibilityBadge = `<span class="visibility-badge ${visibilityClass}">${escape(visibilityText)}</span>`;

            const thumbnail = album.last_photo
                ? `<div class="album-card-image-container">
                       <img src="${API_BASE_URL}${escape(album.last_photo)}" alt="Aperçu ${escape(album.name)}" class="album-card-image">
                   </div>`
                : `<div class="album-card-image-container any-photo">Aucune photo</div>`;

            htmlContent += `
                <article class="album-card" data-id="${escape(album.id)}">
                    ${thumbnail}
                    <div class="album-card-content">
                        <div class="space-btw">
                            <h2>${escape(album.title || album.name)}</h2>
                            <span class="permission-badge ${badge.cls}">${badge.text}</span>
                        </div>
                        
                        <div class="visibility-container" style="margin-bottom: 10px;">
                            ${visibilityBadge}
                        </div>

                        <div class="actions-group">
                            <button class="action-view-btn button">Voir les détails</button>
                            ${perm >= PERM.OWNER ? `<button class="action-delete-btn button syntax-cancel">Supprimer</button>` : ''}
                        </div>
                    </div>
                </article>
            `;
        });

        htmlContent += `</div></div></div>`;
        this.appMain.innerHTML = htmlContent;
    }

    bindGoToCreate(handler) {
        const button = document.getElementById('goToCreateAlbumBtn');
        if (button) button.addEventListener('click', () => handler());
    }

    bindViewAlbum(handler) {
        this.appMain.querySelectorAll('.action-view-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const albumId = event.target.closest('.album-card').getAttribute('data-id');
                handler(albumId);
            });
        });
    }

    bindDeleteAlbum(handler) {
        this.appMain.querySelectorAll('.action-delete-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const albumId = event.target.closest('.album-card').getAttribute('data-id');
                if (confirm('Voulez-vous vraiment supprimer cet album ?')) {
                    handler(albumId);
                }
            });
        });
    }
}