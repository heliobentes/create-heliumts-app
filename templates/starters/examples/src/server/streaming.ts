import { setTimeout as delay } from "node:timers/promises";

import { defineMethod, PublicError } from "heliumts/server";

/** A deterministic demo: no provider, credentials, or database required. */
export const streamText = defineMethod(async function* (
  args: { prompt: string; failAfterFirstChunk?: boolean },
  ctx,
) {
  const prompt =
    typeof args?.prompt === "string" ? args.prompt.trim().slice(0, 200) : "";
  if (!prompt) {
    throw new PublicError("Enter a short prompt to start the demo.");
  }
  const words =
    `Hello ${prompt}. Helium sends these typed chunks over HTTP. Cancel to keep the partial reply, or start again for a fresh response.`.match(
      /\S+\s*/g,
    ) ?? [];
  for (let index = 0; index < words.length; index++) {
    if (ctx.signal.aborted) {
      return;
    }
    try {
      await delay(60, undefined, { signal: ctx.signal });
    } catch (error) {
      if (ctx.signal.aborted) {
        return;
      }
      throw error;
    }
    yield words[index];
    if (args.failAfterFirstChunk && index === 0) {
      throw new PublicError(
        "Demo error after the first chunk. The partial reply is preserved.",
      );
    }
  }
});
