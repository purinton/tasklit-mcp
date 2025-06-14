import { jest } from '@jest/globals';
test('mcp-server-template.mjs can be imported without error', async () => {
  process.env.LOG_LEVEL = 'none';
  await import('../mcp-server-template.mjs');
  expect(true).toBe(true);
});