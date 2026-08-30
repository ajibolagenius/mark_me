import type { z } from "zod";
import { createOpenRouterClient } from "./client";
import { getOpenRouterFallbackModels, getOpenRouterModel } from "./env";
import {
    autoTagUserPrompt,
    autoOrganizeUserPrompt,
    batchTagUserPrompt,
    cleanTagsUserPrompt,
    digestUserPrompt,
    duplicatesUserPrompt,
    reorgUserPrompt,
    summarizeUserPrompt,
} from "./prompts";
import {
    autoOrganizeResultSchema,
    autoTagResultSchema,
    batchTagResultSchema,
    cleanTagsResultSchema,
    digestResultSchema,
    duplicateResultSchema,
    reorgResultSchema,
    summaryResultSchema,
    type AutoOrganizeResult,
    type AutoTagResult,
    type BatchTagResult,
    type CleanTagsResult,
    type DigestResult,
    type DuplicateResult,
    type ReorgResult,
    type SummaryResult,
} from "./schemas";

async function completeJson<T>(
    schema: z.ZodType<T>,
    userPrompt: string,
    maxTokens: number,
    shapeHint: string,
): Promise<T> {
    const client = createOpenRouterClient();
    const fallbacks = getOpenRouterFallbackModels();
    const message = await client.chat.completions.create({
        model: getOpenRouterModel(),
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        ...(fallbacks.length > 0 ? { models: fallbacks } : {}),
        messages: [
            {
                role: "system",
                content: `You are a JSON API for mark_me. Reply with a single JSON object only (no markdown). Shape: ${shapeHint}`,
            },
            { role: "user", content: userPrompt },
        ],
    });

    const raw = message.choices[0]?.message?.content?.trim() ?? "{}";
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        // Some models wrap JSON in fences despite instructions
        const fenced = raw.match(/\{[\s\S]*\}/);
        if (!fenced) throw new Error("AI returned non-JSON");
        parsed = JSON.parse(fenced[0]);
    }
    return schema.parse(parsed);
}

export async function runAutoTagStructured(title: string, url: string): Promise<AutoTagResult> {
    return completeJson(
        autoTagResultSchema,
        autoTagUserPrompt(title, url),
        512,
        '{"tags":["string"]}',
    );
}

export async function runSummarizeStructured(
    categoryName: string,
    bookmarkLines: string,
): Promise<SummaryResult> {
    return completeJson(
        summaryResultSchema,
        summarizeUserPrompt(categoryName, bookmarkLines),
        1024,
        '{"summary":"string","keyTopics":["string"]}',
    );
}

export async function runDuplicatesStructured(
    bookmarks: { id: string; title: string; url: string; tags: string[] }[],
): Promise<DuplicateResult> {
    const capped = bookmarks.slice(0, 60);
    return completeJson(
        duplicateResultSchema,
        duplicatesUserPrompt(JSON.stringify(capped)),
        2048,
        '{"duplicates":[{"a":"id","b":"id","similarity":0.0}]}',
    );
}

export async function runReorganizeStructured(
    bookmarkContext: string,
    hint?: string,
): Promise<ReorgResult> {
    return completeJson(
        reorgResultSchema,
        reorgUserPrompt(bookmarkContext, hint),
        2048,
        '{"suggestions":[{"action":"string","reason":"string"}]}',
    );
}

export async function runAutoOrganizeStructured(
    bookmarks: { id: string; title: string; url: string; tags?: string[] }[],
    existingCategories: string[],
): Promise<AutoOrganizeResult> {
    const capped = bookmarks.slice(0, 60);
    return completeJson(
        autoOrganizeResultSchema,
        autoOrganizeUserPrompt(JSON.stringify(capped), existingCategories),
        3000,
        '{"newCategories":[{"name":"string","emoji":"📁","color":0}],"moves":[{"bookmarkId":"string","targetCategoryName":"string","reason":"string"}]}',
    );
}

export async function runCleanTagsStructured(
    tagsWithFrequency: { tag: string; count: number }[],
): Promise<CleanTagsResult> {
    const capped = tagsWithFrequency.slice(0, 200);
    return completeJson(
        cleanTagsResultSchema,
        cleanTagsUserPrompt(capped),
        2048,
        '{"junkTagsToRemove":["string"],"tagMerges":[{"from":"string","to":"string"}]}',
    );
}

export async function runBatchTagStructured(
    bookmarks: { id: string; title: string; url: string }[],
): Promise<BatchTagResult> {
    const capped = bookmarks.slice(0, 40);
    return completeJson(
        batchTagResultSchema,
        batchTagUserPrompt(capped),
        2048,
        '{"suggestions":[{"bookmarkId":"string","tags":["string"]}]}',
    );
}

export async function runDigestStructured(
    bookmarkContext: string,
    topicOrTimeframe?: string,
): Promise<DigestResult> {
    return completeJson(
        digestResultSchema,
        digestUserPrompt(bookmarkContext, topicOrTimeframe),
        3000,
        '{"title":"string","overview":"string","sections":[{"category":"string","highlights":["string"],"summary":"string"}],"markdown":"string"}',
    );
}

