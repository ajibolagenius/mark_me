/** Default model (override with ANTHROPIC_MODEL). */
export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

export function getAnthropicApiKey(): string | undefined {
  const k = process.env.ANTHROPIC_API_KEY?.trim();
  return k && k.length > 0 ? k : undefined;
}

export function getAnthropicModel(): string {
  const m = process.env.ANTHROPIC_MODEL?.trim();
  return m && m.length > 0 ? m : DEFAULT_ANTHROPIC_MODEL;
}

export function isAnthropicConfigured(): boolean {
  return getAnthropicApiKey() !== undefined;
}
