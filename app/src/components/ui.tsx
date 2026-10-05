import { Ionicons } from "@expo/vector-icons";
import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { resolveMedia } from "../lib/config";
import { colors, fonts, glow, glowSmall, radius, shadow } from "./theme";

export type IconName = keyof typeof Ionicons.glyphMap;

// ---------- Typography ----------

const variants = {
  display: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40, letterSpacing: -0.8 },
  title: { fontFamily: fonts.regular, fontSize: 24, lineHeight: 30, letterSpacing: -0.4 },
  heading: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, letterSpacing: -0.1 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  strong: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  small: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  eyebrow: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 1.8, textTransform: "uppercase" as const },
} satisfies Record<string, TextStyle>;

export function T({
  children,
  variant = "body",
  muted,
  color,
  center,
  numberOfLines,
  style,
}: {
  children: ReactNode;
  variant?: keyof typeof variants;
  muted?: boolean;
  color?: string;
  center?: boolean;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
}) {
  const fallback = variant === "eyebrow" ? colors.gold : muted ? colors.muted : colors.text;
  return (
    <Text numberOfLines={numberOfLines} style={[variants[variant], { color: color ?? fallback }, center && { textAlign: "center" }, style]}>
      {children}
    </Text>
  );
}

// ---------- Layout ----------

/** Page container: readable max width (so it also works as a website) and an optional sticky footer. */
export function Screen({
  children,
  footer,
  scroll = true,
  padded = true,
  background = colors.bg,
}: {
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  background?: string;
}) {
  const inner = <View style={[styles.inner, padded && styles.padded]}>{children}</View>;
  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      {scroll ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
      {footer && <Footer>{footer}</Footer>}
    </View>
  );
}

export function Footer({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.footerInner}>{children}</View>
    </View>
  );
}

export function Section({ title, eyebrow, action, children, style }: { title?: string; eyebrow?: string; action?: { label: string; onPress: () => void }; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ marginTop: 28 }, style]}>
      {(title || action || eyebrow) && (
        <View style={[styles.rowBetween, { marginBottom: 14, alignItems: "flex-end" }]}>
          <View style={{ flex: 1 }}>
            {eyebrow && <T variant="eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</T>}
            {title ? <T variant="heading">{title}</T> : null}
          </View>
          {action && (
            <Pressable onPress={action.onPress} hitSlop={10}>
              <T variant="caption" color={colors.gold} style={{ fontFamily: fonts.semibold }}>{action.label}</T>
            </Pressable>
          )}
        </View>
      )}
      {children}
    </View>
  );
}

export function Row({ children, style, gap = 8 }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return <View style={[{ flexDirection: "row", alignItems: "center", gap }, style]}>{children}</View>;
}

export function Wrap({ children, gap = 8 }: { children: ReactNode; gap?: number }) {
  return <View style={{ flexDirection: "row", flexWrap: "wrap", gap }}>{children}</View>;
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 12 }, style]} />;
}

// ---------- Surfaces ----------

/** A charcoal card. `glowing` gives it the gold edge light used for the one thing that matters most. */
export function Card({
  children,
  style,
  onPress,
  tone = "card",
  glowing,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  tone?: "card" | "surface";
  glowing?: boolean;
}) {
  const base = [tone === "card" ? styles.card : styles.surfaceCard, glowing && styles.cardGlow, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [base, pressed && styles.pressed, focused && styles.focusRing]}>
      {children}
    </Pressable>
  );
}

/**
 * A numbered step in a flow (try-on, booking): eyebrow "STEP 1", a light title, content.
 * The active step glows; finished steps keep a gold check; upcoming ones are dimmed.
 */
export function StepCard({ step, title, state = "active", children, right }: { step: number; title: string; state?: "active" | "done" | "upcoming"; children?: ReactNode; right?: ReactNode }) {
  return (
    <View style={[styles.card, { padding: 20 }, state === "active" && styles.cardGlow, state === "upcoming" && { opacity: 0.55 }]}>
      <Row style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <Row gap={6}>
            <T variant="eyebrow" color={state === "upcoming" ? colors.faint : colors.gold}>Step {step}</T>
            {state === "done" && <Ionicons name="checkmark-circle" size={13} color={colors.gold} />}
          </Row>
          <T variant="title" style={{ marginTop: 8 }}>{title}</T>
        </View>
        {right}
      </Row>
      {children && <View style={{ marginTop: 16 }}>{children}</View>}
    </View>
  );
}

