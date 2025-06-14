import { z, buildResponse } from '@purinton/mcp-server';
import fetch from 'node-fetch';
import https from 'https';

export default async function ({ mcpServer, toolName, log }) {
  mcpServer.tool(
    toolName,
    'Creates one or more tasks',
    {
      tasks: z.array(
        z.object({
          id: z.number(),
          details: z.string().max(10000).optional().nullable(),
          parent_id: z.number().optional().nullable(),
          scheduled_time: z.string().optional().nullable(),
          sort_order: z.number().optional().nullable(),
          status: z.enum([
            'pending',
            'in progress',
            'on hold',
            'blocked',
            'review',
            'cancelled',
            'completed',
          ]).optional(),
          time_logged: z.number().optional(),
          title: z.string().optional(),
        })
      ),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      let bearerToken = _extra?.bearerToken;
      if (!bearerToken && _args.bearerToken) {
        bearerToken = _args.bearerToken;
        delete _args.bearerToken;
      }
      if (!bearerToken && typeof global.__currentBearerToken__ === 'string') {
        bearerToken = global.__currentBearerToken__;
      }
      if (!bearerToken) {
        return buildResponse({ error: 'No bearer token provided.' });
      }
      try {
        const response = await fetch('https://tasklit.com/api/task_update.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`,
          },
          body: JSON.stringify(_args),
          agent: new https.Agent({ rejectUnauthorized: false })
        });
        const data = await response.json();
        log.debug(`${toolName} Response`, { data });
        return buildResponse(data);
      } catch (e) {
        log.error('task_update error', e);
        return buildResponse({ error: e.message });
      }
    }
  );
}
