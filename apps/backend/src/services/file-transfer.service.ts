import archiver from 'archiver';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

export async function zipDirectory(sourceDir: string, outPath: string): Promise<string> {
    await fsp.mkdir(path.dirname(outPath), { recursive: true });

    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => resolve(outPath));
        archive.on('error', reject);

        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}

export async function zipFile(filePath: string, outPath: string): Promise<string> {
    await fsp.mkdir(path.dirname(outPath), { recursive: true });

    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => resolve(outPath));
        archive.on('error', reject);

        archive.pipe(output);
        archive.file(filePath, { name: path.basename(filePath) });
        archive.finalize();
    });
}
