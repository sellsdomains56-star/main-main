import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { colors, fonts, radius } from "../../components/theme";
import { Avatar, Button, Card, EmptyState, ErrorBox, IconLine, ListRow, Loading, Rating, Row, Screen, Section, T, Tag } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { money, time } from "../../lib/format";
import type { Booking, BusinessDashboard, Earnings } from "../../lib/types";

type Period = "today" | "week" | "month";
const PERIOD_LABEL: Record<Period, string> = { today: "Today", week: "This week", month: "This month" };
const WHERE: Record<string, string> = { shop: "At the shop", home: "Home visit", video: "Video call", phone: "Phone call" };

/** The barber's business at a glance: today's chairs, earnings after the fee, and what to fix on the profile. */
export default function Business() {
  const { user } = useAuth();
  const [data, setData] = useState<BusinessDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("today");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    if (user?.role !== "barber") return;
    api.business().then(setData, (e: Error) => setError(e.message));
  }, [user]);
  useFocusEffect(load);

  if (user?.role !== "barber") {
    return <Screen><EmptyState icon="cut-outline" title="For barbers" body="Join as a barber to get booked and run your business here." action={{ label: "Join as a barber", onPress: () => router.replace("/become-barber") }} /></Screen>;
  }
  if (!data) return <Screen>{error ? <ErrorBox message={error} onRetry={load} /> : <Loading />}</Screen>;

  const setStatus = async (b: Booking, status: "on_the_way" | "completed") => {
    setBusy(b.id + status);
    setError(null);
    try {
      await api.setBookingStatus(b.id, status);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const e = data.earnings[period];
  const tz = data.barber.timeZone;
  const done = data.checklist.filter((c) => c.done).length;
  const todo = data.checklist.filter((c) => !c.done);
  const fix: Record<string, () => void> = {
    services: () => router.push("/business/services"),
    reel: () => router.push("/post-reel"),
  };
  const cur = data.currency;

  return (
    <Screen>
      <Row style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <T variant="eyebrow" muted>Your business</T>
          <T variant="title" style={{ marginTop: 6 }}>{greeting()}, {data.barber.name.split(" ")[0]}</T>
        </View>
        <Avatar uri={data.barber.photoUrl} name={data.barber.name} size={48} />
      </Row>
      <Row gap={6} style={{ marginTop: 10, flexWrap: "wrap" }}>
        <Tag label={data.status === "live" ? "Live" : data.status === "pending" ? "In review" : "Paused"} tone={data.status === "live" ? "accent" : data.status === "pending" ? "neutral" : "danger"} icon={data.status === "live" ? "radio-button-on" : data.status === "pending" ? "time-outline" : "pause"} />
        {data.verified && <Tag label="Verified" icon="shield-checkmark" />}
        <Tag label={data.barber.city} icon="location-outline" />
      </Row>

      {data.status === "pending" && (
        <Card tone="surface" style={{ marginTop: 16 }}>
          <IconLine icon="time-outline">Our team is reviewing your profile — usually within a day. Customers can't book you until you're live, so finish the checklist below in the meantime.</IconLine>
        </Card>
      )}
      {data.status === "suspended" && (
        <Card tone="surface" style={{ marginTop: 16, backgroundColor: colors.dangerSoft }}>
          <T variant="strong" color={colors.danger}>Your profile is paused</T>
          <T variant="caption" color={colors.danger} style={{ marginTop: 4 }}>Customers can't see or book you right now. Message support and we'll sort it out together.</T>
          <Button title="Contact support" size="sm" variant="secondary" onPress={() => router.push("/help")} style={{ alignSelf: "flex-start", marginTop: 10 }} />
        </Card>
      )}
      {error && <View style={{ marginTop: 12 }}><ErrorBox message={error} /></View>}

      {/* Earnings */}
      <Card tone="ink" style={{ marginTop: 20, padding: 20 }}>
        <Row style={{ justifyContent: "space-between" }}>
          <T variant="eyebrow" color={colors.inkMuted}>You earn · {PERIOD_LABEL[period]}</T>
          <T variant="small" color={colors.inkMuted}>{e.count} {e.count === 1 ? "booking" : "bookings"}</T>
        </Row>
        <T variant="display" color={colors.onInk} style={{ marginTop: 10, fontSize: 40, lineHeight: 44 }}>{money(e.net, cur)}</T>
        <EarningsLines e={e} cur={cur} fee={data.feePercent} />
        <View style={{ marginTop: 16, backgroundColor: colors.inkRaised, borderRadius: radius.pill, padding: 4, flexDirection: "row" }}>
          {(["today", "week", "month"] as Period[]).map((p) => (
            <Pressable key={p} onPress={() => setPeriod(p)} accessibilityRole="button" accessibilityState={{ selected: p === period }} style={{ flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: radius.pill, backgroundColor: p === period ? colors.onInk : "transparent" }}>
              <T variant="caption" color={p === period ? colors.ink : colors.inkMuted} style={{ fontFamily: fonts.semibold }}>{PERIOD_LABEL[p]}</T>
            </Pressable>
          ))}
        </View>
      </Card>
      <T variant="small" muted style={{ marginTop: 8 }}>After the {data.feePercent}% JB fee. Tips are 100% yours. Payouts go to your bank every week once payouts are switched on.</T>

      {/* The week ahead */}
      <Section title="Next 7 days">
        <Row gap={6}>
          {data.week.map((d, i) => (
            <View key={d.date} style={{ flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: radius.md, backgroundColor: i === 0 ? colors.ink : d.working ? colors.card : colors.surface, borderWidth: i === 0 || !d.working ? 0 : 1, borderColor: colors.border }}>
              <T variant="small" color={i === 0 ? colors.inkMuted : colors.muted}>{weekday(d.date)}</T>
              <T variant="heading" color={i === 0 ? colors.onInk : d.working ? colors.text : colors.faint} style={{ marginTop: 2 }}>{d.working ? d.count : "–"}</T>
            </View>
          ))}
        </Row>
        <T variant="small" muted style={{ marginTop: 8 }}>{data.upcomingCount} upcoming {data.upcomingCount === 1 ? "booking" : "bookings"} · "–" is a day off</T>
      </Section>

      {/* Today */}
      <Section title="Today" action={{ label: "All appointments", onPress: () => router.push("/bookings") }}>
        {data.today.length === 0 ? (
          <Card tone="surface">
            <T variant="strong">Nothing booked today</T>
            <T variant="caption" muted style={{ marginTop: 4 }}>
              {data.next ? `Next: ${data.next.customerName} · ${data.next.service?.name ?? "Appointment"} · ${new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date(data.next.startsAt))}` : "Post a reel or share your profile to fill your chair."}
            </T>
          </Card>
        ) : (
          data.today.map((b) => {
            const past = b.status === "completed";
            return (
              <Card key={b.id} style={{ marginBottom: 10, opacity: past ? 0.6 : 1 }} highlighted={b.id === data.next?.id}>
                <Row gap={14} style={{ alignItems: "flex-start" }}>
                  <View style={{ width: 76 }}>
                    <T variant="heading">{time(b.startsAt, tz)}</T>
                    <T variant="small" muted>{b.service?.durationMin ?? 30} min</T>
                  </View>
                  <View style={{ flex: 1 }}>
                    <T variant="strong">{b.guest?.name ?? b.customerName}</T>
                    <T variant="caption" muted>{b.service?.name ?? "Appointment"} · {money(b.amount, b.currency)}{b.tip ? ` + ${money(b.tip, b.currency)} tip` : ""}</T>
                    <T variant="caption" muted numberOfLines={1}>{WHERE[b.locationType] ?? b.locationType}{b.locationType === "home" ? ` · ${b.address}` : ""}</T>
                    {!!b.notes && <T variant="caption" style={{ marginTop: 4 }}>“{b.notes}”</T>}
                  </View>
                  {past ? <Tag label="Done" icon="checkmark" /> : b.status === "on_the_way" ? <Tag label="On the way" tone="accent" /> : null}
                </Row>
                {!past && (
                  <Row gap={8} style={{ marginTop: 12 }}>
                    {b.locationType === "home" && b.status === "confirmed" && <Button title="On my way" icon="car-outline" size="sm" loading={busy === b.id + "on_the_way"} onPress={() => setStatus(b, "on_the_way")} />}
                    <Button title="Mark done" icon="checkmark" size="sm" variant="secondary" loading={busy === b.id + "completed"} onPress={() => setStatus(b, "completed")} />
                  </Row>
                )}
              </Card>
            );
          })
        )}
      </Section>

      {/* Profile strength */}
      {todo.length > 0 && (
        <Section title="Get booked more" eyebrow={`Profile ${done} of ${data.checklist.length} done`}>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.surface, overflow: "hidden", marginBottom: 12 }}>
            <View style={{ width: `${(done / data.checklist.length) * 100}%`, height: 6, backgroundColor: colors.ink }} />
          </View>
          {data.checklist.map((c) => (
            <Pressable key={c.key} disabled={c.done} onPress={fix[c.key] ?? (() => router.push("/portfolio"))} accessibilityRole="button" style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }, pressed && { opacity: 0.7 }]}>
              <Ionicons name={c.done ? "checkmark-circle" : "ellipse-outline"} size={22} color={c.done ? colors.text : colors.faint} />
              <T style={{ flex: 1, textDecorationLine: c.done ? "line-through" : "none" }} muted={c.done}>{c.label}</T>
              {!c.done && <Ionicons name="chevron-forward" size={16} color={colors.faint} />}
            </Pressable>
          ))}
        </Section>
      )}

      {/* Run the business */}
      <Section title="Manage">
        <ListRow icon="pricetags-outline" title="Services & prices" subtitle={`${data.barber.services.length} services · from ${money(data.barber.startingPrice, cur)}${data.barber.offersHomeVisits ? " · home visits on" : ""}`} onPress={() => router.push("/business/services")} />
        <ListRow icon="time-outline" title="Hours & days off" subtitle={hoursLine(data)} onPress={() => router.push("/business/hours")} />
        <ListRow icon="images-outline" title="My work" subtitle="Photo, bio, portfolio, before & afters, map pin" onPress={() => router.push("/portfolio")} />
        <ListRow icon="videocam-outline" title="Post a reel" subtitle="Show off your latest cut" onPress={() => router.push("/post-reel")} />
        <ListRow icon="person-circle-outline" title="See my public profile" onPress={() => router.push({ pathname: "/barber/[id]", params: { id: data.barber.id } })} />
      </Section>

      {/* This month and reviews */}
      <Section title="This month">
        <Row gap={10}>
          <Stat label="Completed" value={String(data.completedThisMonth)} />
          <Stat label="Cancelled" value={String(data.cancelledThisMonth)} />
          <Stat label="Rating" value={data.barber.rating ? data.barber.rating.toFixed(1) : "New"} sub={data.barber.ratingCount ? `${data.barber.ratingCount} reviews` : undefined} />
        </Row>
        {data.reviews.map((r) => (
          <Card key={r.id} tone="surface" style={{ marginTop: 10 }}>
            <Row style={{ justifyContent: "space-between" }}>
              <T variant="strong">{r.customerName}</T>
              <Rating value={r.rating} />
            </Row>
            {!!r.comment && <T variant="caption" style={{ marginTop: 4 }}>{r.comment}</T>}
          </Card>
        ))}
      </Section>
    </Screen>
  );
}

