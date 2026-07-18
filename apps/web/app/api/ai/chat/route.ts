import { auth } from "@/lib/auth/server";
import { createAuthDb } from "@/lib/db";
import { ensureAppUser } from "@/lib/ensure-app-user";
import { buildBookmarkContextText, consumeAiQuota, type AppDb } from "@markme/api";
import { isOpenRouterConfigured, streamBookmarkAssistant } from "@markme/ai";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const bodySchema = z.object({
    message: z.string().min(1).max(8000),
});

export async function POST(req: Request) {
    const { data: session } = await auth.getSession();
    const neonUser = session?.user;
    if (!neonUser?.id || !neonUser.email) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const db = createAuthDb() as AppDb | undefined;
    if (!db) {
        return new Response(JSON.stringify({ error: "Database not configured" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
        });
    }

    const appUser = await ensureAppUser(db as never, {
        id: neonUser.id,
        email: neonUser.email,
        name: neonUser.name,
        image: neonUser.image,
        emailVerified: neonUser.emailVerified,
    });
    const userId = String((appUser as { id: string }).id);

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

    if (!isOpenRouterConfigured()) {
        const enc = new TextEncoder();
        const msg =
            "AI is not configured (set OPENROUTER_API_KEY on the server). Your message was received.";
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
    const enc = new TextEncoder();
    const readable = new ReadableStream({
        async start(controller) {
            try {
                for await (const delta of streamBookmarkAssistant({
                    bookmarkContext,
                    userMessage: parsed.data.message,
                    signal: req.signal,
                })) {
                    controller.enqueue(enc.encode(`data: ${JSON.stringify({ text: delta })}\n\n`));
                }
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
