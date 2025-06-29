import { z, buildResponse } from '@purinton/mcp-server';
import fetch from 'node-fetch';
import https from 'https';

const statusKeys = [
  'pending',
  'in progress',
  'on hold',
  'blocked',
  'review',
  'cancelled',
  'completed'
];

export default async function ({ mcpServer, toolName, log }) {
  mcpServer.tool(
    toolName,
    'Search/list all task titles and details for a given statuses.',
    {
      search_string: z.string().optional().nullable(),
      includes: z.object({
        pending: z.boolean().optional().default(false),
        'in progress': z.boolean().optional().default(false),
        'on hold': z.boolean().optional().default(false),
        blocked: z.boolean().optional().default(false),
        review: z.boolean().optional().default(false),
        cancelled: z.boolean().optional().default(false),
        completed: z.boolean().optional().default(false),
      }).default({}),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      let bearerToken = _extra?._meta?.bearerToken;
      if (!bearerToken) {
        return buildResponse({ error: 'No bearer token provided.' });
      }
      // Ensure all status keys are present in includes, defaulting to false if missing
      if (!_args.includes) _args.includes = {};
      for (const key of statusKeys) {
        if (typeof _args.includes[key] !== 'boolean') {
          _args.includes[key] = false;
        }
      }
      try {
        const response = await fetch('https://tasklit.com/api/task_search.php', {
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
        log.error('task_search error', e);
        return buildResponse({ error: e.message });
      }
    }
  );
}
