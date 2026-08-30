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

export function autoOrganizeUserPrompt(bookmarkJson: string, existingCategories: string[]): string {
  return `You are organizing a bookmark library.
Existing category names: ${existingCategories.join(", ") || "(none)"}

Bookmarks to organize (JSON):
${bookmarkJson}

Analyze each bookmark (by title, domain, URL, and existing tags).
1. If a bookmark fits an existing category well, propose moving it there.
2. If multiple bookmarks share a clear cohesive domain/topic that lacks a category (e.g., "AI & Machine Learning", "Design Inspiration", "Developer Tools", "Learning & Courses", "Finance & Crypto"), propose creating a new category with an appropriate emoji and color (0 to 7) and moving those bookmarks into it.
3. Return all proposals via the required JSON format. Cap moves at 60.`;
}

export function cleanTagsUserPrompt(tagsWithFrequency: { tag: string; count: number }[]): string {
  return `You are a taxonomy cleaning assistant.
The following is a list of all tags currently used in the user's bookmarks with their usage counts:
${JSON.stringify(tagsWithFrequency)}

Identify:
1. "junkTagsToRemove": stop words (the, and, for, with, is, that, this, in, on, at, from, any, all), protocol or domain fragments (http, https, com, org, net, io, dev, www, html, index), single random characters/numbers, or words that provide zero tagging signal.
2. "tagMerges": synonyms, casing variations, or redundant plural/singular tags that should be merged (e.g. "js" -> "javascript", "reactjs" -> "react", "css3" -> "css").

Return via the required JSON format.`;
}

export function batchTagUserPrompt(bookmarks: { id: string; title: string; url: string }[]): string {
  return `Suggest 2 to 4 high-quality, concise, lowercase tags for each of the following bookmarks:
${JSON.stringify(bookmarks)}

Return tag suggestions for each bookmark id via the required JSON format.`;
}

export function digestUserPrompt(bookmarkContext: string, topicOrTimeframe?: string): string {
  return `${systemPromptWithBookmarkContext(bookmarkContext)}

${topicOrTimeframe ? `Focus: ${topicOrTimeframe}\n` : ""}
Create a curated, inspiring bookmark digest / reading list.
Group the most valuable links into cohesive themes with a 1-sentence takeaway per link.
Format the final result as a clean markdown newsletter with section headers and bullet points.
Return via the required JSON format.`;
}

