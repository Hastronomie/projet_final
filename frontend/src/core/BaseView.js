import { escape } from './sanitize.js';

export class BaseView {
    constructor() {
        this.appMain = document.getElementById('appMain');
    }

    renderError(errorMessage) {
        this.appMain.innerHTML = `
            <div class="error-container">
                <h2>System Failure</h2>
                <p>${escape(errorMessage)}</p>
            </div>
        `;
    }
}