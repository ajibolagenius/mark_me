import OpenAI from "openai";
import { getOpenRouterApiKey } from "./env";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export function createOpenRouterClient(): OpenAI {
    const apiKey = getOpenRouterApiKey();
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not set");
    }

    return new OpenAI({
        apiKey,
        baseURL: OPENROUTER_BASE_URL,
        defaultHeaders: {
            "HTTP-Referer": process.env.AUTH_URL ?? "http://localhost:3000",
            "X-Title": "mark_me",
        },
    });
}
