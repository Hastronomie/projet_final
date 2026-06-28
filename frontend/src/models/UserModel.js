import { API_BASE_URL } from '../../config.js';

export class UserModel {
    #token() {
        return localStorage.getItem('authToken') ?? '';
    }

    async searchUsers(query) {
        const response = await fetch(
            `${API_BASE_URL}/users?q=${encodeURIComponent(query)}`,
            {
                headers: { 'Authorization': `Bearer ${this.#token()}` }
            }
        );

        const text = await response.text();
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

        const data = JSON.parse(text);
        return Array.isArray(data) ? data : [];
    }

    async addFriend(friendId) {
        const response = await fetch(`${API_BASE_URL}/users/friend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.#token()}`
            },
            body: JSON.stringify({ friend_id: Number(friendId) })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Erreur serveur.' }));
            throw new Error(err.error);
        }

        return await response.json();
    }
}