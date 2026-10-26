import QRCode from "qrcode";
import { useMemo } from "react";
import Svg, { Path, Rect } from "react-native-svg";
import { colors } from "./theme";

/** A QR code for a link, drawn as one SVG path (black on white, with the quiet zone scanners need). */
export function QrCode({ value, size = 200, label }: { value: string; size?: number; label?: string }) {
  const { path, cells } = useMemo(() => {
    const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
    const n = qr.modules.size;
    let d = "";
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.modules.get(x, y)) d += `M${x + 4} ${y + 4}h1v1h-1z`;
    return { path: d, cells: n + 8 };
  }, [value]);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${cells} ${cells}`} accessibilityLabel={label ?? `QR code for ${value}`}>
      <Rect width={cells} height={cells} fill="#FFFFFF" />
      <Path d={path} fill={colors.ink} />
    </Svg>
  );
}
