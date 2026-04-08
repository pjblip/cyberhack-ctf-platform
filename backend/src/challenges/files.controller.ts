import { Controller, Get, Param, Res, NotFoundException, Logger } from '@nestjs/common';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('challenge-files')
export class FilesController {
    private readonly logger = new Logger(FilesController.name);
    // Use process.cwd() to get the backend directory, then go up one level to project root
    private readonly filesPath = path.resolve(process.cwd(), '../public/challenge-files');

    constructor() {
        this.logger.log(`Challenge files path: ${this.filesPath}`);
        this.logger.log(`Path exists: ${fs.existsSync(this.filesPath)}`);
    }

    @Get(':filename')
    async downloadFile(@Param('filename') filename: string, @Res() res: Response) {
        const filePath = path.join(this.filesPath, filename);
        
        this.logger.log(`Attempting to serve file: ${filePath}`);

        // Security: Prevent directory traversal
        if (!filePath.startsWith(this.filesPath)) {
            this.logger.warn(`Directory traversal attempt: ${filename}`);
            throw new NotFoundException('File not found');
        }

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            this.logger.warn(`File not found: ${filePath}`);
            throw new NotFoundException('File not found');
        }

        // Determine content type based on extension
        const ext = path.extname(filename).toLowerCase();
        const contentTypes: Record<string, string> = {
            '.py': 'text/x-python',
            '.txt': 'text/plain',
            '.html': 'text/html',
            '.md': 'text/markdown',
            '.zip': 'application/zip',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.pdf': 'application/pdf',
        };

        const contentType = contentTypes[ext] || 'application/octet-stream';

        // Set headers for download
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    }
}
