import { BaseView } from '../../core/BaseView.js';

export class AlbumCreateView extends BaseView {
    renderCreateAlbumForm() {
        this.appMain.innerHTML = `
            <div class="basic-container">
                <h2>Créer un nouvel album</h2>
                <form id="createAlbumForm">
                    <div class="input-group">
                        <label for="albumNameInput">Nom de l'album</label>
                        <input type="text" id="albumNameInput" required />
                    </div>
                    <div class="input-group">
                        <label>Visibilité</label>
                        <div class="toggle-group" id="visibilityToggleGroup">
                            <button type="button" class="toggle-btn is-active" data-value="public">Public</button>
                            <button type="button" class="toggle-btn" data-value="private">Privé</button>
                        </div>
                        <input type="hidden" id="albumVisibilityInput" value="public" required />
                    </div>
                    <div class="actions-group">
                        <button type="submit" class="submit button">Créer</button>
                        <button type="button" id="cancelCreateAlbumBtn" class="button syntax-cancel">Annuler</button>
                    </div>
                </form>
            </div>
        `;
    }

    bindVisibilityToggle() {
        const toggleBtns = this.appMain.querySelectorAll('#visibilityToggleGroup .toggle-btn');
        const hiddenInput = document.getElementById('albumVisibilityInput');
        if (!toggleBtns.length || !hiddenInput) return;

        toggleBtns.forEach(btn => {
            btn.addEventListener('click', (event) => {
                toggleBtns.forEach(b => b.classList.remove('is-active'));
                const target = event.currentTarget;
                target.classList.add('is-active');
                hiddenInput.value = target.getAttribute('data-value');
            });
        });
    }

    bindCreateAlbumSubmit(handler) {
        const form = document.getElementById('createAlbumForm');
        if (!form) return;
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            handler({
                name:       document.getElementById('albumNameInput').value,
                visibility: document.getElementById('albumVisibilityInput').value
            });
        });
    }

    bindCancelCreate(handler) {
        const btn = document.getElementById('cancelCreateAlbumBtn');
        if (btn) btn.addEventListener('click', () => handler());
    }
}