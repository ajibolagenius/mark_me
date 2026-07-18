/** Map OpenRouter / OpenAI SDK errors into short user-facing copy. */
export function formatOpenRouterError(err: unknown): string {
    const message = err instanceof Error ? err.message : String(err);
    const lower = message.toLowerCase();

    if (
        lower.includes("429") ||
        lower.includes("rate limit") ||
        lower.includes("provider returned error")
    ) {
        return (
            "AI is temporarily rate-limited (OpenRouter free tier / provider capacity). " +
            "Wait a minute and try again, or set OPENROUTER_MODEL to another free model " +
            "(or add OpenRouter credits for higher limits)."
        );
    }

    if (lower.includes("402") || lower.includes("insufficient") || lower.includes("credits")) {
        return "OpenRouter reports insufficient credits for this request. Add credits or switch to a :free model.";
    }

    return message || "AI request failed";
}
