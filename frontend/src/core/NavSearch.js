import { UserModel } from '../models/UserModel.js';
import { escape }    from './sanitize.js';

const FRIENDSHIP = { NONE: 0, PENDING: 1, ACCEPTED: 2 };

export class NavSearch {
    constructor() {
        this.userModel     = new UserModel();
        this.input         = null;
        this.dropdown      = null;
        this.debounceTimer = null;
    }

    initialize() {
        this.input    = document.getElementById('userSearchInput');
        this.dropdown = document.getElementById('searchDropdown');
        if (!this.input || !this.dropdown) return;

        this.#applyDropdownStyle();
        this.#bindEvents();
    }

    reset() {
        const oldInput = document.getElementById('userSearchInput');
        if (!oldInput) return;

        const freshInput = oldInput.cloneNode(true);
        freshInput.value = '';
        oldInput.replaceWith(freshInput);

        const dropdown = document.getElementById('searchDropdown');
        if (dropdown) {
            dropdown.innerHTML     = '';
            dropdown.style.display = 'none';
        }
    }

    // ── Privé ─────────────────────────────────────────

    #applyDropdownStyle() {
        this.dropdown.style.cssText = `
            display: none;
            position: fixed;
            list-style: none;
            z-index: 9999;
            max-height: 300px;
            overflow-y: auto;
        `;
    }

    #positionDropdown() {
        const rect = this.input.getBoundingClientRect();
        this.dropdown.style.top   = `${rect.bottom + 4}px`;
        this.dropdown.style.left  = `${rect.left}px`;
        this.dropdown.style.width = `${rect.width}px`;
    }

    #friendshipLabel(status) {
        switch (Number(status)) {
            case FRIENDSHIP.ACCEPTED: return { text: '✓ Ami',         style: 'color:var(--success; font-size:var(--font-size-s);' };
            case FRIENDSHIP.PENDING:  return { text: '⏳ En attente', style: 'color: var(--placeholder);    font-size:var(--font-size-s);' };
            default:                  return null;
        }
    }

    #renderDropdown(users) {
        this.#positionDropdown();

        if (!users.length) {
            this.dropdown.innerHTML = `
                <li class="any">
                    Aucun résultat
                </li>`;
            this.dropdown.style.display = 'block';
            return;
        }

        this.dropdown.innerHTML = users.map(user => {
            const label  = this.#friendshipLabel(user.friendship_status);
            const action = label
                ? `<span style="${label.style}">${label.text}</span>`
                : `<button class="add-friend-btn button"
                           data-id="${escape(user.id)}">
                       + Ajouter
                   </button>`;

            return `
                <li class ="space-btw basic-container">
                    <span>${escape(user.name)}</span>
                    ${action}
                </li>`;
        }).join('');

        this.dropdown.querySelectorAll('.add-friend-btn').forEach(btn => {
            btn.addEventListener('click', () => this.#handleAddFriend(btn));
        });

        this.dropdown.style.display = 'block';
    }

    async #handleAddFriend(btn) {
        const friendId  = btn.getAttribute('data-id');
        btn.disabled    = true;
        btn.textContent = '…';
        try {
            await this.userModel.addFriend(friendId);
            const span = document.createElement('span');
            span.textContent   = '⏳ En attente';
            span.style.cssText = 'color: var(--placeholder);' +
                ' font-size:var(--font-size-s);';
            btn.replaceWith(span);
        } catch (err) {
            btn.disabled    = false;
            btn.textContent = '+ Ajouter';
            console.error('Erreur ajout ami:', err);
        }
    }

    #bindEvents() {
        this.input.addEventListener('input', () => {
            clearTimeout(this.debounceTimer);
            const query = this.input.value.trim();

            if (query.length < 2) {
                this.dropdown.style.display = 'none';
                this.dropdown.innerHTML     = '';
                return;
            }

            this.debounceTimer = setTimeout(async () => {
                try {
                    const users = await this.userModel.searchUsers(query);
                    this.#renderDropdown(users);
                } catch (err) {
                    console.error('Erreur recherche:', err);
                }
            }, 300);
        });

        window.addEventListener('resize', () => {
            if (this.dropdown?.style.display === 'block') {
                this.#positionDropdown();
            }
        });

        document.addEventListener('click', (e) => {
            if (!this.input?.contains(e.target) && !this.dropdown?.contains(e.target)) {
                this.dropdown.style.display = 'none';
            }
        });

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.dropdown.style.display = 'none';
        });
    }
}