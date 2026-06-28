import { API_BASE_URL } from '../../config.js';

export class AlbumModel {
    #token() {
        return localStorage.getItem('authToken') ?? '';
    }

    #authHeaders() {
        return { 'Authorization': `Bearer ${this.#token()}` };
    }

    constructor() {
        this.apiUrl = `${API_BASE_URL}/albums`;
    }

    async fetchAll() {
        const response = await fetch(this.apiUrl, {
            headers: this.#authHeaders(),
            cache: 'no-store'
        });
        const text = await response.text();
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = JSON.parse(text);
        return Array.isArray(data) ? data : [];
    }

    async fetchById(albumId) {
        const response = await fetch(`${this.apiUrl}/${albumId}`, {
            headers: this.#authHeaders(),
            cache: 'no-store'
        });
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        return await response.json();
    }

    async createAlbum(albumData) {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...this.#authHeaders() },
            body: JSON.stringify(albumData)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Échec création album');
        }
        return await response.json();
    }

    async deleteAlbum(albumId) {
        const response = await fetch(`${this.apiUrl}/${albumId}`, {
            method: 'DELETE',
            headers: this.#authHeaders()
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Échec suppression');
        }
        return await response.json();
    }

    async updateDescription(albumId, description) {
        const formData = new URLSearchParams();
        formData.append('description', description);

        const response = await fetch(`${this.apiUrl}/${albumId}/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                ...this.#authHeaders()
            },
            body: formData
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Erreur HTTP' }));
            throw new Error(err.error || 'Échec mise à jour');
        }
        return await response.json();
    }

    async invite(albumId, email, permission) {
        const response = await fetch(`${this.apiUrl}/${albumId}/invite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...this.#authHeaders() },
            // Substitution : Envoi de l'attribut email
            body: JSON.stringify({ email: email, permission: Number(permission) })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Échec invitation');
        }
        return await response.json();
    }

    async getAlbumUsers(albumId) {
        const response = await fetch(`${this.apiUrl}/${albumId}/users`, {
            headers: this.#authHeaders(),
            cache: 'no-store'
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Échec récupération utilisateurs');
        }
        return await response.json();
    }

    async updateUserAccess(albumId, userId, permission) {
        const response = await fetch(`${this.apiUrl}/${albumId}/access/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...this.#authHeaders()
            },
            body: JSON.stringify({ permission: Number(permission) })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Erreur HTTP critique.' }));
            throw new Error(err.error || 'Échec de la modification des accès.');
        }

        return await response.json();
    }

    async removeUserAccess(albumId, userId) {
        const response = await fetch(`${this.apiUrl}/${albumId}/access/${userId}`, {
            method: 'DELETE',
            headers: this.#authHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Erreur HTTP critique.' }));
            throw new Error(err.error || 'Échec de la suppression des accès.');
        }

        return await response.json();
    }

    async updateVisibility(albumId, visibility) {
        const formData = new URLSearchParams();
        formData.append('visibility', visibility);

        const response = await fetch(`${this.apiUrl}/${albumId}/visibility`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                ...this.#authHeaders()
            },
            body: formData
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Erreur HTTP critique.' }));
            throw new Error(err.error || 'Échec de modification de visibilité');
        }
        return await response.json();
    }
}