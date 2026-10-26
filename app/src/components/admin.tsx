import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useEffect, useState, type ReactNode } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { money } from "../lib/format";
import type { AdminBookingRow, AdminOverview, Money } from "../lib/types";
import { colors, fonts, radius, shadow } from "./theme";
import { Card, EmptyState, type IconName, Row, SearchBar, Segmented, T, Tag } from "./ui";

/** Wide enough for the sidebar and real tables (a laptop); phones get stacked cards. */
export const useWide = () => useWindowDimensions().width >= 960;

export interface NavItem { href: string; label: string; icon: IconName }

const ADMIN_NAV: (NavItem & { badge?: (o: AdminOverview) => number })[] = [
  { href: "/admin", label: "Overview", icon: "grid-outline" },
  { href: "/admin/barbers", label: "Barbers", icon: "cut-outline", badge: (o) => o.barbers.pending },
  { href: "/admin/bookings", label: "Bookings", icon: "calendar-outline" },
  { href: "/admin/customers", label: "Customers", icon: "people-outline" },
  { href: "/admin/shops", label: "Shops & orders", icon: "storefront-outline", badge: (o) => o.ordersToShip },
  { href: "/admin/reports", label: "Reported reels", icon: "flag-outline", badge: (o) => o.openReports },
  { href: "/admin/support", label: "Support", icon: "chatbubbles-outline", badge: (o) => o.openTickets },
  { href: "/admin/settings", label: "Settings", icon: "settings-outline" },
];

/** The admin panel frame, with counts of what's waiting on the team. */
export function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [counts, setCounts] = useState<AdminOverview | null>(null);
  useEffect(() => {
    api.admin.overview().then(setCounts, () => {});
  }, [path]);
  const badges = Object.fromEntries(ADMIN_NAV.map((n) => [n.href, counts && n.badge ? n.badge(counts) : 0]));
  return <PanelShell title="JB Always Fresh" subtitle="Team · Admin panel" nav={ADMIN_NAV} badges={badges}>{children}</PanelShell>;
}

