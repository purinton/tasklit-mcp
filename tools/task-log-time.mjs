import { z, buildResponse } from '@purinton/mcp-server';
import fetch from 'node-fetch';
import https from 'https';

export default async function ({ mcpServer, toolName, log }) {
  mcpServer.tool(
    toolName,
    'Add or remove time spent on a task.',
    {
      tasks: z.array(
        z.object({
          task_id: z.number().int(),
          minutes: z.number().int(),
        })
      ),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      let bearerToken = _extra?._meta?.bearerToken;
      if (!bearerToken) {
        return buildResponse({ error: 'No bearer token provided.' });
      }
      try {
        const response = await fetch('https://tasklit.com/api/task_log_time.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`,
          },
          body: JSON.stringify(_args),
          agent: new https.Agent({ rejectUnauthorized: false })
        });
        const data = await response.json();
        const responseData = {
          message: 'task-log-time-reply',
          data
        };
        log.debug(`${toolName} Response`, { responseData });
        return buildResponse(responseData);
      } catch (e) {
        log.error('task_log_time error', e);
        return buildResponse({ error: e.message });
      }
    }
  );
}
