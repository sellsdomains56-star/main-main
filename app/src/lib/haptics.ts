import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// Small physical confirmations on phones; nothing on the website.
const on = Platform.OS === "ios" || Platform.OS === "android";

/** A light tick: picking a time, a chip, a tab. */
export const tick = () => on && Haptics.selectionAsync().catch(() => {});
/** A soft tap: liking, saving. */
export const tap = () => on && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
/** Success: a booking or payment confirmed. */
export const success = () => on && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
