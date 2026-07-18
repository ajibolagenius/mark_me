import { createOpenRouterClient } from "./client";
import { getOpenRouterFallbackModels, getOpenRouterModel } from "./env";
import { systemPromptWithBookmarkContext } from "./prompts";

function openRouterChatOptions() {
    const fallbacks = getOpenRouterFallbackModels();
    return {
        model: getOpenRouterModel(),
        max_tokens: 4096,
        // OpenRouter extension: try these if the primary model/provider is exhausted
        ...(fallbacks.length > 0 ? { models: fallbacks } : {}),
    };
}

/** Yields text deltas from the OpenRouter chat stream. */
export async function* streamBookmarkAssistant(options: {
    bookmarkContext: string;
    userMessage: string;
    signal?: AbortSignal;
}): AsyncGenerator<string, void, unknown> {
    const client = createOpenRouterClient();
    const stream = await client.chat.completions.create(
        {
            ...openRouterChatOptions(),
            stream: true,
            messages: [
                {
                    role: "system",
                    content: systemPromptWithBookmarkContext(options.bookmarkContext),
                },
                { role: "user", content: options.userMessage },
            ],
        },
        { signal: options.signal },
    );

    for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) yield delta;
    }
}

/** @deprecated Prefer streamBookmarkAssistant — returns an async iterable of text chunks. */
export function createBookmarkAssistantStream(options: {
    bookmarkContext: string;
    userMessage: string;
    signal?: AbortSignal;
}) {
    return streamBookmarkAssistant(options);
}

export async function runBookmarkAssistantCompletion(
    bookmarkContext: string,
    userMessage: string,
): Promise<string> {
    const client = createOpenRouterClient();
    const message = await client.chat.completions.create({
        ...openRouterChatOptions(),
        messages: [
            {
                role: "system",
                content: systemPromptWithBookmarkContext(bookmarkContext),
            },
            { role: "user", content: userMessage },
        ],
    });
    return message.choices[0]?.message?.content?.trim() || "Sorry, I couldn't produce a reply.";
}