/** A panel frame (admin, shop): a sidebar on a laptop, a scrolling tab strip on a phone. The first nav item is the home page. */
export function PanelShell({ title, subtitle, nav, badges = {}, children }: { title: string; subtitle: string; nav: NavItem[]; badges?: Record<string, number>; children: ReactNode }) {
  const wide = useWide();
  const insets = useSafeAreaInsets();
  const path = usePathname();
  const { user } = useAuth();
  const home = nav[0]!.href;
  const active = (href: string) => (href === home ? path === home : path.startsWith(href));

  const brand = (
    <Pressable onPress={() => router.navigate("/")} accessibilityRole="link" accessibilityLabel="Back to the app" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.onInk, alignItems: "center", justifyContent: "center" }}>
        <T variant="caption" color={colors.ink} style={{ fontFamily: fonts.black }}>JB</T>
      </View>
      <View style={{ flexShrink: 1 }}>
        <T variant="strong" color={colors.onInk} numberOfLines={1}>{title}</T>
        <T variant="small" color={colors.inkMuted} numberOfLines={1}>{subtitle}</T>
      </View>
    </Pressable>
  );

  if (wide) {
    return (
      <View style={{ flex: 1, flexDirection: "row", backgroundColor: colors.bg }}>
        <View style={{ width: 248, backgroundColor: colors.ink, paddingTop: insets.top + 22, paddingHorizontal: 14, paddingBottom: 18 }}>
          <View style={{ paddingHorizontal: 8, marginBottom: 26 }}>{brand}</View>
          {nav.map((n) => {
            const on = active(n.href);
            const badge = badges[n.href] ?? 0;
            return (
              <Pressable key={n.href} onPress={() => router.navigate(n.href as never)} accessibilityRole="link" accessibilityState={{ selected: on }} style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [s.navItem, on && { backgroundColor: colors.onInk }, !on && (hovered || pressed) && { backgroundColor: colors.inkRaised }]}>
                <Ionicons name={n.icon} size={18} color={on ? colors.ink : colors.inkMuted} />
                <T variant="caption" color={on ? colors.ink : colors.onInk} style={{ flex: 1, fontFamily: fonts.semibold }}>{n.label}</T>
                {badge > 0 && <View style={[s.badge, on && { backgroundColor: colors.ink }]}><T variant="small" color={on ? colors.onInk : colors.ink} style={{ fontFamily: fonts.bold }}>{badge}</T></View>}
              </Pressable>
            );
          })}
          <View style={{ flex: 1 }} />
          <View style={{ borderTopWidth: 1, borderTopColor: colors.inkLine, paddingTop: 14, paddingHorizontal: 8 }}>
            <T variant="small" color={colors.inkMuted}>Signed in as</T>
            <T variant="caption" color={colors.onInk} numberOfLines={1}>{user?.email}</T>
            <Pressable onPress={() => router.navigate("/")} style={{ marginTop: 10, flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="arrow-back" size={14} color={colors.inkMuted} />
              <T variant="small" color={colors.inkMuted}>Back to the app</T>
            </Pressable>
          </View>
        </View>
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ backgroundColor: colors.ink, paddingTop: insets.top + 12, paddingBottom: 12 }}>
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>{brand}</View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 6 }}>
          {nav.map((n) => {
            const on = active(n.href);
            const badge = badges[n.href] ?? 0;
            return (
              <Pressable key={n.href} onPress={() => router.navigate(n.href as never)} accessibilityRole="link" accessibilityState={{ selected: on }} style={[s.navPill, on && { backgroundColor: colors.onInk }]}>
                <T variant="caption" color={on ? colors.ink : colors.onInk} style={{ fontFamily: fonts.semibold }}>{n.label}{badge > 0 ? ` · ${badge}` : ""}</T>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

/** A page inside the panel: title, optional actions on the right, wide content. */
export function AdminPage({ title, subtitle, back, actions, children }: { title: string; subtitle?: string; back?: { label: string; href: string }; actions?: ReactNode; children: ReactNode }) {
  const wide = useWide();
  return (
    <ScrollView contentContainerStyle={{ padding: wide ? 32 : 16, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
      <View style={{ width: "100%", maxWidth: 1180, alignSelf: "center" }}>
        {back && (
          <Pressable onPress={() => router.navigate(back.href as never)} accessibilityRole="link" style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10, alignSelf: "flex-start" }}>
            <Ionicons name="arrow-back" size={14} color={colors.muted} />
            <T variant="caption" muted>{back.label}</T>
          </Pressable>
        )}
        <Row style={{ justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <View style={{ flexShrink: 1 }}>
            <T variant="title" style={{ fontSize: wide ? 28 : 24, lineHeight: wide ? 33 : 29 }}>{title}</T>
            {subtitle && <T muted style={{ marginTop: 4 }}>{subtitle}</T>}
          </View>
          {actions}
        </Row>
        {children}
      </View>
    </ScrollView>
  );
}

/** Search and a status filter, in one row above a table. */
export function Toolbar<V extends string>({ q, onQ, placeholder, filter }: { q?: string; onQ?: (v: string) => void; placeholder?: string; filter?: { options: { value: V; label: string }[]; value: V; onChange: (v: V) => void } }) {
  const wide = useWide();
  return (
    <View style={{ flexDirection: wide ? "row" : "column", gap: 10, marginBottom: 16, alignItems: wide ? "center" : "stretch" }}>
      {filter && <View style={{ flex: wide ? 1.2 : undefined }}><Segmented {...filter} /></View>}
      {onQ && <View style={{ flex: 1 }}><SearchBar value={q} onChangeText={onQ} placeholder={placeholder ?? "Search"} /></View>}
    </View>
  );
}

/** A number tile. Tappable when it leads somewhere. */
export function Kpi({ label, value, sub, icon, onPress, dark }: { label: string; value: string; sub?: string; icon?: IconName; onPress?: () => void; dark?: boolean }) {
  return (
    <Card tone={dark ? "ink" : "card"} onPress={onPress} style={{ flexGrow: 1, flexBasis: 200, minWidth: 150, padding: 18 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <T variant="eyebrow" color={dark ? colors.inkMuted : colors.muted}>{label}</T>
        {icon && <Ionicons name={icon} size={16} color={dark ? colors.inkMuted : colors.faint} />}
      </Row>
      <T variant="display" color={dark ? colors.onInk : colors.text} style={{ marginTop: 10, fontSize: 30, lineHeight: 34 }}>{value}</T>
      {sub && <T variant="small" color={dark ? colors.inkMuted : colors.muted} style={{ marginTop: 4 }}>{sub}</T>}
    </Card>
  );
}

/** "AED 12,400 · GBP 80" — each currency kept separate, never converted. */
export const sumText = (m: Money, empty = "—") => (m.length ? m.map((x) => money(x.amount, x.currency)).join(" · ") : empty);

/** Bookings per day: thin ink bars from a shared baseline; hover or tap a bar to read it. */
/** Bookings per day. Without `today`, the last day is today; with it (a week or month that runs on), today is picked out. */
export function Bars({ series, height = 120, today }: { series: { date: string; count: number }[]; height?: number; today?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...series.map((d) => d.count));
  const label = (date: string) => new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
  const current = today ? series.findIndex((d) => d.date === today) : series.length - 1;
  const shown = hover ?? (current >= 0 ? current : series.length - 1);
  const last = series[series.length - 1]!.date;
  return (
    <View>
      <Row style={{ justifyContent: "space-between", marginBottom: 10 }}>
        <T variant="caption" muted>{label(series[shown]!.date)}</T>
        <T variant="strong">{series[shown]!.count} {series[shown]!.count === 1 ? "booking" : "bookings"}</T>
      </Row>
      <View style={{ height, flexDirection: "row", alignItems: "flex-end", gap: 2, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        {series.map((d, i) => (
          <Pressable
            key={d.date}
            onHoverIn={() => setHover(i)}
            onHoverOut={() => setHover(null)}
            onPress={() => setHover(i)}
            accessibilityLabel={`${label(d.date)}: ${d.count} bookings`}
            style={{ flex: 1, height: "100%", justifyContent: "flex-end", alignItems: "center" }}
          >
            <View style={{ width: "70%", maxWidth: 28, height: Math.max(2, (d.count / max) * (height - 8)), borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: i === shown ? colors.ink : colors.surfaceStrong }} />
          </Pressable>
        ))}
      </View>
      <Row style={{ justifyContent: "space-between", marginTop: 6 }}>
        <T variant="small" muted>{label(series[0]!.date)}</T>
        <T variant="small" muted>{!today || last === today ? "Today" : label(last)}</T>
      </Row>
    </View>
  );
}

export interface Column<R> {
  label: string;
  flex?: number;
  align?: "left" | "right";
  render: (r: R) => ReactNode;
}

/**
 * A data table on a laptop (header + rows); on a phone each row becomes a card with the first
 * column as its title and the rest as small label/value pairs.
 */
export function Table<R>({ columns, rows, keyOf, onPress, empty }: { columns: Column<R>[]; rows: R[]; keyOf: (r: R) => string; onPress?: (r: R) => void; empty: { icon: IconName; title: string; body?: string } }) {
  const wide = useWide();
  if (!rows.length) return <Card><EmptyState {...empty} /></Card>;
  if (!wide) {
    return (
      <View style={{ gap: 10 }}>
        {rows.map((r) => (
          <Card key={keyOf(r)} onPress={onPress && (() => onPress(r))}>
            {columns[0]!.render(r)}
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10, rowGap: 8 }}>
              {columns.slice(1).map((c) => (
                <View key={c.label} style={{ width: "50%", paddingRight: 8 }}>
                  <T variant="small" muted>{c.label}</T>
                  <View style={{ marginTop: 2 }}>{c.render(r)}</View>
                </View>
              ))}
            </View>
          </Card>
        ))}
      </View>
    );
  }
  return (
    <View style={[s.table, shadow]}>
      <View style={[s.tr, { backgroundColor: colors.surface, borderTopWidth: 0, minHeight: 40 }]}>
        {columns.map((c) => <T key={c.label} variant="eyebrow" muted style={{ flex: c.flex ?? 1, textAlign: c.align ?? "left" }}>{c.label}</T>)}
      </View>
      {rows.map((r) => {
        const cells = columns.map((c) => <View key={c.label} style={{ flex: c.flex ?? 1, alignItems: c.align === "right" ? "flex-end" : "flex-start" }}>{c.render(r)}</View>);
        return onPress ? (
          <Pressable key={keyOf(r)} onPress={() => onPress(r)} style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [s.tr, (hovered || pressed) && { backgroundColor: colors.bg }]}>{cells}</Pressable>
        ) : (
          <View key={keyOf(r)} style={s.tr}>{cells}</View>
        );
      })}
    </View>
  );
}

/** Small status chip with the same words everywhere in the panel. */
export function StatusTag({ status }: { status: string }) {
  const map: Record<string, { label: string; tone: "neutral" | "accent" | "dark" | "danger"; icon?: IconName }> = {
    live: { label: "Live", tone: "accent" },
    pending: { label: "In review", tone: "neutral", icon: "time-outline" },
    suspended: { label: "Paused", tone: "danger", icon: "pause" },
    confirmed: { label: "Confirmed", tone: "accent" },
    on_the_way: { label: "On the way", tone: "accent", icon: "car-outline" },
    completed: { label: "Completed", tone: "neutral", icon: "checkmark" },
    cancelled: { label: "Cancelled", tone: "danger" },
    pending_payment: { label: "Awaiting payment", tone: "neutral" },
    paid: { label: "To ship", tone: "dark" },
    shipped: { label: "Shipped", tone: "neutral" },
    out_for_delivery: { label: "Out for delivery", tone: "neutral" },
    delivered: { label: "Delivered", tone: "neutral", icon: "checkmark" },
    open: { label: "Open", tone: "dark" },
    closed: { label: "Closed", tone: "neutral", icon: "checkmark" },
  };
  const m = map[status] ?? { label: status, tone: "neutral" as const };
  return <Tag label={m.label} tone={m.tone} icon={m.icon} />;
}

export const shortDate = (iso: string) => new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(new Date(iso));
export const shortDateTime = (iso: string) => new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
export const ago = (iso: string) => {
  const m = Math.round((Date.now() - Date.parse(iso)) / 60_000);
  return m < 60 ? `${Math.max(1, m)} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`;
};

/** Bookings as a table, with an optional action column (cancel & refund). */
export function BookingTable({ rows, action }: { rows: AdminBookingRow[]; action?: (r: AdminBookingRow) => ReactNode }) {
  return (
    <Table
      rows={rows}
      keyOf={(r) => r.id}
      empty={{ icon: "calendar-outline", title: "No bookings here" }}
      columns={[
        {
          label: "Customer",
          flex: 1.4,
          render: (r) => (
            <View>
              <T variant="strong" numberOfLines={1}>{r.customer?.name ?? "—"}</T>
              <T variant="small" muted numberOfLines={1}>{r.customer?.email}</T>
            </View>
          ),
        },
        { label: "Barber", flex: 1.2, render: (r) => <T variant="caption" numberOfLines={1}>{r.barber?.name ?? "—"} · {r.barber?.city}</T> },
        { label: "When", render: (r) => <T variant="caption">{shortDateTime(r.startsAt)}</T> },
        { label: "Service", flex: 1.1, render: (r) => <T variant="caption" numberOfLines={1}>{r.service}{r.locationType === "home" ? " · home" : ""}</T> },
        { label: "Paid", align: "right", render: (r) => <View style={{ alignItems: "flex-end" }}><T variant="caption">{r.coveredBy ? "Club" : money(r.amount, r.currency)}</T>{r.fee > 0 && <T variant="small" muted>fee {money(r.fee, r.currency)}</T>}</View> },
        { label: "Status", render: (r) => <StatusTag status={r.status} /> },
        ...(action ? [{ label: "", flex: 0.9, align: "right" as const, render: action }] : []),
      ]}
    />
  );
}

const s = StyleSheet.create({
  navItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, height: 42, borderRadius: radius.md, marginBottom: 2, ...(Platform.OS === "web" ? ({ cursor: "pointer" } as object) : {}) },
  navPill: { paddingHorizontal: 14, height: 36, borderRadius: radius.pill, justifyContent: "center", backgroundColor: colors.inkRaised },
  badge: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: colors.onInk, alignItems: "center", justifyContent: "center" },
  table: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  tr: { flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 18, paddingVertical: 12, minHeight: 60, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
