import { Router } from 'express';
import { getLogs, getFileList, moveFile } from '../controllers/admin.controller.js';

const router = Router();

router.get('/log', getLogs);
router.get('/file-list', getFileList);
router.put('/move-file', moveFile);

export default router;
