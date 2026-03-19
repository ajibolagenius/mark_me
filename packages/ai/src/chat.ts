import { createAnthropicClient } from "./client";
import { getAnthropicModel } from "./env";
import { systemPromptWithBookmarkContext } from "./prompts";

export function createBookmarkAssistantStream(options: {
  bookmarkContext: string;
  userMessage: string;
  signal?: AbortSignal;
}) {
  const client = createAnthropicClient();
  return client.messages.stream(
    {
      model: getAnthropicModel(),
      max_tokens: 4096,
      system: systemPromptWithBookmarkContext(options.bookmarkContext),
      messages: [{ role: "user", content: options.userMessage }],
    },
    { signal: options.signal },
  );
}

export async function runBookmarkAssistantCompletion(
  bookmarkContext: string,
  userMessage: string,
): Promise<string> {
  const client = createAnthropicClient();
  const message = await client.messages.create({
    model: getAnthropicModel(),
    max_tokens: 4096,
    system: systemPromptWithBookmarkContext(bookmarkContext),
    messages: [{ role: "user", content: userMessage }],
  });
  const parts = message.content.map((b) => (b.type === "text" ? b.text : ""));
  return parts.join("") || "Sorry, I couldn't produce a reply.";
}
