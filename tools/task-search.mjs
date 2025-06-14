import { z } from 'zod';
import log from '../log.mjs';
import { buildResponse } from '../toolHelpers.mjs';
import fetch from 'node-fetch';
import https from 'https';

export default async function (server, toolName = 'task-search') {
  server.tool(
    toolName,
    'Search/list all task titles and details for a given statuses.',
    {
      search_string: z.string().optional().nullable(),
      includes: z.object({
        pending: z.boolean(),
        'in progress': z.boolean(),
        'on hold': z.boolean(),
        blocked: z.boolean(),
        review: z.boolean(),
        cancelled: z.boolean(),
        completed: z.boolean(),
      }),
    },
    async (args, extra) => {
      // Workaround: try to get bearerToken from args if not in extra
      let bearerToken = extra?.bearerToken;
      if (!bearerToken && args.bearerToken) {
        bearerToken = args.bearerToken;
        delete args.bearerToken;
      }
      // Fallback to global injected token
      if (!bearerToken && typeof global.__currentBearerToken__ === 'string') {
        bearerToken = global.__currentBearerToken__;
      }
      if (!bearerToken) {
        return buildResponse({ error: 'No bearer token provided.' });
      }
      try {
        const response = await fetch('https://tasklit.com/api/task_search.php', {
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
        log.error('task_search error', e);
        return buildResponse({ error: e.message });
      }
    }
  );
}
