import { z } from 'zod';
import log from '../log.mjs';
import { buildResponse } from '../toolHelpers.mjs';
import fetch from 'node-fetch';
import https from 'https';

export default async function (server, toolName = 'task-get') {
  server.tool(
    toolName,
    'Get all of a tasks info by its ID.',
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
        const response = await fetch('https://tasklit.com/api/task_get.php', {
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
        log.error('task_get error', e);
        return buildResponse({ error: e.message });
      }
    }
  );
}
