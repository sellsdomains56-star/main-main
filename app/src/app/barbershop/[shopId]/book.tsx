import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { DayPicker } from "../../../components/DayPicker";
import { SlideToConfirm } from "../../../components/SlideToConfirm";
import { ShopPhoto } from "../../../components/ShopCard";
import { colors, radius } from "../../../components/theme";
import { Button, ErrorBox, Field, IconLine, Loading, OptionRow, Pill, Row, Screen, StepCard, StepConnector, T, Wrap } from "../../../components/ui";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/auth";
import { money, time, upcomingDays } from "../../../lib/format";
import type { Shop } from "../../../lib/types";

/** Book a chair at a barbershop with whichever barber is free. */
export default function BookChair() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [service, setService] = useState<string | null>(null);
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
      setService((x) => x ?? s.menu[0]?.key ?? null);
    }, (e: Error) => setError(e.message));
  }, [shopId]);

  const days = useMemo(() => (shop ? upcomingDays(14, shop.timeZone) : []), [shop]);
  useEffect(() => {
    if (!date && days.length) setDate(days[0].date);
  }, [days, date]);

  useEffect(() => {
    if (!shop || !date || !service) return;
    setSlots(null);
    setSlot(null);
    api.shopAvailability(shop.id, date, service).then((r) => {
      const i = days.findIndex((d) => d.date === date);
      if (!r.slots.length && !userPickedDate && i >= 0 && i < days.length - 1) setDate(days[i + 1].date);
      else setSlots(r.slots);
    }, (e: Error) => setError(e.message));
  }, [shop, date, service, days, userPickedDate]);

  const item = shop?.menu.find((m) => m.key === service);

  const confirm = useCallback(async () => {
    if (!shop || !slot || !service) return;
    setSubmitting(true);
    setError(null);
    try {
      const { booking } = await api.bookShop(shop.id, { service, startsAt: slot, notes });
      router.replace({ pathname: "/pay/[bookingId]", params: { bookingId: booking.id } });
    } catch (e) {
      setError((e as Error).message);
      if (date) api.shopAvailability(shop.id, date, service).then((r) => setSlots(r.slots), () => {});
    } finally {
      setSubmitting(false);
    }
  }, [shop, slot, service, notes, date]);

  if (!shop) return <Screen>{error ? <ErrorBox message={error} /> : <Loading />}</Screen>;
  const several = shop.teamSize > 1;

  return (
    <Screen
      footer={
        <Row gap={14}>
          <View>
            <T variant="eyebrow" color={colors.muted}>{several ? "From" : "Total"}</T>
            <T variant="title">{item ? money(item.fromPrice, shop.currency) : "—"}</T>
          </View>
          <View style={{ flex: 1 }}>
            {user ? (
              <SlideToConfirm label="Slide to book" disabledLabel="Pick a time" disabled={!slot || !item} loading={submitting} onConfirm={confirm} />
            ) : (
              <Button title="Sign in to book" onPress={() => router.push("/login")} />
            )}
          </View>
        </Row>
      }
    >
      <Stack.Screen options={{ title: "Book a chair" }} />
      <Row gap={12}>
        <ShopPhoto shop={shop} width={52} height={52} rounded={radius.md} />
        <View style={{ flex: 1 }}>
          <T variant="heading">{shop.name}</T>
          <T variant="caption" muted>{shop.address} · times in local time</T>
        </View>
      </Row>

      <View style={{ marginTop: 22 }}>
        <StepCard step={1} title="Choose a service" state={item ? "done" : "active"}>
          {shop.menu.map((m) => (
            <OptionRow
              key={m.key}
              label={m.name}
              sublabel={`${m.durationMin} min`}
              selected={m.key === service}
              onPress={() => setService(m.key)}
              right={<T variant="strong">{several ? "from " : ""}{money(m.fromPrice, shop.currency)}</T>}
            />
          ))}
        </StepCard>

        <StepConnector lit={!!item} side="right" />

        <StepCard step={2} title="When?" state={slot ? "done" : "active"}>
          <T variant="caption" muted style={{ marginBottom: 10 }}>{shop.city} time · {several ? "we seat you with the best-rated barber who's free" : `with ${shop.team[0]?.name}`}</T>
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
            {slots?.length === 0 && <T muted>No free chairs this day — try another day.</T>}
            <Wrap gap={8}>
              {slots?.map((s) => <Pill key={s} label={time(s, shop.timeZone)} selected={s === slot} onPress={() => setSlot(s)} />)}
            </Wrap>
          </View>
        </StepCard>

        <StepConnector lit={!!slot} />

        <StepCard step={3} title="Anything to add?" state={slot ? "active" : "upcoming"}>
          <Field label="Notes for your barber (optional)" placeholder="e.g. Mid fade, keep the length on top" value={notes} onChangeText={setNotes} multiline style={{ marginBottom: 0 }} />
          {several && (
            <View style={{ marginTop: 12 }}>
              <IconLine icon="information-circle-outline" muted>You'll see your barber and the exact price before you pay.</IconLine>
            </View>
          )}
        </StepCard>
      </View>
      {error && <View style={{ marginTop: 16 }}><ErrorBox message={error} /></View>}
    </Screen>
  );
}
