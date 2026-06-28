// import { API_BASE_URL } from '../../../config.js';
// import { escape }       from '../../core/sanitize.js';
//
// const PERM = { READ: 1, MODIFY: 3, COMMENT: 5, OWNER: 10 };
//
// function permissionLabel(p) {
//     const n = Number(p);
//     if (n >= PERM.OWNER)   return { text: 'Propriétaire', cls: 'badge--owner'   };
//     if (n >= PERM.COMMENT) return { text: 'Commentaire',  cls: 'badge--comment' };
//     if (n >= PERM.MODIFY)  return { text: 'Modification', cls: 'badge--modify'  };
//     return                 { text: 'Lecture',        cls: 'badge--read'    };
// }
//
// export class AlbumView {
//     constructor() {
//         this.appMain = document.getElementById('appMain');
//     }
//
//     renderList(albums) {
//         let htmlContent = `
//             <div class="containerV">
//                 <div class="albums-container">
//                     <div class="albums-header space-btw">
//                         <h1>Albums</h1>
//                         <button id="goToCreateAlbumBtn" class="button">Ajouter un album</button>
//                     </div>
//                     <div class="albums-grid">
//         `;
//
//         albums.forEach(album => {
//             const perm  = Number(album.user_permission);
//             const badge = permissionLabel(perm);
//
//             const visibilityClass = album.visibility === 'public' ? 'visibility--public' : 'visibility--private';
//             const visibilityText  = album.visibility === 'public' ? 'Public' : 'Privé';
//             const visibilityBadge = `<span class="visibility-badge ${visibilityClass}">${escape(visibilityText)}</span>`;
//
//             const thumbnail = album.last_photo
//                 ? `<div class="album-card-image-container">
//                        <img src="${API_BASE_URL}${escape(album.last_photo)}" alt="Aperçu ${escape(album.name)}" class="album-card-image">
//                    </div>`
//                 : `<div class="album-card-image-container any-photo">Aucune photo</div>`;
//
//             htmlContent += `
//                 <article class="album-card" data-id="${escape(album.id)}">
//                     ${thumbnail}
//                     <div class="album-card-content">
//                         <div class="space-btw">
//                             <h2>${escape(album.title || album.name)}</h2>
//                             <span class="permission-badge ${badge.cls}">${badge.text}</span>
//                         </div>
//
//                         <div class="visibility-container" style="margin-bottom: 10px;">
//                             ${visibilityBadge}
//                         </div>
//
//                         <div class="actions-group">
//                             <button class="action-view-btn button">Voir les détails</button>
//                             ${perm >= PERM.OWNER ? `<button class="action-delete-btn button syntax-cancel">Supprimer</button>` : ''}
//                         </div>
//                     </div>
//                 </article>
//             `;
//         });
//
//         htmlContent += `</div></div></div>`;
//         this.appMain.innerHTML = htmlContent;
//     }
//
//     bindGoToCreate(handler) {
//         const button = document.getElementById('goToCreateAlbumBtn');
//         if (button) button.addEventListener('click', () => handler());
//     }
//
//     bindViewAlbum(handler) {
//         this.appMain.querySelectorAll('.action-view-btn').forEach(button => {
//             button.addEventListener('click', (event) => {
//                 const albumId = event.target.closest('.album-card').getAttribute('data-id');
//                 handler(albumId);
//             });
//         });
//     }
//
//     renderCreateAlbumForm() {
//         this.appMain.innerHTML = `
//             <div class="basic-container">
//                 <h2>Créer un nouvel album</h2>
//                 <form id="createAlbumForm">
//                     <div class="input-group">
//                         <label for="albumNameInput">Nom de l'album</label>
//                         <input type="text" id="albumNameInput" required />
//                     </div>
//                     <div class="input-group">
//                         <label>Visibilité</label>
//                         <div class="toggle-group" id="visibilityToggleGroup">
//                             <button type="button" class="toggle-btn is-active" data-value="public">Public</button>
//                             <button type="button" class="toggle-btn" data-value="private">Privé</button>
//                         </div>
//                         <input type="hidden" id="albumVisibilityInput" value="public" required />
//                     </div>
//                     <div class="actions-group">
//                         <button type="submit" class="submit button">Créer</button>
//                         <button type="button" id="cancelCreateAlbumBtn" class="button syntax-cancel">Annuler</button>
//                     </div>
//                 </form>
//             </div>
//         `;
//     }
//
//     bindVisibilityToggle() {
//         const toggleBtns = this.appMain.querySelectorAll('#visibilityToggleGroup .toggle-btn');
//         const hiddenInput = document.getElementById('albumVisibilityInput');
//         if (!toggleBtns.length || !hiddenInput) return;
//
//         toggleBtns.forEach(btn => {
//             btn.addEventListener('click', (event) => {
//                 toggleBtns.forEach(b => b.classList.remove('is-active'));
//                 const target = event.currentTarget;
//                 target.classList.add('is-active');
//                 hiddenInput.value = target.getAttribute('data-value');
//             });
//         });
//     }
//
//     bindCreateAlbumSubmit(handler) {
//         const form = document.getElementById('createAlbumForm');
//         if (!form) return;
//         form.addEventListener('submit', (event) => {
//             event.preventDefault();
//             handler({
//                 name:       document.getElementById('albumNameInput').value,
//                 visibility: document.getElementById('albumVisibilityInput').value
//             });
//         });
//     }
//
//     bindCancelCreate(handler) {
//         const btn = document.getElementById('cancelCreateAlbumBtn');
//         if (btn) btn.addEventListener('click', () => handler());
//     }
//
//     bindDeleteAlbum(handler) {
//         this.appMain.querySelectorAll('.action-delete-btn').forEach(button => {
//             button.addEventListener('click', (event) => {
//                 const albumId = event.target.closest('.album-card').getAttribute('data-id');
//                 if (confirm('Voulez-vous vraiment supprimer cet album ?')) {
//                     handler(albumId);
//                 }
//             });
//         });
//     }
//
//     renderDetail(album) {
//         const perm  = Number(album.user_permission);
//         const badge = permissionLabel(perm);
//
//         const visibilityUI = perm >= PERM.OWNER ? `
//             <div class="visibility-edit-container">
//                 <select id="updateVisibilitySelect">
//                     <option value="public" ${album.visibility === 'public' ? 'selected' : ''}>Public</option>
//                     <option value="private" ${album.visibility === 'private' ? 'selected' : ''}>Privé</option>
//                 </select>
//             </div>
//         ` : `<p>Visibilité : ${escape(album.visibility === 'public' ? 'Public' : 'Privé')}</p>`;
//
//         this.appMain.innerHTML = `
//         <div class="containerV">
//             <div class="detail-header">
//                 <button id="backToListBtn" class="button">Retour aux albums</button>
//             </div>
//             <article class="album-detail-card containerV" id="albumCardContainer">
//
//                 <div class="space-btw">
//                     <div class="album-detail-info">
//                         <h2>${escape(album.title || album.name)}</h2>
//                         ${visibilityUI}
//                     </div>
//
//                     <div class="album-detail-actions">
//                         <span class="permission-badge ${badge.cls}">${badge.text}</span>
//                         ${perm >= PERM.MODIFY ? `<button id="addPhotoBtn" class="button">Uploader une photo</button>` : ''}
//                     </div>
//                 </div>
//
//                 <div id="descriptionArea">
//                     ${album.description ? `<p id="descriptionText">${escape(album.description)}</p>` : ''}
//                 </div>
//             </article>
//             <div id="actionArea" class="actions-group">
//                 ${perm >= PERM.MODIFY ? `<button type="button" id="editDescriptionBtn" class="button">Modifier la description</button>` : ''}
//                 ${perm >= PERM.OWNER ? `<button type="button" id="manageAccessBtn" class="button">Gérer les accès</button>` : ''}
//             </div>
//             <section id="photoGallery" class="photo-gallery">
//                 <p class="loading-text">Chargement des photos...</p>
//             </section>
//         </div>
//         `;
//     }
//
//     renderAccessManager(users) {
//         this.appMain.innerHTML = `
//             <div class="containerV">
//                 <div class="detail-header">
//                     <button id="backToAlbumBtn" class="button">← Retour à l'album</button>
//                 </div>
//                 <h2>Gestion des accès</h2>
//
//                 <div class="basic-container" style="margin-bottom: 20px;">
//                     <h3>Ajouter un accès</h3>
//                     <form id="inviteForm" class="containerH" style="align-items: flex-end;">
//                         <div class="input-group">
//                             <label for="inviteEmailInput">Email de l'utilisateur</label>
//                             <input type="email" id="inviteEmailInput" required placeholder="utilisateur@email.com" />
//                         </div>
//                         <div class="input-group">
//                             <label for="invitePermission">Niveau d'accès</label>
//                             <select id="invitePermission">
//                                 <option value="1">Lecture</option>
//                                 <option value="3">Modification</option>
//                                 <option value="5">Commentaire</option>
//                             </select>
//                         </div>
//                         <button type="submit" class="button" id="inviteSubmitBtn">Autoriser</button>
//                     </form>
//                 </div>
//
//                 <section class="containerV">
//                     <h3>Utilisateurs ayant accès</h3>
//                     <ul class="containerV">
//                         ${users.map(u => {
//             const label = permissionLabel(u.permission);
//             const actions = Number(u.permission) < PERM.OWNER ? `
//                                 <div class="access-actions containerH">
//                                     <select id="perm-select-${escape(u.id)}">
//                                         <option value="1" ${Number(u.permission) === 1 ? 'selected' : ''}>Lecture</option>
//                                         <option value="3" ${Number(u.permission) === 3 ? 'selected' : ''}>Modification</option>
//                                         <option value="5" ${Number(u.permission) === 5 ? 'selected' : ''}>Commentaire</option>
//                                     </select>
//                                     <button class="small-action-btn edit-access-btn" data-user-id="${escape(u.id)}">Valider</button>
//                                     <button class="small-action-btn small-danger-btn remove-access-btn" data-user-id="${escape(u.id)}">Retirer</button>
//                                 </div>
//                             ` : '';
//
//             return `
//                                 <li class="space-btw basic-container">
//                                     <div class="containerH" style="justify-content: flex-start;">
//                                         <span>${escape(u.name)}</span>
//                                         <span class="permission-badge ${label.cls}">${label.text}</span>
//                                     </div>
//                                     ${actions}
//                                 </li>`;
//         }).join('')}
//                     </ul>
//                 </section>
//             </div>
//         `;
//     }
//
//     bindInviteSubmit(handler) {
//         const form = document.getElementById('inviteForm');
//         if (!form) return;
//
//         form.addEventListener('submit', (e) => {
//             e.preventDefault();
//             const email = document.getElementById('inviteEmailInput').value.trim();
//             const permission = document.getElementById('invitePermission').value;
//             handler(email, permission);
//         });
//     }
//
//     bindUpdateVisibility(handler) {
//         const select = document.getElementById('updateVisibilitySelect');
//         if (select) {
//             select.addEventListener('change', (event) => handler(event.target.value));
//         }
//     }
//
//     renderGallery(photos) {
//         const gallery = document.getElementById('photoGallery');
//         if (!gallery) return;
//
//         if (!photos.length) {
//             gallery.innerHTML = '<p class="loading-text">Aucune photo dans cet album.</p>';
//             return;
//         }
//
//         const trashIcon = `<span class="material-symbols-outlined">
//                                     delete_forever </span>`;
//
//         gallery.innerHTML = `
//             <div class="photos-grid">
//                 ${photos.map(photo => `
//                     <figure class="photo-item">
//                         <div class="photo-item-image-container action-open-photo" data-photo-id="${escape(photo.id)}">
//                             <img src="${API_BASE_URL}${escape(photo.alt)}" alt="${escape(photo.caption || '')}" class="photo-item-image" />
//                         </div>
//                         <button class="delete-photo-btn" data-photo-id="${escape(photo.id)}" title="Supprimer la photo">${trashIcon}</button>
//                     </figure>
//                 `).join('')}
//             </div>
//         `;
//     }
//
//     bindOpenPhoto(handler) {
//         const gallery = document.getElementById('photoGallery');
//         if (!gallery) return;
//
//         gallery.querySelectorAll('.action-open-photo').forEach(container => {
//             container.addEventListener('click', (event) => {
//                 const photoId = event.currentTarget.getAttribute('data-photo-id');
//                 handler(photoId);
//             });
//         });
//     }
//
//     renderPhotoModal(photoUrl, comments, permissionLevel) {
//         const modalHtml = `
//             <div id="photoModalOverlay" class="modal-overlay">
//                 <div class="modal-content-split">
//                     <div class="modal-image-section">
//                         <img src="${API_BASE_URL}${escape(photoUrl)}" class="modal-large-image" />
//                     </div>
//                     <div class="modal-comment-section">
//                         <div class="modal-header">
//                             <h3>Commentaires</h3>
//                             <button id="closeModalBtn" class="button syntax-cancel">Fermer</button>
//                         </div>
//                         <div class="comment-list" id="commentListContainer">
//                             ${comments.length === 0
//             ? '<p class="any">Aucun commentaire.</p>'
//             : comments.map(c => `
//                                     <div class="comment-item">
//                                         <span class="comment-author">${escape(c.user_name)}</span>
//                                         <p class="comment-text">${escape(c.content)}</p>
//                                     </div>
//                                 `).join('')}
//                         </div>
//                         ${permissionLevel >= PERM.COMMENT ? `
//                             <form id="commentForm" class="comment-form">
//                                 <textarea id="commentInput" placeholder="Écrire un commentaire..." required></textarea>
//                                 <button type="submit" class="button">Publier</button>
//                             </form>
//                         ` : ''}
//                     </div>
//                 </div>
//             </div>
//         `;
//
//         document.body.insertAdjacentHTML('beforeend', modalHtml);
//     }
//
//     closeModal() {
//         const modal = document.getElementById('photoModalOverlay');
//         if (modal) modal.remove();
//     }
//
//     bindCloseModal() {
//         const btn = document.getElementById('closeModalBtn');
//         const overlay = document.getElementById('photoModalOverlay');
//
//         if (btn) btn.addEventListener('click', () => this.closeModal());
//         if (overlay) overlay.addEventListener('click', (e) => {
//             if (e.target === overlay) this.closeModal();
//         });
//     }
//
//     bindSubmitComment(handler) {
//         const form = document.getElementById('commentForm');
//         if (!form) return;
//
//         form.addEventListener('submit', (e) => {
//             e.preventDefault();
//             const input = document.getElementById('commentInput');
//             handler(input.value);
//         });
//     }
//
//     bindDeletePhoto(handler) {
//         const gallery = document.getElementById('photoGallery');
//         if (!gallery) return;
//
//         gallery.querySelectorAll('.delete-photo-btn').forEach(btn => {
//             btn.addEventListener('click', (event) => {
//                 event.stopPropagation();
//                 const photoId = event.currentTarget.getAttribute('data-photo-id');
//                 if (confirm('Supprimer cette photo ?')) {
//                     handler(photoId);
//                 }
//             });
//         });
//     }
//
//     bindEditDescription(album, handler) {
//         const editBtn = document.getElementById('editDescriptionBtn');
//         if (!editBtn) return;
//
//         editBtn.addEventListener('click', () => {
//             const descriptionArea = document.getElementById('descriptionArea');
//             const actionArea      = document.getElementById('actionArea');
//
//             descriptionArea.innerHTML = `
//                 <label for="descriptionInput">Nouvelle description :</label>
//                 <textarea id="descriptionInput" rows="4"></textarea>
//             `;
//             document.getElementById('descriptionInput').value = album.description || '';
//
//             actionArea.innerHTML = `
//                 <button type="button" id="saveDescriptionBtn" class="button">Sauvegarder</button>
//                 <button type="button" id="cancelEditBtn" class="button syntax-cancel">Annuler</button>
//             `;
//
//             document.getElementById('saveDescriptionBtn').addEventListener('click', () => {
//                 handler(document.getElementById('descriptionInput').value);
//             });
//
//             document.getElementById('cancelEditBtn').addEventListener('click', () => {
//                 this.renderDetail(album);
//                 this.bindEditDescription(album, handler);
//             });
//         });
//     }
//
//     bindBackToList(handler) {
//         const btn = document.getElementById('backToListBtn');
//         if (btn) btn.addEventListener('click', () => handler());
//     }
//
//     bindAddPhoto(handler) {
//         const btn = document.getElementById('addPhotoBtn');
//         if (btn) btn.addEventListener('click', () => handler());
//     }
//
//     renderUploadForm() {
//         this.appMain.innerHTML = `
//             <div class="containerV">
//                 <h2>Uploader une photo</h2>
//                 <div id="photoDropZone" class="drop-zone">
//                     <p>Glissez-déposez une image ici ou cliquez pour sélectionner</p>
//                     <input type="file" id="photoFileInput" accept="image/*" class="hidden" />
//                 </div>
//                 <div class="actions-group containerV">
//                     <button type="button" id="submitPhotoBtn" class="button">Uploader</button>
//                     <button type="button" id="cancelUploadBtn" class="button syntax-cancel">Annuler</button>
//                 </div>
//             </div>
//         `;
//     }
//
//     renderImagePreview(zoneElement, mediaFile) {
//         if (!mediaFile.type.startsWith('image/')) return;
//
//         Array.from(zoneElement.childNodes).forEach(node => {
//             if (node.tagName !== 'INPUT') node.remove();
//         });
//
//         const img = document.createElement('img');
//         img.src = URL.createObjectURL(mediaFile);
//         img.className = 'photo';
//         zoneElement.appendChild(img);
//     }
//
//     bindPhotoDropZone() {
//         const dropZone  = document.getElementById('photoDropZone');
//         const fileInput = document.getElementById('photoFileInput');
//         if (!dropZone || !fileInput) return;
//
//         dropZone.addEventListener('click', (event) => {
//             if (event.target !== fileInput && event.target.tagName !== 'IMG') fileInput.click();
//         });
//
//         fileInput.addEventListener('change', (event) => {
//             if (event.target.files.length > 0) this.renderImagePreview(dropZone, event.target.files[0]);
//         });
//
//         ['dragover', 'dragleave', 'dragend', 'drop'].forEach(eventType => {
//             dropZone.addEventListener(eventType, (event) => {
//                 event.preventDefault();
//                 dropZone.classList.toggle('dragover', eventType === 'dragover');
//                 if (eventType === 'drop' && event.dataTransfer.files.length > 0) {
//                     fileInput.files = event.dataTransfer.files;
//                     this.renderImagePreview(dropZone, event.dataTransfer.files[0]);
//                 }
//             });
//         });
//     }
//
//     bindSubmitPhoto(handler) {
//         const submitBtn = document.getElementById('submitPhotoBtn');
//         const fileInput = document.getElementById('photoFileInput');
//         if (submitBtn && fileInput) {
//             submitBtn.addEventListener('click', () => {
//                 if (fileInput.files.length > 0) handler(fileInput.files[0]);
//                 else alert('Aucun fichier sélectionné.');
//             });
//         }
//     }
//
//     bindCancelUpload(handler) {
//         const btn = document.getElementById('cancelUploadBtn');
//         if (btn) btn.addEventListener('click', () => handler());
//     }
//
//     bindUpdateAccess(handler) {
//         this.appMain.querySelectorAll('.edit-access-btn').forEach(btn => {
//             btn.addEventListener('click', (event) => {
//                 const userId = event.currentTarget.getAttribute('data-user-id');
//                 const selectElement = document.getElementById(`perm-select-${userId}`);
//                 if (selectElement) {
//                     handler(userId, Number(selectElement.value));
//                 }
//             });
//         });
//     }
//
//     bindRemoveAccess(handler) {
//         this.appMain.querySelectorAll('.remove-access-btn').forEach(btn => {
//             btn.addEventListener('click', (event) => {
//                 const userId = event.currentTarget.getAttribute('data-user-id');
//                 if (confirm("Révoquer l'accès pour cet utilisateur ?")) {
//                     handler(userId);
//                 }
//             });
//         });
//     }
//
//     bindInviteSearch(searchHandler) {
//         const input   = document.getElementById('inviteSearchInput');
//         const results = document.getElementById('inviteSearchResults');
//         if (!input || !results) return;
//
//         let timer;
//         input.addEventListener('input', () => {
//             clearTimeout(timer);
//             const q = input.value.trim();
//             if (q.length < 2) {
//                 results.style.display = 'none';
//                 return;
//             }
//
//             timer = setTimeout(async () => {
//                 const users = await searchHandler(q);
//                 results.innerHTML = !users.length
//                     ? `<li class="any">Aucun résultat</li>`
//                     : users.map(u => `
//                         <li class="space-btw basic-container"
//                             data-id="${escape(u.id)}"
//                             data-name="${escape(u.name)}"
//                             style="cursor: pointer;">
//                             ${escape(u.name)}
//                         </li>`).join('');
//
//                 results.querySelectorAll('li[data-id]').forEach(li => {
//                     li.addEventListener('click', () => {
//                         document.getElementById('inviteUserId').value = li.dataset.id;
//                         document.getElementById('inviteSelectedUser').textContent = `Sélectionné : ${li.dataset.name}`;
//                         input.value = li.dataset.name;
//                         results.style.display = 'none';
//                     });
//                 });
//
//                 results.style.display = 'block';
//             }, 300);
//         });
//
//         document.addEventListener('click', (e) => {
//             if (!input.contains(e.target) && !results.contains(e.target)) {
//                 results.style.display = 'none';
//             }
//         });
//     }
//
//     bindBackToAlbum(handler) {
//         document.getElementById('backToAlbumBtn')?.addEventListener('click', () => handler());
//     }
//
//     bindManageAccess(handler) {
//         document.getElementById('manageAccessBtn')?.addEventListener('click', () => handler());
//     }
//
//     renderError(errorMessage) {
//         this.appMain.innerHTML = `
//             <div class="error-container">
//                 <h2>System Failure</h2>
//                 <p>${escape(errorMessage)}</p>
//             </div>
//         `;
//     }
// }