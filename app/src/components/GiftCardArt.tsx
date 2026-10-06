import { Text, View } from "react-native";
import { money } from "../lib/format";
import { Monogram } from "./Brand";
import { colors, fonts } from "./theme";
import { Row, T } from "./ui";

/** The gift card itself, in Noir or Ivory. */
export function GiftCardArt({ design, amount, currency, toName, message, width }: { design: "noir" | "ivory"; amount: number; currency: string; toName: string; message: string; width: number }) {
  const noir = design === "noir";
  const ink = noir ? colors.onInk : colors.ink;
  const muted = noir ? colors.inkMuted : colors.muted;
  return (
    <View style={{ width, height: Math.round(width / 1.586), borderRadius: 18, padding: width * 0.065, justifyContent: "space-between", backgroundColor: noir ? colors.ink : "#FBFAF7", borderWidth: 1, borderColor: noir ? colors.ink : colors.border }}>
      <Row style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <Monogram size={width * 0.12} color={ink} strokeWidth={2} />
        <T variant="eyebrow" color={muted} style={{ letterSpacing: 3 }}>Gift card</T>
      </Row>
      <View>
        <Text style={{ fontFamily: fonts.display, color: ink, fontSize: width * 0.13, letterSpacing: -1.5 }}>{money(amount, currency).replace(/[.,]00$/, "")}</Text>
        <T variant="caption" color={ink} numberOfLines={1} style={{ fontFamily: fonts.semibold, marginTop: 2 }}>For {toName || "someone fresh"}</T>
        {!!message && <T variant="small" color={muted} numberOfLines={2} style={{ marginTop: 2 }}>“{message}”</T>}
      </View>
    </View>
  );
}
