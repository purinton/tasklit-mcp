#!/usr/bin/env node
import fs from 'fs';
import 'dotenv/config';
import { mcpServer } from '@purinton/mcp-server';
import { log, path, registerHandlers, registerSignals } from '@purinton/common';
import { parse } from 'path';
registerHandlers({ logger: log }); registerSignals({ logger: log });

const packagePath = path(import.meta, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const name = packageJson.name || 'mcp-server-template';
const version = packageJson.version || '1.0.0';
const port = parseInt(process.env.MCP_PORT || 1234, 10);
const token = process.env.MCP_TOKEN;
const toolsDir = path(import.meta, 'tools');
const logger = log;

await mcpServer({ name, version, port, token, toolsDir, logger });

log.info('Ready', { name, version, port });