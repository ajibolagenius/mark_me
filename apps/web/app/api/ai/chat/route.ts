import { auth } from "@/auth";
import { createAuthDb } from "@/lib/db";
import { buildBookmarkContextText, consumeAiQuota } from "@markme/api";
import { createBookmarkAssistantStream, isAnthropicConfigured } from "@markme/ai";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const bodySchema = z.object({
  message: z.string().min(1).max(8000),
});

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = createAuthDb();
  if (!db) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await consumeAiQuota(db, userId);
  } catch (e) {
    if (e instanceof TRPCError && e.code === "TOO_MANY_REQUESTS") {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }
    throw e;
  }

  if (!isAnthropicConfigured()) {
    const enc = new TextEncoder();
    const msg =
      "AI is not configured (set ANTHROPIC_API_KEY on the server). Your message was received.";
    const sse = `data: ${JSON.stringify({ text: msg })}\n\ndata: [DONE]\n\n`;
    return new Response(enc.encode(sse), {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  const bookmarkContext = await buildBookmarkContextText(db, userId);
  const stream = createBookmarkAssistantStream({
    bookmarkContext,
    userMessage: parsed.data.message,
    signal: req.signal,
  });

  const enc = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      stream.on("text", (delta: string) => {
        controller.enqueue(
          enc.encode(`data: ${JSON.stringify({ text: delta })}\n\n`),
        );
      });
      try {
        await stream.finalText();
        controller.enqueue(enc.encode("data: [DONE]\n\n"));
      } catch (err) {
        const message = err instanceof Error ? err.message : "stream error";
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
