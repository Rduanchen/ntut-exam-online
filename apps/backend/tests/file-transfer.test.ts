import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { zipDirectory, zipFile } from '../src/services/file-transfer.service.js';

let tmpDir: string;

beforeEach(async () => {
    tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'zip-test-'));
});

afterEach(async () => {
    await fsp.rm(tmpDir, { recursive: true, force: true });
});

describe('zipDirectory', () => {
    it('should create a zip file from a directory', async () => {
        const sourceDir = path.join(tmpDir, 'source');
        await fsp.mkdir(sourceDir);
        await fsp.writeFile(path.join(sourceDir, 'file1.txt'), 'content1');
        await fsp.writeFile(path.join(sourceDir, 'file2.txt'), 'content2');

        const outPath = path.join(tmpDir, 'output.zip');
        const result = await zipDirectory(sourceDir, outPath);

        expect(result).toBe(outPath);
        const stat = await fsp.stat(outPath);
        expect(stat.size).toBeGreaterThan(0);
    });
});

describe('zipFile', () => {
    it('should create a zip file from a single file', async () => {
        const sourceFile = path.join(tmpDir, 'single.txt');
        await fsp.writeFile(sourceFile, 'hello world');

        const outPath = path.join(tmpDir, 'single.zip');
        const result = await zipFile(sourceFile, outPath);

        expect(result).toBe(outPath);
        const stat = await fsp.stat(outPath);
        expect(stat.size).toBeGreaterThan(0);
    });
});
