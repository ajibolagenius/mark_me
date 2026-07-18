import { createOpenRouterClient } from "./client";
import { getOpenRouterModel } from "./env";
import { systemPromptWithBookmarkContext } from "./prompts";

/** Yields text deltas from the OpenRouter chat stream. */
export async function* streamBookmarkAssistant(options: {
    bookmarkContext: string;
    userMessage: string;
    signal?: AbortSignal;
}): AsyncGenerator<string, void, unknown> {
    const client = createOpenRouterClient();
    const stream = await client.chat.completions.create(
        {
            model: getOpenRouterModel(),
            max_tokens: 4096,
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
        model: getOpenRouterModel(),
        max_tokens: 4096,
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
