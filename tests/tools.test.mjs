import fs from 'fs';
import { path, pathUrl } from '@purinton/path';
import { jest } from '@jest/globals';

describe('All custom tool handler files', () => {
    const toolsDir = path(import.meta, '..', 'tools');
    const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.mjs'));

    for (const file of files) {
        const filePathUrl = pathUrl(toolsDir, file);
        test(`${file} exports a default function`, async () => {
            const mod = await import(filePathUrl);
            expect(typeof mod.default).toBe('function');
        });

        test(`${file} registers a tool with the server`, async () => {
            const onMock = jest.fn();
            const toolMock = jest.fn();
            const mockServer = { on: onMock, tool: toolMock };
            const mod = await import(filePathUrl);
            await mod.default(mockServer, 'test-tool');
            expect(toolMock).toHaveBeenCalled();
        });
    }
});
