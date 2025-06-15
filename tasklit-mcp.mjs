#!/usr/bin/env node

import 'dotenv/config';
import { fs, log, path, registerHandlers, registerSignals } from '@purinton/common';

// Register global error and signal handlers for graceful shutdown and logging
registerHandlers({ log });
registerSignals({ log });

// Resolve the path to package.json and load metadata
const packagePath = path(import.meta, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const name = packageJson.name || 'tasklit-mcp';
const version = packageJson.version || '1.0.0';

// Load and validate environment variables
const port = parseInt(process.env.MCP_PORT || '1234', 10);
const token = process.env.MCP_TOKEN;
if (!token) {
    log.error('MCP_TOKEN environment variable is required.');
    process.exit(1);
}

// Resolve and validate the tools directory
const toolsDir = path(import.meta, 'tools');
if (!fs.existsSync(toolsDir)) {
    log.error(`Tools directory not found: ${toolsDir}`);
    process.exit(1);
}

// Define the authentication callback function
const authCallback = (bearerToken) => {
    if (!bearerToken || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(bearerToken)) {
        log.error('Invalid bearer token format', { bearerToken });
        return false;
    }
    return true;
};

// Import and start the MCP server
import { mcpServer } from '@purinton/mcp-server';

try {
    await mcpServer({ name, version, port, token, toolsDir, log, authCallback });
    log.info('Ready', { name, version, port });
} catch (err) {
    log.error('Failed to start MCP server', { error: err });
    process.exit(1);
}
