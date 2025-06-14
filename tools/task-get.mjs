import { z, buildResponse } from '@purinton/mcp-server';
import fetch from 'node-fetch';
import https from 'https';

export default async function ({ mcpServer, toolName, log }) {
  mcpServer.tool(
    toolName,
    'Get all of a tasks info by its ID.',
    {
      task_ids: z.array(z.number()),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      let bearerToken = _extra?._meta?.bearerToken;
      if (!bearerToken) {
        return buildResponse({ error: 'No bearer token provided.' });
      }
      try {
        const response = await fetch('https://tasklit.com/api/task_get.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`,
          },
          body: JSON.stringify(_args),
          agent: new https.Agent({ rejectUnauthorized: false })
        });
        const data = await response.json();
        const result = {
          message: 'task-get-reply',
          data
        };
        log.debug(`${toolName} Response`, { result });
        return buildResponse(result);
      } catch (e) {
        log.error('task_get error', e);
        return buildResponse({ error: e.message });
      }
    }
  );
}
