import { escape }       from '../../core/sanitize.js';
import { BaseView }     from '../../core/BaseView.js';
import { PERM, permissionLabel } from '../../core/Permission.js';

export class AccessManagerView extends BaseView {
    renderAccessManager(users) {
        this.appMain.innerHTML = `
            <div class="containerV">
                <div class="detail-header">
                    <button id="backToAlbumBtn" class="button">← Retour à l'album</button>
                </div>
                <h2>Gestion des accès</h2>

                <div class="basic-container" style="margin-bottom: 20px;">
                    <h3>Ajouter un accès</h3>
                    <form id="inviteForm" class="containerH" style="align-items: flex-end;">
                        <div class="input-group">
                            <label for="inviteEmailInput">Email de l'utilisateur</label>
                            <input type="email" id="inviteEmailInput" required placeholder="utilisateur@email.com" />
                        </div>
                        <div class="input-group">
                            <label for="invitePermission">Niveau d'accès</label>
                            <select id="invitePermission">
                                <option value="1">Lecture</option>
                                <option value="3">Modification</option>
                                <option value="5">Commentaire</option>
                            </select>
                        </div>
                        <button type="submit" class="button" id="inviteSubmitBtn">Autoriser</button>
                    </form>
                </div>

                <section class="containerV">
                    <h3>Utilisateurs ayant accès</h3>
                    <ul class="containerV">
                        ${users.map(u => {
            const label = permissionLabel(u.permission);
            const actions = Number(u.permission) < PERM.OWNER ? `
                                <div class="access-actions containerH">
                                    <select id="perm-select-${escape(u.id)}">
                                        <option value="1" ${Number(u.permission) === 1 ? 'selected' : ''}>Lecture</option>
                                        <option value="3" ${Number(u.permission) === 3 ? 'selected' : ''}>Modification</option>
                                        <option value="5" ${Number(u.permission) === 5 ? 'selected' : ''}>Commentaire</option>
                                    </select>
                                    <button class="small-action-btn edit-access-btn" data-user-id="${escape(u.id)}">Valider</button>
                                    <button class="small-action-btn small-danger-btn remove-access-btn" data-user-id="${escape(u.id)}">Retirer</button>
                                </div>
                            ` : '';

            return `
                                <li class="space-btw basic-container">
                                    <div class="containerH" style="justify-content: flex-start;">
                                        <span>${escape(u.name)}</span>
                                        <span class="permission-badge ${label.cls}">${label.text}</span>
                                    </div>
                                    ${actions}
                                </li>`;
        }).join('')}
                    </ul>
                </section>
            </div>
        `;
    }

    bindInviteSubmit(handler) {
        const form = document.getElementById('inviteForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('inviteEmailInput').value.trim();
            const permission = document.getElementById('invitePermission').value;
            handler(email, permission);
        });
    }

    bindUpdateAccess(handler) {
        this.appMain.querySelectorAll('.edit-access-btn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                const userId = event.currentTarget.getAttribute('data-user-id');
                const selectElement = document.getElementById(`perm-select-${userId}`);
                if (selectElement) {
                    handler(userId, Number(selectElement.value));
                }
            });
        });
    }

    bindRemoveAccess(handler) {
        this.appMain.querySelectorAll('.remove-access-btn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                const userId = event.currentTarget.getAttribute('data-user-id');
                if (confirm("Révoquer l'accès pour cet utilisateur ?")) {
                    handler(userId);
                }
            });
        });
    }

    bindInviteSearch(searchHandler) {
        const input   = document.getElementById('inviteSearchInput');
        const results = document.getElementById('inviteSearchResults');
        if (!input || !results) return;

        let timer;
        input.addEventListener('input', () => {
            clearTimeout(timer);
            const q = input.value.trim();
            if (q.length < 2) {
                results.style.display = 'none';
                return;
            }

            timer = setTimeout(async () => {
                const users = await searchHandler(q);
                results.innerHTML = !users.length
                    ? `<li class="any">Aucun résultat</li>`
                    : users.map(u => `
                        <li class="space-btw basic-container"
                            data-id="${escape(u.id)}"
                            data-name="${escape(u.name)}"
                            style="cursor: pointer;">
                            ${escape(u.name)}
                        </li>`).join('');

                results.querySelectorAll('li[data-id]').forEach(li => {
                    li.addEventListener('click', () => {
                        document.getElementById('inviteUserId').value = li.dataset.id;
                        document.getElementById('inviteSelectedUser').textContent = `Sélectionné : ${li.dataset.name}`;
                        input.value = li.dataset.name;
                        results.style.display = 'none';
                    });
                });

                results.style.display = 'block';
            }, 300);
        });

        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !results.contains(e.target)) {
                results.style.display = 'none';
            }
        });
    }

    bindBackToAlbum(handler) {
        document.getElementById('backToAlbumBtn')?.addEventListener('click', () => handler());
    }
}