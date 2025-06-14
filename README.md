# [![Purinton Dev](https://purinton.us/logos/brand.png)](https://discord.gg/QSBxQnX7PF)

## @purinton/tasklit-mcp [![npm version](https://img.shields.io/npm/v/@purinton/tasklit-mcp.svg)](https://www.npmjs.com/package/@purinton/tasklit-mcp)[![license](https://img.shields.io/github/license/purinton/tasklit-mcp.svg)](LICENSE)[![build status](https://github.com/purinton/tasklit-mcp/actions/workflows/nodejs.yml/badge.svg)](https://github.com/purinton/tasklit-mcp/actions)

> **Tasklit MCP** is a Model Context Protocol (MCP) server providing a set of custom tools for AI and automation workflows, focused on task management. It is designed for integration with AI agents and automation clients, and is easily extendable with your own tools.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Available Tools](#available-tools)
- [Usage](#usage)
- [Extending & Customizing](#extending--customizing)
- [Support](#support)
- [License](#license)
- [Links](#links)

## Overview

This project is an MCP server built on [`@purinton/mcp-server`](https://www.npmjs.com/package/@purinton/mcp-server). It exposes a set of task management tools via the Model Context Protocol, making them accessible to AI agents and automation clients.

## Features

- Dynamic tool loading from the `tools/` directory
- Task management tools: create, update, delete, search, get, and log time on tasks
- Simple to add or modify tools
- HTTP API with authentication
- Built for easy extension
- Ready for Docker and systemd deployment

## Available Tools

Below is a list of tools provided by this MCP server. Each tool can be called via the MCP protocol or HTTP API.

### `task-create`

**Description:** Creates one or more tasks. Returns an array of the task IDs that were created.

**Input Schema:**

```json
{
  "tasks": [
    {
      "details": "string (optional)",
      "parent_id": "number (optional)",
      "scheduled_time": "string (optional)",
      "sort_order": "number (optional)",
      "status": "pending | in progress | on hold | blocked | review | cancelled | completed (optional)",
      "title": "string"
    }
  ]
}
```

**Example Request:**

```json
{
  "tool": "task-create",
  "args": {
    "tasks": [
      { "title": "Write documentation", "status": "pending" }
    ]
  }
}
```

**Example Response:**

```json
{
  "message": "task-create-reply",
  "data": { "task_ids": [123] }
}
```

### `task-update`

**Description:** Updates one or more tasks by ID.

**Input Schema:**

```json
{
  "tasks": [
    {
      "id": "number",
      "details": "string (optional)",
      "parent_id": "number (optional)",
      "scheduled_time": "string (optional)",
      "sort_order": "number (optional)",
      "status": "pending | in progress | on hold | blocked | review | cancelled | completed (optional)",
      "time_logged": "number (optional)",
      "title": "string (optional)"
    }
  ]
}
```

**Example Request:**

```json
{
  "tool": "task-update",
  "args": {
    "tasks": [
      { "id": 123, "status": "completed" }
    ]
  }
}
```

**Example Response:**

```json
{
  "message": "task-update-reply",
  "data": { "success": true }
}
```

### `task-delete`

**Description:** Delete one or more tasks by their IDs.

**Input Schema:**

```json
{
  "task_ids": [123, 124]
}
```

**Example Request:**

```json
{
  "tool": "task-delete",
  "args": { "task_ids": [123] }
}
```

**Example Response:**

```json
{
  "message": "task-delete-reply",
  "data": { "deleted": [123] }
}
```

### `task-get`

**Description:** Get all of a task's info by its ID.

**Input Schema:**

```json
{
  "task_ids": [123]
}
```

**Example Request:**

```json
{
  "tool": "task-get",
  "args": { "task_ids": [123] }
}
```

**Example Response:**

```json
{
  "message": "task-get-reply",
  "data": { "tasks": [ { "id": 123, "title": "Write documentation", ... } ] }
}
```

### `task-search`

**Description:** Search/list all task titles and details for given statuses.

**Input Schema:**

```json
{
  "search_string": "string (optional)",
  "includes": {
    "pending": true,
    "in progress": true,
    "on hold": false,
    "blocked": false,
    "review": false,
    "cancelled": false,
    "completed": false
  }
}
```

**Example Request:**

```json
{
  "tool": "task-search",
  "args": {
    "search_string": "documentation",
    "includes": { "pending": true, "in progress": true, "on hold": false, "blocked": false, "review": false, "cancelled": false, "completed": false }
  }
}
```

**Example Response:**

```json
{
  "message": "task-search-reply",
  "data": { "tasks": [ { "id": 123, "title": "Write documentation" } ] }
}
```

### `task-log-time`

**Description:** Add or remove time spent on a task.

**Input Schema:**

```json
{
  "tasks": [
    { "task_id": 123, "minutes": 30 }
  ]
}
```

**Example Request:**

```json
{
  "tool": "task-log-time",
  "args": { "tasks": [ { "task_id": 123, "minutes": 30 } ] }
}
```

**Example Response:**

```json
{
  "message": "task-log-time-reply",
  "data": { "success": true }
}
```

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
   node tasklit-mcp.mjs
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

You can run this server as a background service on Linux using the provided `tasklit-mcp.service` file.

### 1. Copy the service file

Copy `tasklit-mcp.service` to your systemd directory (usually `/etc/systemd/system/`):

```bash
sudo cp tasklit-mcp.service /usr/lib/systemd/system/
```

### 2. Adjust paths and environment

- Make sure the `WorkingDirectory` and `ExecStart` paths in the service file match where your project is installed (default: `/opt/tasklit-mcp`).
- Ensure your environment file exists at `/opt/tasklit-mcp/.env` if you use one.

### 3. Reload systemd and enable the service

```bash
sudo systemctl daemon-reload
sudo systemctl enable tasklit-mcp
sudo systemctl start tasklit-mcp
```

### 4. Check service status

```bash
sudo systemctl status tasklit-mcp
```

The server will now run in the background and restart automatically on failure or reboot.

## Running with Docker

You can run this MCP server in a Docker container using the provided `Dockerfile`.

### 1. Build the Docker image

```bash
docker build -t tasklit-mcp .
```

### 2. Run the container

Set your environment variables (such as `MCP_TOKEN`) and map the port as needed:

```bash
docker run -d \
  -e MCP_TOKEN=your_secret_token \
  -e MCP_PORT=1234 \
  -p 1234:1234 \
  --name tasklit-mcp \
  tasklit-mcp
```

- Replace `your_secret_token` with your desired token.
- You can override the port by changing `-e MCP_PORT` and `-p` values.

### 3. Updating the image

If you make changes to the code, rebuild the image and restart the container:

```bash
docker build -t tasklit-mcp .
docker stop tasklit-mcp && docker rm tasklit-mcp
# Then run the container again as above
```

---

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
