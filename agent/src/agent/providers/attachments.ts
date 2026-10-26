import { isTextMime, isVisionImage } from "../../files.js";
import type { StoredMessage } from "../../types.js";

/** The text of a user turn as the model sees it, with a note when it was a scheduled task or said on a call. */
export function userTurnText(m: StoredMessage): string {
  const notes = [
    m.scheduled ? "[Scheduled task — the user isn't watching live; do it and report the result]" : "",
    m.voice
      ? "[Voice call — the user said this out loud and will hear your reply spoken. Answer like a person on the phone: short, " +
        "natural sentences, no Markdown, lists, tables, links or emoji; offer details only if asked. Spell out numbers and symbols the way you'd say them.]"
      : "",
  ].filter(Boolean);
  return notes.length ? `${notes.join("\n")}\n${m.text}` : m.text;
}

export type AttachmentKind = "image" | "pdf" | "text" | "binary";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** How an attached file is shown to the model: as an image, a PDF document, inline text, or a pointer to the workspace copy. */
export function attachmentKind(mime: string, data: Buffer): AttachmentKind {
  if (isVisionImage(mime)) return data.length <= MAX_IMAGE_BYTES ? "image" : "binary";
  if (mime === "application/pdf") return "pdf";
  if (isTextMime(mime) && data.length <= 400_000 && !data.subarray(0, 8000).includes(0)) return "text";
  return "binary";
}
