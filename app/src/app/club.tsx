import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { MemberCard } from "../components/MemberCard";
import { SlideToConfirm } from "../components/SlideToConfirm";
import { colors, emphasis, fonts, radius } from "../components/theme";
import { Button, Card, ErrorBox, IconLine, Loading, Row, Screen, T } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { money } from "../lib/format";
import { useLocation } from "../lib/location";
import type { Membership, Plan, PlanId } from "../lib/types";

const shortDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "2-digit" });

/** The Club: monthly memberships with services included, member pricing and a member card. */
export default function Club() {
  const { welcome } = useLocalSearchParams<{ welcome?: string }>();
  const { user } = useAuth();
  const { place } = useLocation();
  const { width } = useWindowDimensions();
  const [plans, setPlans] = useState<{ currency: string; plans: Plan[] } | null>(null);
  const [membership, setMembership] = useState<Membership | null | undefined>(undefined);
  const [picked, setPicked] = useState<PlanId>("black");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.clubPlans(place?.countryCode).then(setPlans, (e: Error) => setError(e.message));
  }, [place?.countryCode]);
  useFocusEffect(
    useCallback(() => {
      if (user) api.clubMe().then((r) => {
        setMembership(r.membership);
        if (r.membership) setPicked(r.membership.plan);
      }, () => setMembership(null));
      else setMembership(null);
    }, [user]),
  );

  const cardW = Math.min(width, 760) - 40;
  const plan = plans?.plans.find((p) => p.id === picked);
  const active = membership?.active ? membership : null;

  const join = useCallback(async () => {
    if (!user) return router.push("/login");
    setBusy(true);
    setError(null);
    try {
      const { purchase } = await api.joinClub(picked, place?.countryCode);
      router.push({ pathname: "/checkout/[purchaseId]", params: { purchaseId: purchase.id } });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [user, picked, place?.countryCode]);

  if (!plans && !error) return <Screen><Loading /></Screen>;
  const renewing = active && active.plan === picked;

  return (
    <Screen
      footer={
        plan && (
          <View>
            <SlideToConfirm
              label={renewing ? `Slide to renew · ${money(plan.price, plans!.currency)}` : `Slide to join ${plan.name} · ${money(plan.price, plans!.currency)}`}
              loading={busy}
              onConfirm={join}
              resetAfter
            />
            <T variant="small" muted center style={{ marginTop: 8 }}>30 days · pay with Apple Pay or Google Pay</T>
          </View>
        )
      }
    >
      <Stack.Screen options={{ title: "The Club" }} />
      {active ? (
        <>
          {welcome && <T variant="eyebrow" muted style={{ marginBottom: 10 }}>Welcome to The Club</T>}
          <MemberCard plan={active.plan} planName={active.name} number={active.number} name={user?.name ?? ""} validUntil={shortDate(active.paidUntil)} width={cardW} />
          <T variant="small" muted center style={{ marginTop: 10 }}>Show your card at any JB barbershop · drag it to tilt</T>
          <Card style={{ marginTop: 18 }}>
            <Row style={{ justifyContent: "space-between" }}>
              <View>
                <T variant="eyebrow" muted>This period</T>
                <T variant="title" style={{ marginTop: 4 }}>{active.cutsLeft === null ? "Unlimited" : `${active.cutsLeft} ${active.cutsLeft === 1 ? "service" : "services"} left`}</T>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <T variant="eyebrow" muted>Renews by</T>
                <T variant="strong" style={{ marginTop: 6 }}>{new Date(active.paidUntil).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</T>
              </View>
            </Row>
            <View style={{ marginTop: 14, gap: 6 }}>
              {active.perks.map((p) => <IconLine key={p} icon="checkmark">{p}</IconLine>)}
            </View>
            <Button title="Book with my membership" icon="calendar-outline" onPress={() => router.push("/explore")} style={{ marginTop: 16 }} />
          </Card>
          <T variant="heading" style={{ marginTop: 28, marginBottom: 10 }}>{renewing ? "Renew or change plan" : "Change plan"}</T>
        </>
      ) : (
        <View style={{ backgroundColor: colors.ink, borderRadius: radius.xl, padding: 24, marginBottom: 20 }}>
          <T variant="eyebrow" color={colors.inkMuted} style={{ letterSpacing: 3 }}>The Club</T>
          <Text style={{ fontFamily: fonts.display, color: colors.onInk, fontSize: 38, lineHeight: 40, letterSpacing: -1.6, marginTop: 12 }}>Never{"\n"}grown out.</Text>
          <T variant="caption" color={colors.inkMuted} style={{ marginTop: 10, maxWidth: 300 }}>
            One monthly membership for cuts with any barber on {`JB Always Fresh`} — in the shop, or at your home, hotel or yacht with Black.
          </T>
        </View>
      )}

      {plans?.plans.map((p) => {
        const selected = p.id === picked;
        return (
          <Pressable
            key={p.id}
            onPress={() => setPicked(p.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${p.name}, ${money(p.price, plans.currency)} a month`}
            style={[
              { backgroundColor: p.id === "black" ? colors.ink : colors.card, borderRadius: radius.xl, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: p.id === "black" ? colors.ink : colors.border },
              selected && (p.id === "black" ? { borderColor: colors.gold, borderWidth: 1.5 } : emphasis),
            ]}
          >
            <Row style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <Row gap={8}>
                  <T variant="eyebrow" color={p.id === "black" ? colors.inkMuted : colors.muted} style={{ letterSpacing: 2.5 }}>{p.name}</T>
                  {p.id === "black" && <T variant="small" color={colors.inkMuted}>· most loved</T>}
                </Row>
                <T variant="heading" color={p.id === "black" ? colors.onInk : colors.text} style={{ marginTop: 6 }}>{p.tagline}</T>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <T variant="title" color={p.id === "black" ? colors.onInk : colors.text}>{money(p.price, plans.currency).replace(/[.,]00$/, "")}</T>
                <T variant="small" color={p.id === "black" ? colors.inkMuted : colors.muted}>a month</T>
              </View>
            </Row>
            <View style={{ marginTop: 14, gap: 6 }}>
              {p.perks.map((perk) => (
                <Row key={perk} gap={8}>
                  <Ionicons name="checkmark" size={16} color={p.id === "black" ? colors.onInk : colors.text} />
                  <T variant="caption" color={p.id === "black" ? colors.onInk : colors.text}>{perk}</T>
                </Row>
              ))}
            </View>
          </Pressable>
        );
      })}

      {!active && plan && (
        <View style={{ marginTop: 14, alignItems: "center" }}>
          <T variant="eyebrow" muted style={{ marginBottom: 10 }}>Your card</T>
          <MemberCard plan={plan.id} planName={plan.name} number="JB-0000-000" name={user?.name ?? "Your name"} width={Math.min(cardW, 340)} />
        </View>
      )}
      <T variant="small" muted center style={{ marginTop: 18 }}>
        Included services cover the service price with any barber; you pay any home-visit fee (free with Black). Switching plans starts a new 30 days.
      </T>
      {error && <View style={{ marginTop: 12 }}><ErrorBox message={error} /></View>}
    </Screen>
  );
}
