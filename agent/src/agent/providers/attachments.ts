import { isTextMime, isVisionImage } from "../../files.js";

export type AttachmentKind = "image" | "pdf" | "text" | "binary";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** How an attached file is shown to the model: as an image, a PDF document, inline text, or a pointer to the workspace copy. */
export function attachmentKind(mime: string, data: Buffer): AttachmentKind {
  if (isVisionImage(mime)) return data.length <= MAX_IMAGE_BYTES ? "image" : "binary";
  if (mime === "application/pdf") return "pdf";
  if (isTextMime(mime) && data.length <= 400_000 && !data.subarray(0, 8000).includes(0)) return "text";
  return "binary";
}
