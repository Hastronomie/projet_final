import { AuthController }  from '../controllers/AuthController.js';
import { AlbumController } from '../controllers/AlbumController.js';
import { AuthModel }       from '../models/AuthModel.js';
import { NavSearch }       from './NavSearch.js';

export class Router {
    constructor() {
        this.appMain        = document.getElementById('appMain');
        this.appNav         = document.getElementById('appNav');
        this.authModel      = new AuthModel();
        this.authController = new AuthController();
    }

    start() {
        window.addEventListener('hashchange', () => this.route());
        this.route();
    }

    async route() {
        const hashPath        = window.location.hash.slice(1).toLowerCase() || '/';
        const isAuthPage      = hashPath === 'login' || hashPath === 'register';
        const isAuthenticated = this.authModel.isAuthenticated();

        this.appMain.innerHTML = '';
        this.manageNavigation(isAuthenticated, isAuthPage);

        if (!isAuthenticated && !isAuthPage) {
            window.location.hash = 'login';
            return;
        }

        this.dispatch(hashPath);
    }

    manageNavigation(isAuthenticated, isAuthPage) {
        if (isAuthenticated && !isAuthPage) {
            this.appNav.classList.remove('hidden');
            this.appNav.style.display = 'flex';

            // Recherche utilisateurs
            const navSearch = new NavSearch();
            navSearch.reset();
            navSearch.initialize();

            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                const freshBtn = logoutBtn.cloneNode(true);
                logoutBtn.replaceWith(freshBtn);
                freshBtn.addEventListener('click', () => this.authController.logout());
            }
        } else {
            this.appNav.classList.add('hidden');
            this.appNav.style.display = 'none';
        }
    }

    dispatch(hashPath) {
        switch (hashPath) {
            case 'login':
                new AuthController().initializeLogin();
                break;
            case 'register':
                new AuthController().initializeRegister();
                break;
            case '/':
            case 'albums':
                new AlbumController().initialize();
                break;
        }
    }
}