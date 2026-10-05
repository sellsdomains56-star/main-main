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
import { colors, emphasis, fonts, radius, raise, shadow } from "./theme";

export type IconName = keyof typeof Ionicons.glyphMap;

// ---------- Typography ----------

const variants = {
  display: { fontFamily: fonts.display, fontSize: 34, lineHeight: 38, letterSpacing: -1.2 },
  title: { fontFamily: fonts.medium, fontSize: 24, lineHeight: 29, letterSpacing: -0.6 },
  heading: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  strong: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  small: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  eyebrow: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 1.6, textTransform: "uppercase" as const },
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
  return (
    <Text numberOfLines={numberOfLines} style={[variants[variant], { color: color ?? (muted ? colors.muted : colors.text) }, center && { textAlign: "center" }, style]}>
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
    <View style={[{ marginTop: 32 }, style]}>
      {(title || action || eyebrow) && (
        <View style={[styles.rowBetween, { marginBottom: 14, alignItems: "flex-end" }]}>
          <View style={{ flex: 1 }}>
            {eyebrow && <T variant="eyebrow" muted style={{ marginBottom: 6 }}>{eyebrow}</T>}
            {title ? <T variant="title" style={{ fontSize: 22, lineHeight: 27 }}>{title}</T> : null}
          </View>
          {action && (
            <Pressable onPress={action.onPress} hitSlop={10} accessibilityRole="link" style={({ pressed }) => [styles.textLink, pressed && styles.pressed]}>
              <T variant="caption" style={{ fontFamily: fonts.semibold }}>{action.label}</T>
              <Ionicons name="arrow-forward" size={14} color={colors.text} />
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

/** A white card. `highlighted` gives it the crisp black edge used for the one thing that matters most. */
export function Card({
  children,
  style,
  onPress,
  tone = "card",
  highlighted,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  tone?: "card" | "surface" | "ink";
  highlighted?: boolean;
}) {
  const base = [tone === "card" ? styles.card : tone === "ink" ? styles.inkCard : styles.surfaceCard, highlighted && styles.cardActive, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [base, pressed && styles.pressed, focused && styles.focusRing]}>
      {children}
    </Pressable>
  );
}

/**
 * A numbered step in a flow (try-on, booking): "01 — STEP", a title, content.
 * The active step gets a black edge; finished steps show a check; upcoming ones are dimmed.
 */
export function StepCard({ step, title, state = "active", children, right }: { step: number; title: string; state?: "active" | "done" | "upcoming"; children?: ReactNode; right?: ReactNode }) {
  return (
    <View style={[styles.card, { padding: 20 }, state === "active" && styles.cardActive, state === "upcoming" && { opacity: 0.5 }]}>
      <Row style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <Row gap={6}>
            <T variant="eyebrow" color={state === "active" ? colors.text : colors.muted} style={{ fontFamily: fonts.bold }}>{`Step ${String(step).padStart(2, "0")}`}</T>
            {state === "done" && <Ionicons name="checkmark-circle" size={14} color={colors.text} />}
          </Row>
          <T variant="title" style={{ marginTop: 8 }}>{title}</T>
        </View>
        {right}
      </Row>
      {children && <View style={{ marginTop: 16 }}>{children}</View>}
    </View>
  );
}

/** The thin line with dots that links one step card to the next. */
export function StepConnector({ lit = true, side = "left" }: { lit?: boolean; side?: "left" | "right" }) {
  const lineColor = lit ? colors.text : colors.surfaceStrong;
  const edge = side === "left" ? { left: 0 } : { right: 0 };
  const dotEdge = side === "left" ? { left: -4 } : { right: -4 };
  return (
    <View style={{ height: 32, marginHorizontal: 34 }} pointerEvents="none" accessible={false}>
      <View style={[{ position: "absolute", top: 0, bottom: 0, width: 1.5, backgroundColor: lineColor }, edge]} />
      <View style={[styles.connectorDot, { top: -5, backgroundColor: lineColor }, dotEdge]} />
      <View style={[styles.connectorDot, { bottom: -5, backgroundColor: lineColor }, dotEdge]} />
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
  variant?: "primary" | "secondary" | "ghost" | "danger" | "light";
  size?: "lg" | "md" | "sm";
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const solid = variant === "primary";
  const bg = { primary: colors.accent, secondary: colors.card, ghost: "transparent", danger: colors.dangerSoft, light: colors.onInk }[variant];
  const fg = { primary: colors.onAccent, secondary: colors.text, ghost: colors.text, danger: colors.danger, light: colors.ink }[variant];
  const height = { lg: 54, md: 46, sm: 40 }[size];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        styles.button,
        { backgroundColor: bg, height, paddingHorizontal: size === "sm" ? 14 : 22, opacity: disabled ? 0.3 : 1 },
        variant === "secondary" && { borderWidth: 1, borderColor: colors.border },
        solid && !disabled && raise,
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

export function IconButton({ icon, onPress, label, badge, tone = "surface" }: { icon: IconName; onPress: () => void; label: string; badge?: number; tone?: "surface" | "plain" | "ink" }) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        styles.iconButton,
        tone === "surface" && { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
        tone === "ink" && { backgroundColor: colors.ink },
        pressed && styles.pressed,
        focused && styles.focusRing,
      ]}
    >
      <Ionicons name={icon} size={20} color={tone === "ink" ? colors.onInk : colors.text} />
      {!!badge && (
        <View style={styles.badge}>
          <Text style={{ color: colors.onAccent, fontFamily: fonts.bold, fontSize: 10 }}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

/** A chip. Selected = filled black. */
export function Pill({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityState={{ selected }}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [styles.pill, selected && styles.pillSelected, pressed && styles.pressed, focused && styles.focusRing]}
    >
      <Row gap={6}>
        {icon && <Ionicons name={icon} size={14} color={selected ? colors.onAccent : colors.muted} />}
        <T variant="caption" color={selected ? colors.onAccent : colors.text} style={{ fontFamily: fonts.semibold }}>{label}</T>
      </Row>
    </Pressable>
  );
}

/** A full-width option with a radio and optional icon. */
export function OptionRow({ label, sublabel, selected, onPress, icon, right }: { label: string; sublabel?: string; selected?: boolean; onPress: () => void; icon?: IconName; right?: ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed, focused && styles.focusRing]}
    >
      <View style={[styles.radio, selected && { borderColor: colors.accent }]}>{selected && <View style={styles.radioDot} />}</View>
      <View style={{ flex: 1 }}>
        <T variant="strong">{label}</T>
        {sublabel && <T variant="caption" muted>{sublabel}</T>}
      </View>
      {right}
      {icon && <Ionicons name={icon} size={18} color={selected ? colors.text : colors.faint} />}
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
            <T variant="caption" color={active ? colors.onAccent : colors.muted} style={{ fontFamily: fonts.semibold }} numberOfLines={1}>{o.label}</T>
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
        selectionColor={colors.accent}
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[styles.input, focused && { borderColor: colors.accentLine }, props.multiline && { minHeight: 96, textAlignVertical: "top", paddingTop: 14 }, noOutline]}
      />
    </View>
  );
}

export function SearchBar({ value, onChangeText, placeholder, onPress, autoFocus }: { value?: string; onChangeText?: (v: string) => void; placeholder: string; onPress?: () => void; autoFocus?: boolean }) {
  const content = (
    <View style={styles.search}>
      <Ionicons name="search" size={18} color={colors.text} />
      {onPress ? (
        <T muted style={{ marginLeft: 10, flex: 1 }} numberOfLines={1}>{placeholder}</T>
      ) : (
        <TextInput
          accessibilityLabel={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.faint}
          selectionColor={colors.accent}
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

export function Rating({ value, count, size = "caption", color = colors.text }: { value: number | null; count?: number; size?: "caption" | "strong"; color?: string }) {
  return (
    <Row gap={4}>
      <Ionicons name="star" size={size === "strong" ? 16 : 13} color={color} />
      <T variant={size} color={color} style={{ fontFamily: fonts.semibold }}>{value ? value.toFixed(1) : "New"}</T>
      {count !== undefined && value !== null && <T variant={size} color={color === colors.text ? colors.muted : color}>({count})</T>}
    </Row>
  );
}

export function StarsInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Row gap={10}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onChange(n)} hitSlop={6} accessibilityLabel={`${n} stars`}>
          <Ionicons name={value >= n ? "star" : "star-outline"} size={38} color={colors.text} />
        </Pressable>
      ))}
    </Row>
  );
}

export function Tag({ label, tone = "neutral", icon }: { label: string; tone?: "neutral" | "accent" | "dark" | "light" | "danger"; icon?: IconName }) {
  const bg = { neutral: colors.surface, accent: colors.accent, dark: colors.ink, light: colors.onInk, danger: colors.dangerSoft }[tone];
  const fg = { neutral: colors.text, accent: colors.onAccent, dark: colors.onInk, light: colors.ink, danger: colors.danger }[tone];
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
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

/** Photo with a graceful fallback: a black tile with initials (no grey boxes when an image fails to load). */
export function Photo({ uri, name, style, rounded = radius.md }: { uri?: string | null; name: string; style: StyleProp<ViewStyle>; rounded?: number }) {
  const [failed, setFailed] = useState(false);
  const src = resolveMedia(uri); // media served by our API (or bundled in the demo)
  const flat = StyleSheet.flatten(style) as ViewStyle;
  const size = typeof flat?.width === "number" ? flat.width : 64;
  if (!src || failed) {
    return (
      <View style={[{ backgroundColor: colors.ink, alignItems: "center", justifyContent: "center", borderRadius: rounded, overflow: "hidden" }, style]}>
        <Text style={{ color: colors.onInk, fontFamily: fonts.medium, fontSize: Math.max(14, Math.min(size * 0.34, 44)), letterSpacing: -0.5 }}>{initials(name)}</Text>
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
      <View style={[styles.listIcon, danger && { backgroundColor: colors.dangerSoft }]}>
        <Ionicons name={icon} size={19} color={danger ? colors.danger : colors.text} />
      </View>
      <View style={{ flex: 1 }}>
        <T variant="strong" color={danger ? colors.danger : undefined}>{title}</T>
        {subtitle && <T variant="caption" muted>{subtitle}</T>}
      </View>
      {right ?? (onPress && <Ionicons name="chevron-forward" size={18} color={colors.faint} />)}
    </Pressable>
  );
}

export function Loading({ color = colors.text }: { color?: string }) {
  return (
    <View style={{ padding: 40, alignItems: "center" }}>
      <ActivityIndicator color={color} />
    </View>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={[styles.surfaceCard, { backgroundColor: colors.dangerSoft, marginBottom: 12 }]}>
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
      <IconBadge icon={icon} size={64} />
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
      <T variant={strong ? "heading" : "strong"}>{value}</T>
    </Row>
  );
}

/** A small line of text led by an icon (replaces emoji bullets). */
export function IconLine({ icon, children, muted }: { icon: IconName; children: ReactNode; muted?: boolean }) {
  return (
    <Row gap={8} style={{ alignItems: "flex-start" }}>
      <Ionicons name={icon} size={15} color={colors.text} style={{ marginTop: 1 }} />
      <T variant="caption" muted={muted} style={{ flex: 1 }}>{children}</T>
    </Row>
  );
}

/** A line icon in a circle — black on the page, white when `dark` (sitting on a black panel). */
export function IconBadge({ icon, size = 44, dark }: { icon: IconName; size?: number; dark?: boolean }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center", backgroundColor: dark ? colors.onInk : colors.ink }}>
      <Ionicons name={icon} size={size * 0.46} color={dark ? colors.ink : colors.onInk} />
    </View>
  );
}

/** The hero call to action from the reference: a black pill with the arrow in its own white circle. */
export function ArrowButton({ title, onPress, style, light }: { title: string; onPress: () => void; style?: StyleProp<ViewStyle>; light?: boolean }) {
  const bg = light ? colors.onInk : colors.ink;
  const fg = light ? colors.ink : colors.onInk;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        { flexDirection: "row", alignItems: "center", gap: 14, alignSelf: "flex-start", backgroundColor: bg, borderRadius: radius.pill, paddingLeft: 22, paddingRight: 6, height: 52 },
        pressed && styles.pressed,
        focused && styles.focusRing,
        style,
      ]}
    >
      <T variant="eyebrow" color={fg} numberOfLines={1} style={{ fontSize: 12, letterSpacing: 1.4 }}>{title}</T>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: fg, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="arrow-forward" size={18} color={bg} />
      </View>
    </Pressable>
  );
}

