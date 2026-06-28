import { AuthModel } from '../models/AuthModel.js';
import { AuthView }  from '../views/templates/AuthView.js';

export class AuthController {
    constructor() {
        this.authModel = new AuthModel();
        this.authView  = new AuthView();
    }

    initializeLogin() {
        this.authView.renderLoginForm();
        this.authView.bindLoginSubmit(this.handleLogin.bind(this));
    }

    initializeRegister() {
        this.authView.renderRegisterForm();
        this.authView.bindRegisterSubmit(this.handleRegister.bind(this));
    }

    async handleLogin(credentials) {
        try {
            const token = await this.authModel.authenticate(credentials);
            localStorage.setItem('authToken', token);
            window.location.hash = 'albums';
        } catch (error) {
            this.authView.renderError(error.message || 'Login failed');
        }
    }

    async handleRegister(credentials) {
        try {
            const token = await this.authModel.register(credentials);
            localStorage.setItem('authToken', token);
            window.location.hash = 'albums';
        } catch (error) {
            this.authView.renderError(error.message || 'Registration failed');
        }
    }

    bindLogoutButton() {
        const logoutBtn = document.getElementById('logoutBtn'); // Vérifiez que votre bouton possède bien cet ID
        if (logoutBtn) {
            const newBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    logout() {
        localStorage.removeItem('authToken');
        window.location.hash = 'login';
        window.location.reload();
    }
}