# [![Purinton Dev](https://purinton.us/logos/brand.png)](https://discord.gg/QSBxQnX7PF)

## @purinton/mcp-server-template [![npm version](https://img.shields.io/npm/v/@purinton/mcp-server-template.svg)](https://www.npmjs.com/package/@purinton/mcp-server-template)[![license](https://img.shields.io/github/license/purinton/mcp-server-template.svg)](LICENSE)[![build status](https://github.com/purinton/mcp-server-template/actions/workflows/nodejs.yml/badge.svg)](https://github.com/purinton/mcp-server-template/actions)

> A Model Context Protocol (MCP) server providing a set of custom tools for AI and automation workflows. Easily extendable with your own tools.

---

## Table of Contents

- [Overview](#overview)
- [Available Tools](#available-tools)
- [Usage](#usage)
- [Extending & Customizing](#extending--customizing)
- [Support](#support)
- [License](#license)
- [Links](#links)

## Overview

This project is an MCP server built on [`@purinton/mcp-server`](https://www.npmjs.com/package/@purinton/mcp-server). It exposes a set of tools via the Model Context Protocol, making them accessible to AI agents and automation clients.

**Key Features:**

- Dynamic tool loading from the `tools/` directory
- Simple to add or modify tools
- HTTP API with authentication
- Built for easy extension

## Available Tools

Below is a list of tools provided by this MCP server. Each tool can be called via the MCP protocol or HTTP API.

### Example: Echo Tool

**Name:** `echo`  
**Description:** Returns the text you send it.

**Input Schema:**

```json
{ "echoText": "string" }
```

**Example Request:**

```json
{
  "tool": "echo",
  "args": { "echoText": "Hello, world!" }
}
```

**Example Response:**

```json
{
  "message": "echo-reply",
  "data": { "text": "Hello, world!" }
}
```

<!--
Repeat the above block for each tool you add.
Document: tool name, description, input schema, example request/response.
-->

## Usage

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - `MCP_PORT`: (optional) Port to run the server (default: 1234)
   - `MCP_TOKEN`: (optional) Bearer token for authentication

3. **Start the server:**

   ```bash
   node mcp-server-template.mjs
   ```

4. **Call tools via HTTP or MCP client.**  
   See the [@purinton/mcp-server documentation](https://www.npmjs.com/package/@purinton/mcp-server) for protocol/API details.

## Extending & Customizing

To add a new tool:

1. **Create a new file in the `tools/` directory** (e.g., `tools/mytool.mjs`):

   ```js
   import { z, buildResponse } from '@purinton/mcp-server';

   export default async function (server, toolName = 'mytool') {
     server.tool(
       toolName,
       "Describe what your tool does here.",
       { inputParam: z.string() }, // Define your input schema
       async (_args, _extra) => {
         // Your tool logic here
         return buildResponse({ message: "mytool-reply", data: { result: "..." } });
       }
     );
   }
   ```

2. **Document your tool** in the [Available Tools](#available-tools) section above.

3. **Restart the server** to load new tools.

You can add as many tools as you like. Each tool is a self-contained module.

## Running as a systemd Service

You can run this server as a background service on Linux using the provided `mcp-server-template.service` file.

### 1. Copy the service file

Copy `mcp-server-template.service` to your systemd directory (usually `/etc/systemd/system/`):

```bash
sudo cp mcp-server-template.service /etc/systemd/system/
```

### 2. Adjust paths and environment

- Make sure the `WorkingDirectory` and `ExecStart` paths in the service file match where your project is installed (default: `/opt/mcp-server-template`).
- Ensure your environment file exists at `/opt/mcp-server-template/.env` if you use one.

### 3. Reload systemd and enable the service

```bash
sudo systemctl daemon-reload
sudo systemctl enable mcp-server-template
sudo systemctl start mcp-server-template
```

### 4. Check service status

```bash
sudo systemctl status mcp-server-template
```

The server will now run in the background and restart automatically on failure or reboot.

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://purinton.us/logos/discord_96.png)](https://discord.gg/QSBxQnX7PF)[![Purinton Dev](https://purinton.us/logos/purinton_96.png)](https://discord.gg/QSBxQnX7PF)

**[Purinton Dev on Discord](https://discord.gg/QSBxQnX7PF)**

## License

[MIT © 2025 Russell Purinton](LICENSE)

## Links

- [@purinton/mcp-server on npm](https://www.npmjs.com/package/@purinton/mcp-server)
- [GitHub](https://github.com/purinton/mcp-server)
- [Discord](https://discord.gg/QSBxQnX7PF)