/** The glowing line with dots that links one step card to the next. */
export function StepConnector({ lit = true, side = "left" }: { lit?: boolean; side?: "left" | "right" }) {
  const lineColor = lit ? colors.gold : colors.surfaceStrong;
  const edge = side === "left" ? { left: 0 } : { right: 0 };
  const dotEdge = side === "left" ? { left: -4 } : { right: -4 };
  return (
    <View style={{ height: 36, marginHorizontal: 34 }} pointerEvents="none" accessible={false}>
      <View style={[{ position: "absolute", top: 0, bottom: 0, width: 2, backgroundColor: lineColor }, edge, lit && glowSmall]} />
      <View style={[styles.connectorDot, { top: -5, backgroundColor: lineColor }, dotEdge, lit && glowSmall]} />
      <View style={[styles.connectorDot, { bottom: -5, backgroundColor: lineColor }, dotEdge, lit && glowSmall]} />
    </View>
  );
}

// ---------- Controls ----------

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "lg",
  loading,
  disabled,
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gold";
  size?: "lg" | "md" | "sm";
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const gold = variant === "primary" || variant === "gold";
  const bg = gold ? colors.gold : variant === "secondary" ? colors.surface : variant === "danger" ? colors.dangerSoft : "transparent";
  const fg = gold ? colors.onGold : variant === "secondary" ? colors.text : variant === "danger" ? colors.danger : colors.gold;
  const height = { lg: 54, md: 46, sm: 40 }[size];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        styles.button,
        { backgroundColor: bg, height, paddingHorizontal: size === "sm" ? 14 : 22, opacity: disabled ? 0.35 : 1 },
        variant === "secondary" && { borderWidth: 1, borderColor: colors.border },
        gold && !disabled && glowSmall,
        pressed && styles.pressed,
        focused && styles.focusRing,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Row gap={8}>
          {icon && <Ionicons name={icon} size={size === "sm" ? 15 : 18} color={fg} />}
          <T variant={size === "sm" ? "caption" : "strong"} color={fg} style={{ fontFamily: fonts.semibold }}>{title}</T>
        </Row>
      )}
    </Pressable>
  );
}

export function IconButton({ icon, onPress, label, badge, tone = "surface" }: { icon: IconName; onPress: () => void; label: string; badge?: number; tone?: "surface" | "plain" }) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        styles.iconButton,
        tone === "surface" && { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
        pressed && styles.pressed,
        focused && styles.focusRing,
      ]}
    >
      <Ionicons name={icon} size={20} color={colors.text} />
      {!!badge && (
        <View style={styles.badge}>
          <Text style={{ color: colors.onGold, fontFamily: fonts.bold, fontSize: 10 }}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

/** A chip. Selected = gold edge and glow, like the chosen option in the reference. */
export function Pill({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityState={{ selected }}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [styles.pill, selected && styles.pillSelected, pressed && styles.pressed, focused && styles.focusRing]}
    >
      <Row gap={6}>
        {icon && <Ionicons name={icon} size={14} color={selected ? colors.gold : colors.muted} />}
        <T variant="caption" color={selected ? colors.text : colors.muted} style={{ fontFamily: fonts.semibold }}>{label}</T>
      </Row>
    </Pressable>
  );
}

/** A full-width option with a radio and optional icon — the "Oily / Dry / Balanced" list from the reference. */
export function OptionRow({ label, sublabel, selected, onPress, icon, right }: { label: string; sublabel?: string; selected?: boolean; onPress: () => void; icon?: IconName; right?: ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed, focused && styles.focusRing]}
    >
      <View style={[styles.radio, selected && { borderColor: colors.gold }]}>{selected && <View style={styles.radioDot} />}</View>
      <View style={{ flex: 1 }}>
        <T variant="strong">{label}</T>
        {sublabel && <T variant="caption" muted>{sublabel}</T>}
      </View>
      {right}
      {icon && <Ionicons name={icon} size={18} color={selected ? colors.gold : colors.faint} />}
    </Pressable>
  );
}

