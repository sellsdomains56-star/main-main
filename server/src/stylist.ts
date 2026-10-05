import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

const client = new Anthropic();

export const StyleAdvice = z.object({
  faceShape: z.string().describe("e.g. oval, round, square, heart, diamond, oblong"),
  hairType: z.string().describe("texture and density, e.g. 'thick, wavy'"),
  currentStyle: z.string().describe("short description of the current haircut"),
  summary: z.string().describe("2-3 friendly sentences explaining what suits this person and why"),
  recommendations: z
    .array(
      z.object({
        name: z.string().describe("style name, e.g. 'Mid skin fade with textured crop'"),
        category: z.enum(["haircut", "color", "beard"]).describe("what this changes"),
        description: z.string(),
        whyItSuits: z.string(),
        length: z.enum(["very short", "short", "medium", "long"]),
        maintenance: z.enum(["low", "medium", "high"]),
        askYourBarber: z.string().describe("exact words to tell the barber: clipper guards, length on top, finish"),
        specialtyTags: z
          .array(z.string())
          .describe("matching barber specialties from the provided list"),
        previewPrompt: z
          .string()
          .describe(
            "instruction for a photo-editing AI to show this exact look on THIS person: describe only the hair/beard result (lengths, fade height, texture, parting, colour, beard shape) in one or two sentences; never describe the face",
          ),
      }),
    )
    .describe("4 to 6 looks, best match first: mostly haircuts, plus one hair-colour idea and one beard style when they suit the person"),
  beardAdvice: z.string().describe("beard suggestion, or an empty string if not relevant"),
});

export type StyleAdvice = z.infer<typeof StyleAdvice>;

export interface StylePreferences {
  length?: string;
  maintenance?: string;
  vibe?: string;
  notes?: string;
}

const SYSTEM = `You are the JB Always Fresh AI stylist — a master barber who gives honest, specific, flattering haircut advice from a photo.
Look at the person's face shape, hairline, hair texture, density and current cut. Recommend haircuts a barber can actually do with their current hair (account for how long it needs to grow).
Be warm and confident. Never comment on attractiveness, age, ethnicity or anything other than hair, head shape and grooming.
If the photo does not clearly show a head or face, say so in the summary and return general recommendations based on the preferences.`;

export class StylistUnavailableError extends Error {}

export async function adviseHaircut(
  image: { data: string; mediaType: "image/jpeg" | "image/png" | "image/webp" },
  prefs: StylePreferences,
  specialties: string[],
): Promise<StyleAdvice> {
  const request = [
    `Preferences — length: ${prefs.length || "any"}, maintenance: ${prefs.maintenance || "any"}, vibe: ${prefs.vibe || "any"}.`,
    prefs.notes ? `Extra notes from the customer: ${prefs.notes}` : "",
    `Barber specialties available on the platform (use these exact strings for specialtyTags): ${specialties.join(", ")}.`,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.beta.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: betaZodOutputFormat(StyleAdvice) },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: image.mediaType, data: image.data } },
          { type: "text", text: request },
        ],
      },
    ],
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new StylistUnavailableError("The AI stylist couldn't analyse this photo. Try a clear, front-facing photo.");
  }
  return response.parsed_output;
}
