import { API_BASE_URL } from '../../config.js';

export class AuthModel {
    constructor() {
        this.apiUrl = 'http://localhost:8000/auth';
    }

    async authenticate(credentials) {
        try {
            const response = await fetch(this.apiUrl + '/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Login failed');
            }

            const data = await response.json();
            return data.token;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async register(credentials) {
        try {
            const response = await fetch(this.apiUrl + '/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Registration failed');
            }

            const data = await response.json();
            return data.token;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    logout() {
        localStorage.removeItem('authToken');
    }

    isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }
}