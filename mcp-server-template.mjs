#!/usr/bin/env node
import 'dotenv/config';
import { mcpServer } from '@purinton/mcp-server';
import { fs, log, path, registerHandlers, registerSignals } from '@purinton/common';

registerHandlers({ log });
registerSignals({ log });

const packagePath = path(import.meta, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const name = packageJson.name || 'mcp-server-template';
const version = packageJson.version || '1.0.0';
const port = parseInt(process.env.MCP_PORT || 1234, 10);
const token = process.env.MCP_TOKEN;
const toolsDir = path(import.meta, 'tools');

await mcpServer({ name, version, port, token, toolsDir, log });
log.info('Ready', { name, version, port });