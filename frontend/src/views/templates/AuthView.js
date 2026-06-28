export class AuthView {
    constructor() {
        this.appMain = document.getElementById('appMain');
    }

    renderLoginForm() {
        const htmlContent = `
            <div class="basic-container">
                <h2>Authentication</h2>
                <form id="loginForm">
                    <div class="input-group">
                        <label for="emailInput">Email</label>
                        <input type="email" id="emailInput" required />
                    </div>
                    <div class="input-group">
                        <label for="passwordInput">Mot de passe</label>
                        <input type="password" id="passwordInput" required />
                    </div>
                    <button type="submit" class="submit button">Connexion</button>
                    <p>OU</p>
                    <button type="button" id="navToRegisterBtn" 
                    class="register button">Inscription</button>
                </form>
                <div id="errorContainer" class="error-display"></div>
            </div>
        `;

        this.appMain.innerHTML = htmlContent;
        this.bindNavigationToRegister();
    }

    renderRegisterForm() {
        const htmlContent = `
            <div class="basic-container">
                <h2>Register</h2>
                <form id="registerForm">
                    <div class="input-group">
                        <label for="usernameInput">Pseudo</label>
                        <input type="text" id="usernameInput" required />
                    </div>
                    <div class="input-group">
                        <label for="emailInput">Email</label>
                        <input type="email" id="emailInput" required />
                    </div>
                    <div class="input-group">
                        <label for="pronounInput">Pronom</label>
                        <input type="text" id="pronounInput" required />
                    </div>
                    <div class="input-group">
                        <label for="passwordInput">Mot de passe</label>
                        <input type="password" id="passwordInput" required />
                    </div>
                    <div class="input-group">
                        <label for="confirmPasswordInput">Confirmer le mot de passe</label>
                        <input type="password" id="confirmPasswordInput" required />
                    </div>
                    <div class="containerH">
                        <button type="submit" class="submit button">
                        Enregistrer</button>
                        <p>OU</p>
                        <button type="button" id="navToLoginBtn" 
                        class="register button">Connexion</button>
                    </div>
                </form>
                <div id="errorContainer" class="error-display"></div>
            </div>
        `;

        this.appMain.innerHTML = htmlContent;
        this.bindNavigationToLogin();
    }

    bindLoginSubmit(handler) {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;

        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const credentials = {
                email: document.getElementById('emailInput').value,
                password: document.getElementById('passwordInput').value
            };

            handler(credentials);
        });
    }

    bindRegisterSubmit(handler) {
        const registerForm = document.getElementById('registerForm');
        if (!registerForm) return;

        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const registrationData = {
                username: document.getElementById('usernameInput').value,
                email: document.getElementById('emailInput').value,
                pronoun: document.getElementById('pronounInput').value,
                password: document.getElementById('passwordInput').value,
                confirmPassword: document.getElementById('confirmPasswordInput').value
            };

            handler(registrationData);
        });
    }

    bindNavigationToRegister() {
        const navButton = document.getElementById('navToRegisterBtn');
        if (navButton) {
            navButton.addEventListener('click', () => {
                window.location.hash = 'register';
            });
        }
    }

    bindNavigationToLogin() {
        const navButton = document.getElementById('navToLoginBtn');
        if (navButton) {
            navButton.addEventListener('click', () => {
                window.location.hash = 'login';
            });
        }
    }

    renderError(errorMessage) {
        const errorContainer = document.getElementById('errorContainer');
        if (errorContainer) {
            errorContainer.textContent = errorMessage;
        }
    }
}