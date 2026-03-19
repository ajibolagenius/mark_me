import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicApiKey } from "./env";

export function createAnthropicClient(): Anthropic {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey });
}
