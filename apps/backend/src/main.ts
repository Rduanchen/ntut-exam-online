import fsp from 'node:fs/promises';
import { UPLOAD_DIR, TO_JUDGE_DIR, TARGET_FOLDER, USER_PORT, ADMIN_PORT } from './constant/config.js';
import { userApp, adminApp } from './app.js';

async function ensureDirectories() {
    await fsp.mkdir(UPLOAD_DIR, { recursive: true });
    await fsp.mkdir(TO_JUDGE_DIR, { recursive: true });
    await fsp.mkdir(TARGET_FOLDER, { recursive: true });
}

ensureDirectories().then(() => {
    userApp.listen(USER_PORT, () => {
        console.log(`🚀 User server is running at http://localhost:${USER_PORT}`);
    });
    adminApp.listen(ADMIN_PORT, () => {
        console.log(`🔒 Admin server is running at http://localhost:${ADMIN_PORT}`);
    });
});