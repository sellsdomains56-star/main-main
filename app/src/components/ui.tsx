import { Ionicons } from "@expo/vector-icons";
import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
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
import { colors, fonts, radius, shadow } from "./theme";

export type IconName = keyof typeof Ionicons.glyphMap;

// ---------- Typography ----------

const variants = {
  display: { fontFamily: fonts.black, fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  title: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 },
  strong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  small: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
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
    <Text
      numberOfLines={numberOfLines}
      style={[variants[variant], { color: color ?? (muted ? colors.muted : colors.text) }, center && { textAlign: "center" }, style]}
    >
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

export function Section({ title, action, children, style }: { title?: string; action?: { label: string; onPress: () => void }; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ marginTop: 24 }, style]}>
      {(title || action) && (
        <View style={[styles.rowBetween, { marginBottom: 12 }]}>
          {title ? <T variant="heading">{title}</T> : <View />}
          {action && (
            <Pressable onPress={action.onPress} hitSlop={8}>
              <T variant="caption" color={colors.brand}>{action.label}</T>
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

export function Card({
  children,
  style,
  onPress,
  tone = "card",
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  tone?: "card" | "surface";
}) {
  const base = [tone === "card" ? styles.card : styles.surfaceCard, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [base, pressed && styles.pressed]}>
      {children}
    </Pressable>
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
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "lg" | "md" | "sm";
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const bg = { primary: colors.brand, secondary: colors.surface, ghost: "transparent", danger: colors.dangerSoft }[variant];
  const fg = { primary: colors.onBrand, secondary: colors.text, ghost: colors.brand, danger: colors.danger }[variant];
  const height = { lg: 54, md: 44, sm: 36 }[size];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, height, paddingHorizontal: size === "sm" ? 14 : 20, opacity: disabled ? 0.4 : 1 },
        pressed && styles.pressed,
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
      style={({ pressed }) => [styles.iconButton, tone === "surface" && { backgroundColor: colors.surface }, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={20} color={colors.text} />
      {!!badge && (
        <View style={styles.badge}>
          <Text style={{ color: colors.onBrand, fontFamily: fonts.bold, fontSize: 10 }}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function Pill({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.pill, selected ? { backgroundColor: colors.text } : { backgroundColor: colors.surface }, pressed && styles.pressed]}
    >
      <Row gap={6}>
        {icon && <Ionicons name={icon} size={14} color={selected ? colors.bg : colors.text} />}
        <T variant="caption" color={selected ? colors.bg : colors.text} style={{ fontFamily: fonts.semibold }}>{label}</T>
      </Row>
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
            <T variant="caption" color={active ? colors.text : colors.muted} style={{ fontFamily: fonts.semibold }}>{o.label}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Field({ label, style, ...props }: TextInputProps & { label: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[{ marginBottom: 14 }, style as ViewStyle]}>
      <T variant="caption" muted style={{ marginBottom: 6 }}>{label}</T>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.faint}
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[styles.input, focused && { borderColor: colors.brand, backgroundColor: colors.bg }, props.multiline && { minHeight: 96, textAlignVertical: "top", paddingTop: 14 }]}
      />
    </View>
  );
}

export function SearchBar({ value, onChangeText, placeholder, onPress, autoFocus }: { value?: string; onChangeText?: (v: string) => void; placeholder: string; onPress?: () => void; autoFocus?: boolean }) {
  const content = (
    <View style={styles.search}>
      <Ionicons name="search" size={18} color={colors.muted} />
      {onPress ? (
        <T muted style={{ marginLeft: 10 }}>{placeholder}</T>
      ) : (
        <TextInput
          accessibilityLabel={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          autoFocus={autoFocus}
          autoCapitalize="none"
          style={{ flex: 1, marginLeft: 10, fontFamily: fonts.regular, fontSize: 15, color: colors.text, paddingVertical: 0, ...({ outlineStyle: "none" } as object) }}
        />
      )}
    </View>
  );
  return onPress ? <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>{content}</Pressable> : content;
}

// ---------- Data display ----------

export function Rating({ value, count, size = "caption" }: { value: number | null; count?: number; size?: "caption" | "strong" }) {
  return (
    <Row gap={4}>
      <Ionicons name="star" size={size === "strong" ? 16 : 13} color={colors.star} />
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
          <Ionicons name={value >= n ? "star" : "star-outline"} size={38} color={colors.star} />
        </Pressable>
      ))}
    </Row>
  );
}

export function Tag({ label, tone = "neutral", icon }: { label: string; tone?: "neutral" | "brand" | "warn" | "danger"; icon?: IconName }) {
  const bg = { neutral: colors.surface, brand: colors.brandSoft, warn: colors.warnSoft, danger: colors.dangerSoft }[tone];
  const fg = { neutral: colors.muted, brand: colors.brandDark, warn: colors.warn, danger: colors.danger }[tone];
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

/** Photo with a graceful initials fallback (no grey boxes when an image fails to load). */
export function Photo({ uri, name, style, rounded = radius.md }: { uri?: string | null; name: string; style: StyleProp<ViewStyle>; rounded?: number }) {
  const [failed, setFailed] = useState(false);
  const flat = StyleSheet.flatten(style) as ViewStyle;
  const size = typeof flat?.width === "number" ? flat.width : 64;
  if (!uri || failed) {
    return (
      <View style={[{ backgroundColor: colors.brandSoft, alignItems: "center", justifyContent: "center", borderRadius: rounded, overflow: "hidden" }, style]}>
        <Text style={{ color: colors.brandDark, fontFamily: fonts.bold, fontSize: Math.max(14, Math.min(size * 0.34, 40)) }}>{initials(name)}</Text>
      </View>
    );
  }
  return <Image source={{ uri }} onError={() => setFailed(true)} style={[{ borderRadius: rounded, backgroundColor: colors.surface }, style as object]} />;
}

export function Avatar({ uri, name, size = 48 }: { uri?: string | null; name: string; size?: number }) {
  return <Photo uri={uri} name={name} style={{ width: size, height: size }} rounded={size / 2} />;
}

export function ListRow({ icon, title, subtitle, onPress, right, danger }: { icon: IconName; title: string; subtitle?: string; onPress?: () => void; right?: ReactNode; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.listRow, pressed && { backgroundColor: colors.surface }]}>
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

export function Loading() {
  return (
    <View style={{ padding: 40, alignItems: "center" }}>
      <ActivityIndicator color={colors.brand} />
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
      <View style={[styles.listIcon, { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.brandSoft, marginBottom: 16 }]}>
        <Ionicons name={icon} size={28} color={colors.brand} />
      </View>
      <T variant="heading" center>{title}</T>
      {body && <T muted center style={{ marginTop: 6 }}>{body}</T>}
      {action && <Button title={action.label} onPress={action.onPress} size="md" style={{ marginTop: 18, alignSelf: "center" }} />}
    </View>
  );
}

export const styles = StyleSheet.create({
  inner: { width: "100%", maxWidth: 760, alignSelf: "center" },
  padded: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, ...shadow },
  surfaceCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  button: { borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center", paddingHorizontal: 4, borderWidth: 2, borderColor: colors.bg },
  pill: { borderRadius: radius.pill, paddingVertical: 9, paddingHorizontal: 14 },
  segmented: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: radius.pill, padding: 4 },
  segment: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: radius.pill },
  segmentActive: { backgroundColor: colors.bg, ...shadow },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: "transparent", paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, fontFamily: fonts.regular, color: colors.text },
  search: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 16, height: 48 },
  tag: { borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4, alignSelf: "flex-start" },
  listRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, paddingHorizontal: 4, borderRadius: radius.md },
  listIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.bg, paddingTop: 12, paddingHorizontal: 20 },
  footerInner: { width: "100%", maxWidth: 720, alignSelf: "center" },
});

export function SummaryLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Row style={{ justifyContent: "space-between", marginVertical: 3 }}>
      <T variant={strong ? "heading" : "body"} muted={!strong}>{label}</T>
      <T variant={strong ? "heading" : "strong"}>{value}</T>
    </Row>
  );
}
