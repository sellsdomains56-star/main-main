import type { ImageSourcePropType } from "react-native";

/**
 * Real photography for the home screen. Put images in assets/brand/ and point these at them,
 * e.g. HERO_PHOTO = require("../../assets/brand/hero.jpg"). Until then the screens use
 * black poster panels and line art, so nothing looks broken.
 */
export const HERO_PHOTO: ImageSourcePropType | null = null;

export const SERVICE_PHOTOS: Partial<Record<"haircut" | "fade" | "beard" | "shave" | "styling" | "products", ImageSourcePropType>> = {};
