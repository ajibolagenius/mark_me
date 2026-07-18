/** Default free model on OpenRouter (override with OPENROUTER_MODEL). */
export const DEFAULT_OPENROUTER_MODEL = "meta-llama/llama-3.3-70b-instruct:free";

/**
 * Extra free models tried when the primary is rate-limited (OpenRouter `models` fallback list).
 * Override with comma-separated OPENROUTER_FALLBACK_MODELS.
 */
export const DEFAULT_OPENROUTER_FALLBACK_MODELS = [
    "google/gemma-3-27b-it:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "qwen/qwen3-coder:free",
] as const;

export function getOpenRouterApiKey(): string | undefined {
    const k = process.env.OPENROUTER_API_KEY?.trim();
    return k && k.length > 0 ? k : undefined;
}

export function getOpenRouterModel(): string {
    const m = process.env.OPENROUTER_MODEL?.trim();
    return m && m.length > 0 ? m : DEFAULT_OPENROUTER_MODEL;
}

/** Fallback model IDs (excludes the primary model). */
export function getOpenRouterFallbackModels(): string[] {
    const raw = process.env.OPENROUTER_FALLBACK_MODELS?.trim();
    const primary = getOpenRouterModel();
    const list = raw
        ? raw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [...DEFAULT_OPENROUTER_FALLBACK_MODELS];
    return list.filter((m) => m !== primary);
}

export function isOpenRouterConfigured(): boolean {
    return getOpenRouterApiKey() !== undefined;
}

/** @deprecated Use isOpenRouterConfigured — kept so older call sites keep working. */
export function isAnthropicConfigured(): boolean {
    return isOpenRouterConfigured();
}

/** @deprecated Use DEFAULT_OPENROUTER_MODEL */
export const DEFAULT_ANTHROPIC_MODEL = DEFAULT_OPENROUTER_MODEL;

/** @deprecated Use getOpenRouterApiKey */
export function getAnthropicApiKey(): string | undefined {
    return getOpenRouterApiKey();
}

/** @deprecated Use getOpenRouterModel */
export function getAnthropicModel(): string {
    return getOpenRouterModel();
}
