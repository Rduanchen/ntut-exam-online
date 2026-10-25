import fs from 'node:fs';
import { TARGET_FOLDER, USER_PORT, ADMIN_PORT, EXAM_ZIP_PATH, ADMIN_TOKEN } from './constant/config.js';

if (!ADMIN_TOKEN || ['admin', 'admin-secret'].includes(ADMIN_TOKEN)) {
    throw new Error('Set ADMIN_TOKEN to the same non-default value as the host backend before starting online services.');
}
import { userApp, adminApp } from './app.js';

const target_folder = process.env.TARGET_FOLDER || TARGET_FOLDER || undefined;
if (target_folder && fs.existsSync(target_folder)) {
    console.log(`Using target folder: ${target_folder}`);
} else {
    console.error('No target folder specified. Using default: ./target');
}

async function ensureDirectories() {
    if (process.env.TARGET_FOLDER == undefined) {
        // fsp not imported, but maybe we don't need to create TARGET_FOLDER if we use fs?
        // Let's just use fs.mkdirSync
        fs.mkdirSync(TARGET_FOLDER, { recursive: true });
    }
}

ensureDirectories().then(() => {
    if (!fs.existsSync(EXAM_ZIP_PATH)) {
        console.warn(`⚠️  Warning: exam.zip not found at ${EXAM_ZIP_PATH}. The /api/pdf endpoint will return 404.`);
    }
    userApp.listen(USER_PORT, () => {
        console.log(`🚀 User server is running at http://localhost:${USER_PORT}`);
    });
    adminApp.listen(ADMIN_PORT, () => {
        console.log(`🔒 Admin server is running at http://localhost:${ADMIN_PORT}`);
    });
});
