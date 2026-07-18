/** Return an http(s) URL or null (chrome:// favicons etc. fail Zod .url()). */
export function safeHttpUrl(url?: string | null): string | null {
    if (!url) return null;
    try {
        const parsed = new URL(url);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") return url;
    } catch {
        // ignore
    }
    return null;
}