export function Segmented<V extends string>({ options, value, onChange }: { options: { value: V; label: string }[]; value: V; onChange: (v: V) => void }) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)} style={[styles.segment, active && styles.segmentActive]} accessibilityState={{ selected: active }}>
            <T variant="caption" color={active ? colors.gold : colors.muted} style={{ fontFamily: fonts.semibold }}>{o.label}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

const noOutline = Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : {};

export function Field({ label, style, ...props }: TextInputProps & { label: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[{ marginBottom: 14 }, style as ViewStyle]}>
      <T variant="caption" muted style={{ marginBottom: 6 }}>{label}</T>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.faint}
        selectionColor={colors.gold}
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[styles.input, focused && [{ borderColor: colors.goldLine }, glowSmall], props.multiline && { minHeight: 96, textAlignVertical: "top", paddingTop: 14 }, noOutline]}
      />
    </View>
  );
}

export function SearchBar({ value, onChangeText, placeholder, onPress, autoFocus }: { value?: string; onChangeText?: (v: string) => void; placeholder: string; onPress?: () => void; autoFocus?: boolean }) {
  const content = (
    <View style={styles.search}>
      <Ionicons name="search" size={18} color={colors.gold} />
      {onPress ? (
        <T muted style={{ marginLeft: 10, flex: 1 }} numberOfLines={1}>{placeholder}</T>
      ) : (
        <TextInput
          accessibilityLabel={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.faint}
          selectionColor={colors.gold}
          autoFocus={autoFocus}
          autoCapitalize="none"
          style={[{ flex: 1, marginLeft: 10, fontFamily: fonts.regular, fontSize: 16, color: colors.text, paddingVertical: 0 }, noOutline]}
        />
      )}
    </View>
  );
  return onPress ? <Pressable onPress={onPress} accessibilityRole="search" style={({ pressed }) => pressed && styles.pressed}>{content}</Pressable> : content;
}

// ---------- Data display ----------

export function Rating({ value, count, size = "caption" }: { value: number | null; count?: number; size?: "caption" | "strong" }) {
  return (
    <Row gap={4}>
      <Ionicons name="star" size={size === "strong" ? 16 : 13} color={colors.gold} />
      <T variant={size} style={{ fontFamily: fonts.semibold }}>{value ? value.toFixed(1) : "New"}</T>
      {count !== undefined && value !== null && <T variant={size} muted>({count})</T>}
    </Row>
  );
}

export function StarsInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Row gap={10}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onChange(n)} hitSlop={6} accessibilityLabel={`${n} stars`}>
          <Ionicons name={value >= n ? "star" : "star-outline"} size={38} color={colors.gold} />
        </Pressable>
      ))}
    </Row>
  );
}

