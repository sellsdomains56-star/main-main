import OpenAI, { toFile } from "openai";
import { config } from "./config.js";

const openai = config.openaiConfigured ? new OpenAI() : undefined;

export class TryOnUnavailableError extends Error {}

/**
 * Renders a hairstyle onto the customer's own photo with OpenAI image editing.
 * The photo is sent only for this request and is never stored.
 */
export async function renderTryOn(photo: { data: string; mediaType: string }, look: string): Promise<string> {
  if (!openai) throw new TryOnUnavailableError("Try-on previews aren't switched on for this server yet.");
  const ext = photo.mediaType === "image/png" ? "png" : photo.mediaType === "image/webp" ? "webp" : "jpg";
  const image = await toFile(Buffer.from(photo.data, "base64"), `selfie.${ext}`, { type: photo.mediaType });

  const prompt = [
    "Edit this photo of a real person to preview a new barbershop look.",
    `New look: ${look}`,
    "Change ONLY the hair and/or facial hair. Keep the person's face, identity, facial features, skin tone, age, expression, head position, clothing, lighting, camera angle and background exactly the same.",
    "Make it photorealistic, with a natural hairline and texture that suits their real hair, as if freshly done by a skilled barber.",
  ].join("\n");

  const result = await openai.images.edit({
    model: config.openaiImageModel,
    image,
    prompt,
    size: "1024x1024",
    quality: "medium",
    output_format: "jpeg",
    output_compression: 85,
    input_fidelity: "high", // keeps the face closer to the original on models that support it
  });
  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new TryOnUnavailableError("The preview couldn't be created. Please try again.");
  return `data:image/jpeg;base64,${b64}`;
}
