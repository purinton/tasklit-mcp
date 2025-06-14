import { z } from 'zod';
import log from '../log.mjs';
import { buildResponse } from '../toolHelpers.mjs';
import fetch from 'node-fetch';
import https from 'https';

export default async function (server, toolName = 'task-create') {
  server.tool(
    toolName,
    'Creates one or more tasks. Returns an array of the task IDs that were created.',
    {
      tasks: z.array(
        z.object({
          details: z.string().max(10000).optional().nullable(),
          parent_id: z.number().optional(),
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
          title: z.string(),
        })
      ).min(1),
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
        // Always send { tasks: [...] } to the API, and filter to only allowed fields
        const allowedFields = ['details', 'parent_id', 'scheduled_time', 'sort_order', 'status', 'title'];
        let payload;
        if (Array.isArray(args.tasks)) {
          // Filter each task to allowed fields
          payload = { tasks: args.tasks.map(task => Object.fromEntries(Object.entries(task).filter(([k]) => allowedFields.includes(k)))) };
        } else if (args.tasks) {
          // If tasks is present but not an array, wrap and filter
          payload = { tasks: [Object.fromEntries(Object.entries(args.tasks).filter(([k]) => allowedFields.includes(k)))] };
        } else {
          // Assume args is a single task object, filter to allowed fields
          payload = { tasks: [Object.fromEntries(Object.entries(args).filter(([k]) => allowedFields.includes(k)))] };
        }
        const response = await fetch('https://tasklit.com/api/task_create.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`,
          },
          body: JSON.stringify(payload),
          agent: new https.Agent({ rejectUnauthorized: false })
        });
        const data = await response.json();
        return buildResponse(data);
      } catch (e) {
        log.error('task_create error', e);
        return buildResponse({ error: e.message });
      }
    }
  );
}
