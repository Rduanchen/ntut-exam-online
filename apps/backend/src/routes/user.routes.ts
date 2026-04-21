import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { UPLOAD_DIR } from '../constant/config.js';
import { getQuestions, uploadFile, judge, getPdf } from '../controllers/user.controller.js';

const router = Router();
const upload = multer({ dest: path.join(UPLOAD_DIR, '.tmp') });

router.get('/questions', getQuestions);
router.post('/upload-file', upload.single('file'), uploadFile);
router.post('/judge', judge);
router.get('/pdf', getPdf);

export default router;
