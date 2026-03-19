const APP = `You are the AI assistant for mark_me, a bookmark manager.
Use the user's bookmark graph accurately. Prefer concise, actionable answers.
When returning structured data, follow the schema exactly.`;

export function systemPromptWithBookmarkContext(bookmarkContext: string): string {
  return `${APP}

The user has the following categories and bookmarks:

${bookmarkContext || "(no bookmarks yet)"}`;
}

export function autoTagUserPrompt(title: string, url: string): string {
  return `Suggest tags for this bookmark.
Title: ${title}
URL: ${url}

Return only via the required output format: short, useful tags (lowercase when possible), no hashtags.`;
}

export function summarizeUserPrompt(categoryName: string, lines: string): string {
  return `Summarize this bookmark category "${categoryName}".

Bookmarks:
${lines}

Return a brief summary and key topics via the required output format.`;
}

export function duplicatesUserPrompt(bookmarkJson: string): string {
  return `You are given bookmarks as JSON array of {id,title,url,tags}.
Find pairs that are duplicates or near-duplicates (same intent, same canonical URL variants, or very similar titles).
Use the bookmark "id" fields only in your output. similarity: 0–1 (1 = same).

Data:
${bookmarkJson}

Return pairs via the required output format. Omit pairs below 0.5 similarity. Cap at 20 pairs.`;
}

export function reorgUserPrompt(bookmarkContext: string, hint?: string): string {
  return `${systemPromptWithBookmarkContext(bookmarkContext)}

${hint ? `User hint: ${hint}\n` : ""}
Suggest concrete reorganization actions (merge categories, rename, move bookmarks, split overloaded categories).
Return via the required output format.`;
}