export function Tag({ label, tone = "neutral", icon }: { label: string; tone?: "neutral" | "gold" | "dark" | "danger"; icon?: IconName }) {
  const bg = { neutral: colors.surface, gold: colors.goldSoft, dark: "#000", danger: colors.dangerSoft }[tone];
  const fg = { neutral: colors.muted, gold: colors.gold, dark: colors.gold, danger: colors.danger }[tone];
  return (
    <View style={[styles.tag, { backgroundColor: bg }, tone === "dark" && { borderWidth: 1, borderColor: colors.goldLine }]}>
      <Row gap={4}>
        {icon && <Ionicons name={icon} size={12} color={fg} />}
        <T variant="small" color={fg} style={{ fontFamily: fonts.semibold }}>{label}</T>
      </Row>
    </View>
  );
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

/** Photo with a graceful initials fallback (no grey boxes when an image fails to load). */
export function Photo({ uri, name, style, rounded = radius.md }: { uri?: string | null; name: string; style: StyleProp<ViewStyle>; rounded?: number }) {
  const [failed, setFailed] = useState(false);
  const src = resolveMedia(uri); // media served by our API (or bundled in the demo)
  const flat = StyleSheet.flatten(style) as ViewStyle;
  const size = typeof flat?.width === "number" ? flat.width : 64;
  if (!src || failed) {
    return (
      <View style={[{ backgroundColor: colors.card, borderWidth: 1, borderColor: "rgba(242,181,58,0.35)", alignItems: "center", justifyContent: "center", borderRadius: rounded, overflow: "hidden" }, style]}>
        <Text style={{ color: colors.gold, fontFamily: fonts.display, fontSize: Math.max(14, Math.min(size * 0.36, 42)), letterSpacing: 1 }}>{initials(name)}</Text>
      </View>
    );
  }
  return <Image source={{ uri: src }} onError={() => setFailed(true)} accessibilityLabel={name} style={[{ borderRadius: rounded, backgroundColor: colors.surface }, style as object]} />;
}

export function Avatar({ uri, name, size = 48 }: { uri?: string | null; name: string; size?: number }) {
  return <Photo uri={uri} name={name} style={{ width: size, height: size }} rounded={size / 2} />;
}

export function ListRow({ icon, title, subtitle, onPress, right, danger }: { icon: IconName; title: string; subtitle?: string; onPress?: () => void; right?: ReactNode; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [styles.listRow, pressed && { backgroundColor: colors.surface }, focused && styles.focusRing]}>
      <View style={[styles.listIcon, danger && { backgroundColor: colors.dangerSoft, borderColor: "transparent" }]}>
        <Ionicons name={icon} size={19} color={danger ? colors.danger : colors.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <T variant="strong" color={danger ? colors.danger : undefined}>{title}</T>
        {subtitle && <T variant="caption" muted>{subtitle}</T>}
      </View>
      {right ?? (onPress && <Ionicons name="chevron-forward" size={18} color={colors.faint} />)}
    </Pressable>
  );
}

export function Loading() {
  return (
    <View style={{ padding: 40, alignItems: "center" }}>
      <ActivityIndicator color={colors.gold} />
    </View>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={[styles.surfaceCard, { backgroundColor: colors.dangerSoft, marginBottom: 12, borderColor: "transparent" }]}>
      <Row gap={8} style={{ alignItems: "flex-start" }}>
        <Ionicons name="alert-circle" size={18} color={colors.danger} />
        <T variant="caption" color={colors.danger} style={{ flex: 1 }}>{message}</T>
      </Row>
      {onRetry && <Button title="Try again" variant="ghost" size="sm" onPress={onRetry} style={{ alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 0 }} />}
    </View>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: IconName; title: string; body?: string; action?: { label: string; onPress: () => void } }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 }}>
      <GoldIcon icon={icon} size={64} />
      <T variant="heading" center style={{ marginTop: 16 }}>{title}</T>
      {body && <T muted center style={{ marginTop: 6 }}>{body}</T>}
      {action && <Button title={action.label} onPress={action.onPress} size="md" style={{ marginTop: 18, alignSelf: "center" }} />}
    </View>
  );
}

export function SummaryLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Row style={{ justifyContent: "space-between", marginVertical: 3 }}>
      <T variant={strong ? "heading" : "body"} muted={!strong}>{label}</T>
      <T variant={strong ? "heading" : "strong"} color={strong ? colors.gold : undefined}>{value}</T>
    </Row>
  );
}

/** A small line of text led by a gold icon (replaces emoji bullets). */
export function IconLine({ icon, children, muted }: { icon: IconName; children: ReactNode; muted?: boolean }) {
  return (
    <Row gap={8} style={{ alignItems: "flex-start" }}>
      <Ionicons name={icon} size={15} color={colors.gold} style={{ marginTop: 1 }} />
      <T variant="caption" muted={muted} style={{ flex: 1 }}>{children}</T>
    </Row>
  );
}