/** "01 — CONSULTATION" timeline: numbered steps on a thin line, the current one marked with a black dot. Steps with `onPress` are tappable. */
export function Timeline({ steps, active = 0, onInk }: { steps: { title: string; body: string; onPress?: () => void }[]; active?: number; onInk?: boolean }) {
  const on = onInk ? colors.onInk : colors.text;
  const off = onInk ? colors.inkLine : colors.surfaceStrong;
  const sub = onInk ? colors.inkMuted : colors.muted;
  return (
    <View>
      {steps.map((s, i) => {
        const body = (
          <>
            <View style={{ alignItems: "center", width: 12 }}>
              <View style={{ width: i === active ? 11 : 9, height: i === active ? 11 : 9, borderRadius: 6, marginTop: 2, backgroundColor: i === active ? on : off }} />
              {i < steps.length - 1 && <View style={{ flex: 1, width: 1, backgroundColor: i < active ? on : off, marginVertical: 4 }} />}
            </View>
            <View style={{ flex: 1, paddingBottom: i < steps.length - 1 ? 20 : 0 }}>
              <Row gap={6}>
                <T variant="eyebrow" color={i === active ? on : sub} style={{ fontFamily: fonts.bold }}>{`${String(i + 1).padStart(2, "0")} — ${s.title}`}</T>
                {s.onPress && <Ionicons name="arrow-forward" size={12} color={i === active ? on : sub} />}
              </Row>
              <T variant="caption" color={sub} style={{ marginTop: 4 }}>{s.body}</T>
            </View>
          </>
        );
        return s.onPress ? (
          <Pressable key={s.title} onPress={s.onPress} accessibilityRole="button" style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [{ flexDirection: "row", gap: 14 }, pressed && styles.pressed, focused && styles.focusRing]}>
            {body}
          </Pressable>
        ) : (
          <View key={s.title} style={{ flexDirection: "row", gap: 14 }}>{body}</View>
        );
      })}
    </View>
  );
}

