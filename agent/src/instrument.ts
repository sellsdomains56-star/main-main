/**
 * Optional error tracking. With SENTRY_DSN set, crashes and failed agent turns are
 * reported to Sentry so problems in background tasks don't go unnoticed. It is
 * loaded before the app (`--import`) so it can hook Express.
 *
 * It reports errors only, never what you say: no request bodies, headers, cookies,
 * query strings, AI prompts or replies, and no local variables.
 */
const dsn = process.env.SENTRY_DSN?.trim();
if (dsn) {
  const Sentry = await import("@sentry/node");
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: 0,
    // AI and MCP integrations would record prompts and tool data; leave them out entirely.
    integrations: (defaults) => defaults.filter((i) => !/openai|anthropic|genai|mcp|langchain|vercelai/i.test(i.name)),
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      genAI: { inputs: false, outputs: false },
      mcp: { inputs: false, outputs: false },
      databaseQueryData: false,
      queues: false,
      stackFrameVariables: false,
    },
    beforeSend(event) {
      if (event.request) event.request = { method: event.request.method, url: event.request.url?.split("?")[0] };
      delete event.user;
      return event;
    },
  });
  (globalThis as { __dizzSentry?: typeof Sentry }).__dizzSentry = Sentry;
}
