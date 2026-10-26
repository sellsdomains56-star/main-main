import * as DocumentPicker from "expo-document-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { DEMO_DATA } from "./config";

export type PickedDoc = { blob: Blob; contentType: string };

const MAX_MB = DEMO_DATA ? 2 : 10; // the demo keeps files in the browser, which has little room

/** Photos are resized so the text stays sharp but the upload stays small. */
async function shrink(uri: string, width: number): Promise<PickedDoc> {
  const target = DEMO_DATA ? 1100 : 1800;
  let ctx = ImageManipulator.manipulate(uri);
  if (width > target) ctx = ctx.resize({ width: target });
  const saved = await (await ctx.renderAsync()).saveAsync({ compress: DEMO_DATA ? 0.7 : 0.85, format: SaveFormat.JPEG });
  return { blob: await (await fetch(saved.uri)).blob(), contentType: "image/jpeg" };
}

/** Take a photo of a document with the camera. Null if cancelled. */
export async function photographDocument(): Promise<PickedDoc | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) throw new Error("Allow camera access to take a photo, or choose a file instead.");
  const res = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 1 });
  if (res.canceled || !res.assets[0]) return null;
  return shrink(res.assets[0].uri, res.assets[0].width);
}

/** Choose a photo or (when `pdf`) a PDF of a document. Null if cancelled. */
export async function chooseDocument(opts: { pdf?: boolean } = {}): Promise<PickedDoc | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: opts.pdf ? ["image/*", "application/pdf"] : ["image/*"], copyToCacheDirectory: true });
  if (res.canceled || !res.assets[0]) return null;
  const a = res.assets[0];
  if (a.size && a.size > MAX_MB * 1024 * 1024) throw new Error(`That file is over ${MAX_MB} MB. Choose a smaller one or take a photo.`);
  const type = a.mimeType ?? (a.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg");
  if (type === "application/pdf") return { blob: a.file ?? (await (await fetch(a.uri)).blob()), contentType: type };
  if (!type.startsWith("image/")) throw new Error("Choose a photo or a PDF.");
  return shrink(a.uri, Infinity);
}
