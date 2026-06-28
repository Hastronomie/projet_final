console.warn('[BOOT] Amorçage de app.js');
import { Router } from './src/core/Router.js';

const appRouter = new Router();
appRouter.start();
console.warn('[BOOT] Fin synchrone de app.js');