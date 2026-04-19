import 'dotenv/config';
import fsp from 'node:fs/promises';
import fs from 'node:fs';
import { UPLOAD_DIR, TO_JUDGE_DIR, JUDGER_URL, TARGET_FOLDER, USER_PORT, ADMIN_PORT } from './constant/config.js';
import { userApp, adminApp } from './app.js';

const target_folder = process.env.TARGET_FOLDER || TARGET_FOLDER || undefined;
if (target_folder && fs.existsSync(target_folder)) {
    console.log(`Using target folder: ${target_folder}`);
} else {
    console.error('No target folder specified. Using default: ./target');
}

async function ensureDirectories() {
    await fsp.mkdir(UPLOAD_DIR, { recursive: true });
    await fsp.mkdir(TO_JUDGE_DIR, { recursive: true });
    if (process.env.TARGET_FOLDER == undefined) {
        await fsp.mkdir(TARGET_FOLDER, { recursive: true });
    }
}

if (JUDGER_URL) {
    // check endpoint exists
    try {
        const res = await fetch(JUDGER_URL, { method: 'HEAD' });
        if (res.ok) {
            console.log(`Judger URL is reachable: ${JUDGER_URL}`);
        } else {
            console.warn(`Judger URL responded with status ${res.status}: ${JUDGER_URL}, however, this means the server is reachable.`);
        }
    } catch (error) {
        console.error(`Failed to reach Judger URL: ${JUDGER_URL}`, error);
    }
}


ensureDirectories().then(() => {
    userApp.listen(USER_PORT, () => {
        console.log(`🚀 User server is running at http://localhost:${USER_PORT}`);
    });
    adminApp.listen(ADMIN_PORT, () => {
        console.log(`🔒 Admin server is running at http://localhost:${ADMIN_PORT}`);
    });
});