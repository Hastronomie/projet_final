import { API_BASE_URL } from '../../config.js';

export class PhotoModel {
    #token() {
        return localStorage.getItem('authToken') ?? '';
    }

    async fetchByAlbumId(albumId) {
        const response = await fetch(`${API_BASE_URL}/photos?album_id=${albumId}`);
        const text = await response.text();
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = JSON.parse(text);
        return Array.isArray(data) ? data : [];
    }

    async uploadPhoto(formData) {
        const response = await fetch(`${API_BASE_URL}/photos`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Erreur serveur 500.' }));
            throw new Error(errorData.error);
        }
        return await response.json();
    }

    async deletePhoto(photoId) {
        const response = await fetch(`${API_BASE_URL}/photos/${photoId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Erreur serveur 500.' }));
            throw new Error(errorData.error);
        }
        return await response.json();
    }

    async fetchComments(photoId) {
        const response = await fetch(`${API_BASE_URL}/photos/${photoId}/comments`, {
            headers: {
                'Authorization': `Bearer ${this.#token()}`
            }
        });
        if (!response.ok) throw new Error('Échec du chargement des commentaires.');
        return await response.json();
    }

    async postComment(photoId, content) {
        const response = await fetch(`${API_BASE_URL}/photos/${photoId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.#token()}`
            },
            body: JSON.stringify({ content })
        });
        if (!response.ok) throw new Error('Échec de la publication du commentaire.');
        return await response.json();
    }
}