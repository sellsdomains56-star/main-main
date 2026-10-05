import type { ImageSourcePropType } from "react-native";

/**
 * Photography for the home screen (in assets/brand/). Swap files or entries here to change them.
 * Only use photos you own or have a licence for.
 */
export const HERO_PHOTOS: { source: ImageSourcePropType; label: string }[] = [
  { source: require("../../assets/brand/hero-barber-bw.jpg"), label: "A barber shaping a client's fade" },
  { source: require("../../assets/brand/hero-golden-fade.jpg"), label: "A fresh skin fade in warm shop light" },
  { source: require("../../assets/brand/hero-beard-trim.jpg"), label: "A beard trim in the chair" },
];

export const SERVICE_PHOTOS: Partial<Record<"haircut" | "fade" | "beard" | "shave" | "styling" | "products", ImageSourcePropType>> = {
  haircut: require("../../assets/brand/tile-haircut.jpg"),
  beard: require("../../assets/brand/tile-beard.jpg"),
  shave: require("../../assets/brand/tile-shave.jpg"),
  fade: require("../../assets/brand/tile-fade.jpg"),
  styling: require("../../assets/brand/tile-styling.jpg"),
};

export const TRYON_PHOTO: ImageSourcePropType = require("../../assets/brand/feature-tryon.jpg");

/** Barbershop photos: the API sends "brand:<name>" for the shop photography bundled here, or a URL. */
const SHOP_PHOTOS: Record<string, ImageSourcePropType> = {
  "hero-barber-bw": HERO_PHOTOS[0].source,
  "hero-golden-fade": HERO_PHOTOS[1].source,
  "hero-beard-trim": HERO_PHOTOS[2].source,
  "tile-haircut": SERVICE_PHOTOS.haircut!,
  "tile-beard": SERVICE_PHOTOS.beard!,
  "tile-shave": SERVICE_PHOTOS.shave!,
  "tile-fade": SERVICE_PHOTOS.fade!,
  "tile-styling": SERVICE_PHOTOS.styling!,
};

export function shopPhoto(photoUrl: string, resolve: (url: string) => string): ImageSourcePropType | null {
  if (photoUrl.startsWith("brand:")) return SHOP_PHOTOS[photoUrl.slice(6)] ?? null;
  return photoUrl ? { uri: resolve(photoUrl) } : null;
}
