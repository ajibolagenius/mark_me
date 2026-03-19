import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { createAnthropicClient } from "./client";
import { getAnthropicModel } from "./env";
import {
  autoTagUserPrompt,
  duplicatesUserPrompt,
  reorgUserPrompt,
  summarizeUserPrompt,
} from "./prompts";
import {
  autoTagResultSchema,
  duplicateResultSchema,
  reorgResultSchema,
  summaryResultSchema,
  type AutoTagResult,
  type DuplicateResult,
  type ReorgResult,
  type SummaryResult,
} from "./schemas";

export async function runAutoTagStructured(title: string, url: string): Promise<AutoTagResult> {
  const client = createAnthropicClient();
  const message = await client.messages.parse({
    model: getAnthropicModel(),
    max_tokens: 512,
    messages: [{ role: "user", content: autoTagUserPrompt(title, url) }],
    output_config: { format: zodOutputFormat(autoTagResultSchema) },
  });
  const out = message.parsed_output;
  if (!out) {
    throw new Error("Auto-tag: empty parsed output");
  }
  return out;
}

export async function runSummarizeStructured(
  categoryName: string,
  bookmarkLines: string,
): Promise<SummaryResult> {
  const client = createAnthropicClient();
  const message = await client.messages.parse({
    model: getAnthropicModel(),
    max_tokens: 1024,
    messages: [{ role: "user", content: summarizeUserPrompt(categoryName, bookmarkLines) }],
    output_config: { format: zodOutputFormat(summaryResultSchema) },
  });
  const out = message.parsed_output;
  if (!out) {
    throw new Error("Summarize: empty parsed output");
  }
  return out;
}

export async function runDuplicatesStructured(
  bookmarks: { id: string; title: string; url: string; tags: string[] }[],
): Promise<DuplicateResult> {
  const client = createAnthropicClient();
  const capped = bookmarks.slice(0, 60);
  const message = await client.messages.parse({
    model: getAnthropicModel(),
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: duplicatesUserPrompt(JSON.stringify(capped)),
      },
    ],
    output_config: { format: zodOutputFormat(duplicateResultSchema) },
  });
  const out = message.parsed_output;
  if (!out) {
    throw new Error("Duplicates: empty parsed output");
  }
  return out;
}

export async function runReorganizeStructured(
  bookmarkContext: string,
  hint?: string,
): Promise<ReorgResult> {
  const client = createAnthropicClient();
  const message = await client.messages.parse({
    model: getAnthropicModel(),
    max_tokens: 2048,
    messages: [{ role: "user", content: reorgUserPrompt(bookmarkContext, hint) }],
    output_config: { format: zodOutputFormat(reorgResultSchema) },
  });
  const out = message.parsed_output;
  if (!out) {
    throw new Error("Reorganize: empty parsed output");
  }
  return out;
}
