import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { colors, radius } from "../components/theme";
import { Avatar, Button, Card, EmptyState, ErrorBox, IconLine, Photo, Pill, Placeholder, Row, Screen, Section, T, Wrap } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { Booking } from "../lib/types";

const WEEKS = [2, 3, 4, 5, 6, 8];

/** Every finished cut with the barber's notes and photos, and "remind me to rebook every N weeks". */
export default function MyCuts() {
  const { user, setUser } = useAuth();
  const [cuts, setCuts] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!user) return;
    setError(null);
    api.cuts().then(setCuts, (e: Error) => setError(e.message));
  }, [user]);
  useFocusEffect(load);

  if (!user) return <Screen><EmptyState icon="cut-outline" title="Your cuts live here" body="Sign in to see every cut, your barber's notes and photos." action={{ label: "Sign in", onPress: () => router.push("/login") }} /></Screen>;

  const last = cuts?.[0];
  const rebookBarber = user.rebook ? cuts?.find((c) => c.barber.id === user.rebook!.barberId)?.barber : last?.barber;
  const setRebook = async (everyWeeks: number | null) => {
    setBusy(true);
    setError(null);
    try {
      setUser(await api.setRebook(everyWeeks === null ? { everyWeeks: null } : { everyWeeks, barberId: user.rebook?.barberId ?? last!.barber.id, serviceId: user.rebook?.serviceId ?? last!.service?.id }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <T variant="title">My cuts</T>
      <T variant="caption" muted style={{ marginTop: 4 }}>What you had, what your barber noted, and photos of the result.</T>
      {error && <ErrorBox message={error} onRetry={load} />}

      {rebookBarber && (
        <Card tone="surface" style={{ marginTop: 16 }}>
          <T variant="strong">Remind me to rebook</T>
          <T variant="caption" muted style={{ marginTop: 2, marginBottom: 10 }}>
            {user.rebook
              ? `We'll nudge you every ${user.rebook.everyWeeks} weeks with ${rebookBarber.name.split(" ")[0]}'s next free time. Next: ${new Date(user.rebook.nextAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}.`
              : `A nudge with ${rebookBarber.name.split(" ")[0]}'s next free time, so your cut never grows out.`}
          </T>
          <Wrap gap={8}>
            {WEEKS.map((w) => <Pill key={w} label={`Every ${w} weeks`} selected={user.rebook?.everyWeeks === w} onPress={() => !busy && setRebook(w)} />)}
            {user.rebook && <Pill label="Off" onPress={() => !busy && setRebook(null)} />}
          </Wrap>
        </Card>
      )}

      <Section title={cuts?.length ? `${cuts.length} ${cuts.length === 1 ? "cut" : "cuts"}` : undefined}>
        {!cuts && !error && <Placeholder kind="cards" />}
        {cuts?.length === 0 && <EmptyState icon="cut-outline" title="No cuts yet" body="After your first appointment, your barber's notes and photos appear here." action={{ label: "Find a barber", onPress: () => router.push("/explore") }} />}
        {cuts?.map((c) => (
          <Card key={c.id} style={{ marginBottom: 12 }}>
            <Row gap={12}>
              <Avatar uri={c.barber.photoUrl} name={c.barber.name} size={44} />
              <View style={{ flex: 1 }}>
                <T variant="strong">{c.service?.name ?? "Cut"}</T>
                <T variant="caption" muted>{c.barber.name} · {new Date(c.startsAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</T>
              </View>
            </Row>
            {!!c.extras?.length && <View style={{ marginTop: 10 }}><IconLine icon="add-circle-outline" muted>{c.extras.map((x) => x.name).join(", ")}</IconLine></View>}
            {c.cutNotes ? (
              <View style={{ marginTop: 10, padding: 12, borderRadius: radius.md, backgroundColor: colors.surface }}>
                <T variant="small" muted>Barber's notes</T>
                <T variant="caption" style={{ marginTop: 2 }}>{c.cutNotes}</T>
              </View>
            ) : null}
            {!!c.cutPhotos?.length && (
              <Row gap={8} style={{ marginTop: 10 }}>
                {c.cutPhotos.map((p) => <Photo key={p} uri={p} name="Your cut" style={{ width: 80, height: 80 }} />)}
              </Row>
            )}
            <Button
              title="Book this again"
              icon="repeat"
              size="sm"
              variant="secondary"
              style={{ alignSelf: "flex-start", marginTop: 12 }}
              onPress={() => router.push({ pathname: "/book/[barberId]", params: { barberId: c.barber.id, ...(c.service ? { serviceId: c.service.id } : {}), ...(c.extras?.length ? { extras: c.extras.map((x) => x.id).join(",") } : {}) } })}
            />
          </Card>
        ))}
      </Section>
    </Screen>
  );
}
