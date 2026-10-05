import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { DayPicker } from "../../../components/DayPicker";
import { ShopPhoto } from "../../../components/ShopCard";
import { SlideToConfirm } from "../../../components/SlideToConfirm";
import { colors, radius } from "../../../components/theme";
import { Button, ErrorBox, Field, IconLine, Loading, Pill, Row, Screen, StepCard, StepConnector, T, Wrap } from "../../../components/ui";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/auth";
import { money, time, upcomingDays } from "../../../lib/format";
import type { Shop } from "../../../lib/types";

const OCCASIONS = ["Groom’s party", "Birthday", "Team day", "Photo or video shoot", "Something else"];

/** Hire the whole barbershop: occasion and guests, how long, when. Paid up front with Apple Pay / Google Pay. */
export default function HireShop() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [guests, setGuests] = useState(4);
  const [hours, setHours] = useState(2);
  const [date, setDate] = useState<string | null>(null);
  const [userPickedDate, setUserPickedDate] = useState(false);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.shop(shopId).then((s) => {
      setShop(s);
      if (s.privateHire) {
        setHours(s.privateHire.minHours);
        setGuests((g) => Math.min(g, s.privateHire!.maxGuests));
      }
    }, (e: Error) => setError(e.message));
  }, [shopId]);

  // Private hire needs a day's notice, so the list starts tomorrow.
  const days = useMemo(() => (shop ? upcomingDays(31, shop.timeZone).slice(1) : []), [shop]);
  useEffect(() => {
    if (!date && days.length) setDate(days[0].date);
  }, [days, date]);

  useEffect(() => {
    if (!shop || !date) return;
    setSlots(null);
    setSlot(null);
    api.hireAvailability(shop.id, date, hours).then((r) => {
      const i = days.findIndex((d) => d.date === date);
      if (!r.slots.length && !userPickedDate && i >= 0 && i < days.length - 1) setDate(days[i + 1].date);
      else setSlots(r.slots);
    }, (e: Error) => setError(e.message));
  }, [shop, date, hours, days, userPickedDate]);

  const confirm = useCallback(async () => {
    if (!shop || !slot || !occasion) return;
    setSubmitting(true);
    setError(null);
    try {
      const { hire } = await api.createHire({ shopId: shop.id, startsAt: slot, hours, guests, occasion, notes });
      router.replace({ pathname: "/hire/[hireId]", params: { hireId: hire.id } });
    } catch (e) {
      setError((e as Error).message);
      if (date) api.hireAvailability(shop.id, date, hours).then((r) => setSlots(r.slots), () => {});
    } finally {
      setSubmitting(false);
    }
  }, [shop, slot, occasion, hours, guests, notes, date]);

  if (!shop) return <Screen>{error ? <ErrorBox message={error} /> : <Loading />}</Screen>;
  const terms = shop.privateHire;
  if (!terms) return <Screen><ErrorBox message={`${shop.name} doesn't do private hire.`} /></Screen>;
  const total = terms.pricePerHour * hours;
  const end = slot ? new Date(Date.parse(slot) + hours * 3_600_000).toISOString() : null;

  return (
    <Screen
      footer={
        <Row gap={14}>
          <View>
            <T variant="eyebrow" color={colors.muted}>Total</T>
            <T variant="title">{money(total, shop.currency)}</T>
          </View>
          <View style={{ flex: 1 }}>
            {user ? (
              <SlideToConfirm label="Slide to hire" disabledLabel={!occasion ? "Pick the occasion" : "Pick a time"} disabled={!slot || !occasion} loading={submitting} onConfirm={confirm} />
            ) : (
              <Button title="Sign in to book" onPress={() => router.push("/login")} />
            )}
          </View>
        </Row>
      }
    >
      <Stack.Screen options={{ title: "Private hire" }} />
      <Row gap={12}>
        <ShopPhoto shop={shop} width={52} height={52} rounded={radius.md} />
        <View style={{ flex: 1 }}>
          <T variant="heading">{shop.name}</T>
          <T variant="caption" muted>The whole shop and its team, just for you</T>
        </View>
      </Row>

      <View style={{ marginTop: 22 }}>
        <StepCard step={1} title="What's the occasion?" state={occasion ? "done" : "active"}>
          <Wrap gap={8}>
            {OCCASIONS.map((o) => <Pill key={o} label={o} selected={o === occasion} onPress={() => setOccasion(o)} />)}
          </Wrap>
          <Row style={{ justifyContent: "space-between", marginTop: 16 }}>
            <View>
              <T variant="strong">Guests</T>
              <T variant="caption" muted>Up to {terms.maxGuests}</T>
            </View>
            <Stepper value={guests} min={1} max={terms.maxGuests} onChange={setGuests} label="guests" />
          </Row>
        </StepCard>

        <StepConnector lit={!!occasion} side="right" />

        <StepCard step={2} title="How long?" state="done">
          <Wrap gap={8}>
            {Array.from({ length: terms.maxHours - terms.minHours + 1 }, (_, i) => terms.minHours + i).map((h) => (
              <Pill key={h} label={`${h} hours`} selected={h === hours} onPress={() => setHours(h)} />
            ))}
          </Wrap>
          <T variant="caption" muted style={{ marginTop: 10 }}>{money(terms.pricePerHour, shop.currency)} an hour · the team cuts your whole group</T>
        </StepCard>

        <StepConnector lit side="left" />

        <StepCard step={3} title="When?" state={slot ? "done" : "active"}>
          <T variant="caption" muted style={{ marginBottom: 10 }}>{shop.city} time · book at least a day ahead</T>
          <DayPicker
            days={days}
            value={date}
            onChange={(d) => {
              setUserPickedDate(true);
              setDate(d);
            }}
          />
          <View style={{ marginTop: 14 }}>
            {!slots && <Loading />}
            {slots?.length === 0 && <T muted>The shop isn't free for {hours} hours this day — try another day or fewer hours.</T>}
            <Wrap gap={8}>
              {slots?.map((s) => <Pill key={s} label={time(s, shop.timeZone)} selected={s === slot} onPress={() => setSlot(s)} />)}
            </Wrap>
            {slot && end && <View style={{ marginTop: 12 }}><IconLine icon="time-outline">{time(slot, shop.timeZone)}–{time(end, shop.timeZone)}, the shop is yours</IconLine></View>}
          </View>
        </StepCard>

        <StepConnector lit={!!slot} side="right" />

        <StepCard step={4} title="Anything we should know?" state={slot ? "active" : "upcoming"}>
          <Field label="Notes for the shop (optional)" placeholder="e.g. Groom plus 5 groomsmen, hot towel shaves for everyone, we'll bring music" value={notes} onChangeText={setNotes} multiline style={{ marginBottom: 0 }} />
        </StepCard>
      </View>
      {error && <View style={{ marginTop: 16 }}><ErrorBox message={error} /></View>}
    </Screen>
  );
}

function Stepper({ value, min, max, onChange, label }: { value: number; min: number; max: number; onChange: (v: number) => void; label: string }) {
  const btn = (icon: "remove" | "add", next: number, a11y: string, disabled: boolean) => (
    <Pressable accessibilityRole="button" accessibilityLabel={a11y} disabled={disabled} onPress={() => onChange(next)} hitSlop={6} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.3 : 1 }}>
      <Ionicons name={icon} size={18} color={colors.text} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 2 }}>
      {btn("remove", value - 1, `Fewer ${label}`, value <= min)}
      <T variant="strong" center style={{ minWidth: 28 }}>{value}</T>
      {btn("add", value + 1, `More ${label}`, value >= max)}
    </View>
  );
}