/** Gold line icon in a dark, gold-ringed circle — the standard illustration for tiles and empty states. */
export function GoldIcon({ icon, size = 44, dark }: { icon: IconName; size?: number; dark?: boolean }) {
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center",
        backgroundColor: dark ? "rgba(242,181,58,0.10)" : colors.goldSoft, borderWidth: 1, borderColor: "rgba(242,181,58,0.30)",
      }}
    >
      <Ionicons name={icon} size={size * 0.46} color={colors.gold} />
    </View>
  );
}

export const styles = StyleSheet.create({
  inner: { width: "100%", maxWidth: 760, alignSelf: "center" },
  padded: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border, ...shadow },
  cardGlow: { borderColor: colors.goldLine, ...glow },
  surfaceCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: 0.75 },
  // Keyboard focus on the website (a no-op on phones).
  focusRing: Platform.select({ web: { outlineStyle: "solid", outlineWidth: 2, outlineColor: colors.gold, outlineOffset: 2 } as object, default: {} }),
  button: { borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  iconButton: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center", paddingHorizontal: 4, borderWidth: 2, borderColor: colors.bg },
  pill: { borderRadius: radius.pill, paddingVertical: 9, paddingHorizontal: 14, minHeight: 40, justifyContent: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pillSelected: { backgroundColor: "rgba(242,181,58,0.10)", borderColor: colors.gold, ...glowSmall },
  option: { flexDirection: "row", alignItems: "center", gap: 14, minHeight: 56, paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  optionSelected: { backgroundColor: "rgba(242,181,58,0.07)", borderColor: colors.gold, ...glow },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.faint, alignItems: "center", justifyContent: "center" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gold },
  connectorDot: { position: "absolute", width: 10, height: 10, borderRadius: 5 },
  segmented: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: radius.pill, padding: 4, borderWidth: 1, borderColor: colors.border },
  segment: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: radius.pill },
  segmentActive: { backgroundColor: colors.surfaceStrong },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, fontFamily: fonts.regular, color: colors.text },
  search: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: colors.border },
  tag: { borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4, alignSelf: "flex-start" },
  listRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, paddingHorizontal: 4, borderRadius: radius.md },
  listIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.card, paddingTop: 12, paddingHorizontal: 20 },
  footerInner: { width: "100%", maxWidth: 720, alignSelf: "center" },
});

/** The hero call to action: a gold pill with the arrow in its own dark circle. */
export function ArrowButton({ title, onPress, style }: { title: string; onPress: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        { flexDirection: "row", alignItems: "center", gap: 14, alignSelf: "flex-start", backgroundColor: colors.gold, borderRadius: radius.pill, paddingLeft: 22, paddingRight: 6, height: 54 },
        glowSmall,
        pressed && styles.pressed,
        focused && styles.focusRing,
        style,
      ]}
    >
      <T variant="eyebrow" color={colors.onGold} style={{ fontSize: 12 }}>{title}</T>
      <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.onGold, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="arrow-forward" size={18} color={colors.gold} />
      </View>
    </Pressable>
  );
}

/** "01 — CONSULTATION" style timeline: numbered steps on a thin line, the current one lit gold. */
export function Timeline({ steps, active = 0 }: { steps: { title: string; body: string }[]; active?: number }) {
  return (
    <View>
      {steps.map((s, i) => (
        <View key={s.title} style={{ flexDirection: "row", gap: 14 }}>
          <View style={{ alignItems: "center", width: 12 }}>
            <View style={[{ width: 10, height: 10, borderRadius: 5, marginTop: 3, backgroundColor: i === active ? colors.gold : colors.surfaceStrong }, i === active && glowSmall]} />
            {i < steps.length - 1 && <View style={{ flex: 1, width: 1, backgroundColor: i < active ? colors.gold : colors.border, marginVertical: 4 }} />}
          </View>
          <View style={{ flex: 1, paddingBottom: i < steps.length - 1 ? 20 : 0 }}>
            <T variant="eyebrow" color={i === active ? colors.text : colors.muted}>{`${String(i + 1).padStart(2, "0")} — ${s.title}`}</T>
            <T variant="caption" muted style={{ marginTop: 4 }}>{s.body}</T>
          </View>
        </View>
      ))}
    </View>
  );
}