function EarningsLines({ e, cur, fee }: { e: Earnings; cur: string; fee: number }) {
  const line = (label: string, value: string) => (
    <Row style={{ justifyContent: "space-between", marginTop: 6 }}>
      <T variant="caption" color={colors.inkMuted}>{label}</T>
      <T variant="caption" color={colors.onInk} style={{ fontFamily: fonts.semibold }}>{value}</T>
    </Row>
  );
  return (
    <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: colors.inkLine, paddingTop: 6 }}>
      {line("Bookings", money(e.gross, cur))}
      {line(`JB fee (${fee}%)`, `− ${money(e.fee, cur)}`)}
      {line("Tips", `+ ${money(e.tips, cur)}`)}
    </View>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card style={{ flex: 1, padding: 14 }}>
      <T variant="small" muted>{label}</T>
      <T variant="title" style={{ marginTop: 4 }}>{value}</T>
      {sub && <T variant="small" muted>{sub}</T>}
    </Card>
  );
}

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const weekday = (date: string) => DAY[new Date(`${date}T12:00:00Z`).getUTCDay()]!;
const hour = (h: number) => `${String(h).padStart(2, "0")}:00`;

function hoursLine(d: BusinessDashboard) {
  const days = [1, 2, 3, 4, 5, 6, 0].filter((x) => d.hours.workingDays.includes(x)).map((x) => DAY[x]);
  const off = d.hours.timeOff.length ? ` · ${d.hours.timeOff.length} day${d.hours.timeOff.length === 1 ? "" : "s"} off booked` : "";
  return `${days.length === 7 ? "Every day" : days.join(", ")} · ${hour(d.hours.openHour)}–${hour(d.hours.closeHour)}${off}`;
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
