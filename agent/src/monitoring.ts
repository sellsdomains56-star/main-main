/** Reports an unexpected error to Sentry when it's set up (see instrument.ts); otherwise does nothing. */
export function reportError(err: unknown, where: string): void {
  const sentry = (globalThis as { __dizzSentry?: { captureException(e: unknown, ctx?: unknown): void } }).__dizzSentry;
  sentry?.captureException(err, { tags: { where } });
}
