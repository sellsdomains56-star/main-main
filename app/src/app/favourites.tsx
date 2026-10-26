import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { BarberCard } from "../components/BarberCard";
import { Divider, EmptyState, ErrorBox, Placeholder, Screen, T } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { Barber } from "../lib/types";

/** Barbers the customer saved with the heart on their profile. */
export default function Favourites() {
  const { user } = useAuth();
  const [list, setList] = useState<Barber[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    if (!user) return;
    setError(null);
    api.favourites().then(setList, (e: Error) => setError(e.message));
  }, [user]);
  useFocusEffect(load);

  if (!user) return <Screen><EmptyState icon="heart-outline" title="Save your favourite barbers" body="Sign in, then tap the heart on a barber's profile." action={{ label: "Sign in", onPress: () => router.push("/login") }} /></Screen>;
  return (
    <Screen>
      <T variant="title">Favourites</T>
      <T variant="caption" muted style={{ marginTop: 4, marginBottom: 8 }}>Your barbers, one tap from booking.</T>
      {error && <ErrorBox message={error} onRetry={load} />}
      {!list && !error && <Placeholder kind="rows" />}
      {list?.length === 0 && <EmptyState icon="heart-outline" title="No favourites yet" body="Tap the heart on a barber's profile to keep them here." action={{ label: "Find a barber", onPress: () => router.push("/explore") }} />}
      {list?.map((b, i) => (
        <BarberDivided key={b.id} barber={b} first={i === 0} />
      ))}
    </Screen>
  );
}

function BarberDivided({ barber, first }: { barber: Barber; first: boolean }) {
  return (
    <>
      {!first && <Divider style={{ marginVertical: 0 }} />}
      <BarberCard barber={barber} />
    </>
  );
}