export const styles = StyleSheet.create({
  inner: { width: "100%", maxWidth: 760, alignSelf: "center" },
  padded: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border, ...shadow },
  cardActive: { borderColor: colors.accentLine, ...emphasis },
  surfaceCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16 },
  inkCard: { backgroundColor: colors.ink, borderRadius: radius.lg, padding: 16 },
  pressed: { opacity: 0.7 },
  // Keyboard focus on the website (a no-op on phones).
  focusRing: Platform.select({ web: { outlineStyle: "solid", outlineWidth: 2, outlineColor: colors.accent, outlineOffset: 2 } as object, default: {} }),
  textLink: { flexDirection: "row", alignItems: "center", gap: 4, minHeight: 32 },
  button: { borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  iconButton: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", paddingHorizontal: 4, borderWidth: 2, borderColor: colors.bg },
  pill: { borderRadius: radius.pill, paddingVertical: 9, paddingHorizontal: 14, minHeight: 40, justifyContent: "center", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  pillSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  option: { flexDirection: "row", alignItems: "center", gap: 14, minHeight: 56, paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  optionSelected: { borderColor: colors.accentLine, ...emphasis },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.faint, alignItems: "center", justifyContent: "center" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  connectorDot: { position: "absolute", width: 9, height: 9, borderRadius: 5 },
  segmented: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: radius.pill, padding: 4 },
  segment: { flex: 1, alignItems: "center", paddingVertical: 9, paddingHorizontal: 6, borderRadius: radius.pill },
  segmentActive: { backgroundColor: colors.accent },
  input: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, fontFamily: fonts.regular, color: colors.text },
  search: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: 18, height: 52, borderWidth: 1, borderColor: colors.border },
  tag: { borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4, alignSelf: "flex-start" },
  listRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, paddingHorizontal: 4, borderRadius: radius.md },
  listIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.card, paddingTop: 12, paddingHorizontal: 20 },
  footerInner: { width: "100%", maxWidth: 720, alignSelf: "center" },
});
