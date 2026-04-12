import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { userApp, adminApp } from '../src/app.js';

let tmpDir: string;

beforeEach(async () => {
    tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'backend-test-'));

    // Override config dirs to use temp directories
    const config = await import('../src/constant/config.js');
    Object.defineProperty(config, 'UPLOAD_DIR', { value: path.join(tmpDir, 'upload'), configurable: true });
    Object.defineProperty(config, 'TO_JUDGE_DIR', { value: path.join(tmpDir, 'to-judge'), configurable: true });
    Object.defineProperty(config, 'TARGET_FOLDER', { value: path.join(tmpDir, 'target'), configurable: true });

    await fsp.mkdir(path.join(tmpDir, 'upload'), { recursive: true });
    await fsp.mkdir(path.join(tmpDir, 'to-judge'), { recursive: true });
    await fsp.mkdir(path.join(tmpDir, 'target'), { recursive: true });
});

afterEach(async () => {
    await fsp.rm(tmpDir, { recursive: true, force: true });
});

describe('GET /api/health', () => {
    it('should return ok status on user app', async () => {
        const res = await request(userApp).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body.role).toBe('user');
    });

    it('should return ok status on admin app', async () => {
        const res = await request(adminApp).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body.role).toBe('admin');
    });

    it('admin routes should NOT be accessible on user app', async () => {
        const res = await request(userApp).get('/api/log');
        expect(res.status).toBe(404);
    });

    it('user routes should NOT be accessible on admin app', async () => {
        const res = await request(adminApp).get('/api/questions');
        expect(res.status).toBe(404);
    });
});

describe('GET /api/questions', () => {
    it('should return question list', async () => {
        const res = await request(userApp).get('/api/questions');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('name');
        expect(res.body[0]).toHaveProperty('language');
    });
});

describe('POST /api/upload-file', () => {
    it('should return 400 if studentId is missing', async () => {
        const res = await request(userApp)
            .post('/api/upload-file')
            .field('questionId', '0')
            .attach('file', Buffer.from('hello'), 'test.c');
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/studentId/);
    });

    it('should return 400 if questionId is missing', async () => {
        const res = await request(userApp)
            .post('/api/upload-file')
            .field('studentId', '111')
            .attach('file', Buffer.from('hello'), 'test.c');
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/questionId/);
    });

    it('should return 400 for invalid questionId', async () => {
        const res = await request(userApp)
            .post('/api/upload-file')
            .field('studentId', '111')
            .field('questionId', '999')
            .attach('file', Buffer.from('hello'), 'test.c');
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/Invalid questionId/);
    });

    it('should upload file successfully', async () => {
        const res = await request(userApp)
            .post('/api/upload-file')
            .field('studentId', '111')
            .field('questionId', '0')
            .attach('file', Buffer.from('#include <stdio.h>'), 'test.c');
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('File uploaded successfully');
        expect(res.body.path).toContain('111');
        expect(res.body.path).toMatch(/0\.c$/);
    });
});

describe('POST /api/judge', () => {
    it('should return 400 if studentId is missing', async () => {
        const res = await request(userApp)
            .post('/api/judge')
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/studentId/);
    });

    it('should return 404 if no submission found', async () => {
        const res = await request(userApp)
            .post('/api/judge')
            .send({ studentId: 'nonexistent' });
        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/No submission found/);
    });
});

describe('GET /api/log', () => {
    it('should return logs as text', async () => {
        const res = await request(adminApp).get('/api/log');
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/text\/plain/);
    });
});

describe('GET /api/file-list', () => {
    it('should return empty object when no uploads exist', async () => {
        const res = await request(adminApp).get('/api/file-list');
        expect(res.status).toBe(200);
        expect(typeof res.body).toBe('object');
    });

    it('should list uploaded directories', async () => {
        const config = await import('../src/constant/config.js');
        const testDir = path.join(config.UPLOAD_DIR, '127_0_0_1_student1');
        await fsp.mkdir(testDir, { recursive: true });
        await fsp.writeFile(path.join(testDir, '0.c'), 'test');

        const res = await request(adminApp).get('/api/file-list');
        expect(res.status).toBe(200);
        expect(res.body['127_0_0_1_student1']).toContain('0.c');
    });
});

describe('PUT /api/move-file', () => {
    it('should return 400 if filename is missing', async () => {
        const res = await request(adminApp)
            .put('/api/move-file')
            .send({ newFileName: 'test' });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/filename/);
    });

    it('should return 400 if newFileName is missing', async () => {
        const res = await request(adminApp)
            .put('/api/move-file')
            .send({ filename: 'test' });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/newFileName/);
    });

    it('should return 400 for path traversal attempts', async () => {
        const res = await request(adminApp)
            .put('/api/move-file')
            .send({ filename: '../../etc/passwd', newFileName: 'hacked' });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/Invalid/);
    });

    it('should return 404 if source does not exist', async () => {
        const res = await request(adminApp)
            .put('/api/move-file')
            .send({ filename: 'nonexistent', newFileName: 'output' });
        expect(res.status).toBe(404);
    });

    it('should move file successfully', async () => {
        const config = await import('../src/constant/config.js');
        const testDir = path.join(config.UPLOAD_DIR, 'testdir');
        await fsp.mkdir(testDir, { recursive: true });
        await fsp.writeFile(path.join(testDir, '0.c'), 'int main(){}');

        const res = await request(adminApp)
            .put('/api/move-file')
            .send({ filename: 'testdir', newFileName: 'renamed' });
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('File moved successfully');

        // Verify zip exists in both locations
        await expect(fsp.access(path.join(config.TO_JUDGE_DIR, 'renamed.zip'))).resolves.toBeUndefined();
        await expect(fsp.access(path.join(config.TARGET_FOLDER, 'renamed.zip'))).resolves.toBeUndefined();
    });
});
