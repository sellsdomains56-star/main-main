import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { api } from "./api";

/** Pick a photo, shrink it to a sensible size, upload it, and return its URL path (or null if cancelled). */
export async function pickAndUploadImage(opts: { square?: boolean } = {}): Promise<string | null> {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: opts.square ? [1, 1] : undefined,
    quality: 1,
  });
  if (res.canceled || !res.assets[0]) return null;
  const rendered = await ImageManipulator.manipulate(res.assets[0].uri).resize({ width: 1440 }).renderAsync();
  const saved = await rendered.saveAsync({ compress: 0.82, format: SaveFormat.JPEG });
  const blob = await (await fetch(saved.uri)).blob();
  const { url } = await api.uploadImage(blob, "image/jpeg");
  return url;
}
