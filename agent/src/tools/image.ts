import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import { config } from "../config.js";
import { registerGenerated, WORKSPACE_DIR } from "../files.js";
import type { FileRecord } from "../types.js";

let client: OpenAI | null = null;
function xai(): OpenAI {
  client ??= new OpenAI({ apiKey: config.xaiKey, baseURL: config.xaiBaseUrl, timeout: 180_000 });
  return client;
}

function extensionFor(data: Buffer): string {
  if (data[0] === 0x89 && data[1] === 0x50) return "png";
  if (data[0] === 0xff && data[1] === 0xd8) return "jpg";
  if (data.subarray(8, 12).toString() === "WEBP") return "webp";
  return "png";
}

/** Generates an image with Grok Imagine and saves it to the workspace. */
export async function generateImage(
  prompt: string,
  aspectRatio: string | undefined,
  conversationId: string,
  signal: AbortSignal,
): Promise<FileRecord> {
  const response = await xai().images.generate(
    {
      model: config.xaiImageModel,
      prompt,
      n: 1,
      response_format: "b64_json",
      // xAI-specific; the OpenAI SDK passes unknown body fields through.
      ...(aspectRatio ? ({ aspect_ratio: aspectRatio } as Record<string, string>) : {}),
    },
    { signal },
  );
  const item = response.data?.[0];
  let data: Buffer;
  if (item?.b64_json) data = Buffer.from(item.b64_json, "base64");
  else if (item?.url) data = Buffer.from(await (await fetch(item.url, { signal })).arrayBuffer());
  else throw new Error("The image service returned no image");

  const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "");
  const dir = path.join(WORKSPACE_DIR, "images");
  fs.mkdirSync(dir, { recursive: true });
  const name = `images/image-${stamp}.${extensionFor(data)}`;
  fs.writeFileSync(path.join(WORKSPACE_DIR, name), data);
  return registerGenerated(name, conversationId);
}
