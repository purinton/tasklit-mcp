import { z } from 'zod';
import log from '../log.mjs';
import { buildResponse } from '../toolHelpers.mjs';
import fetch from 'node-fetch';
import https from 'https';

export default async function (server, toolName = 'task-delete') {
  server.tool(
    toolName,
    'Delete one or more tasks by their IDs.',
    {
      task_ids: z.array(z.number()),
    },
    async (args, extra) => {
      let bearerToken = extra?.bearerToken;
      if (!bearerToken && args.bearerToken) {
        bearerToken = args.bearerToken;
        delete args.bearerToken;
      }
      if (!bearerToken && typeof global.__currentBearerToken__ === 'string') {
        bearerToken = global.__currentBearerToken__;
      }
      if (!bearerToken) {
        return buildResponse({ error: 'No bearer token provided.' });
      }
      try {
        const response = await fetch('https://tasklit.com/api/task_delete.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`,
          },
          body: JSON.stringify(args),
          agent: new https.Agent({ rejectUnauthorized: false })
        });
        const data = await response.json();
        return buildResponse(data);
      } catch (e) {
        log.error('task_delete error', e);
        return buildResponse({ error: e.message });
      }
    }
  );
}
