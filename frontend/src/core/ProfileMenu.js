import { escape }       from './sanitize.js';
import { API_BASE_URL } from '../../config.js';

export class ProfileMenu {
    constructor() {
        this.menuWrapper = null;
    }

    async #fetchCurrentUser() {
        const token = localStorage.getItem('authToken') ?? '';
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return null;
        return await response.json();
    }

    #getInitials(name) {
        return (name ?? '')
            .split(' ')
            .map(w => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }

    #getAvatarHtml(user, size = 32) {
        if (user.photo) {
            return `<img src="${API_BASE_URL}${escape(user.photo)}"
                         class="avatarHTML"
                         style="width:${size}px; height:${size}px;">`;
        }
        return `<div class="noAvatarHTML"
                     style="width:${size}px; height:${size}px; font-size:${Math.round(size * 0.38)}px;">
                    ${escape(this.#getInitials(user.name))}
                </div>`;
    }

    async initialize(logoutCallback) {
        this.menuWrapper = document.getElementById('profileMenuWrapper');
        if (!this.menuWrapper) return;

        const user = await this.#fetchCurrentUser();
        if (!user) return;

        this.menuWrapper = document.getElementById('profileMenuWrapper');
        if (!this.menuWrapper) return;

        this.menuWrapper.innerHTML = `
            <div class="profile-menu-container">
                <button id="profileMenuBtn" class="button profil-btn">
                    ${this.#getAvatarHtml(user, 32)}
                    <span>${escape(user.username || user.name)}</span>
                    <span class="dropdown-arrow">▼</span>
                </button>
                <div id="profileDropdown" class="dropdown" style="display:none;">
                    <div class="containerH">
                        ${this.#getAvatarHtml(user, 48)}
                        <div>
                            <div class="infoUser">${escape(user.name)}</div>
                            ${user.username ? `<div class="police-m">@${escape(user.username)}</div>` : ''}
                            ${user.pronoun  ? `<div class="police-m">${escape(user.pronoun)}</div>`   : ''}
                        </div>
                    </div>
                    <button id="profileLogoutBtn" class="button">Se déconnecter</button>
                </div>
            </div>`;

        this.#bindEvents(logoutCallback);
    }

    #bindEvents(logoutCallback) {
        const triggerBtn = document.getElementById('profileMenuBtn');
        const dropdown   = document.getElementById('profileDropdown');
        const logoutBtn  = document.getElementById('profileLogoutBtn');

        if (!triggerBtn || !dropdown || !logoutBtn) return;

        triggerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });

        dropdown.addEventListener('click', (e) => e.stopPropagation());

        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });

        logoutBtn.addEventListener('click', () => logoutCallback());
    }

    reset() {
        if (this.menuWrapper) this.menuWrapper.innerHTML = '';
        this.menuWrapper = null;
    }
}