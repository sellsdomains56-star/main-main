import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { BarberCard } from "../../components/BarberCard";
import { LocationPicker } from "../../components/LocationPicker";
import { useTheme } from "../../components/theme";
import { Button, Card, ErrorBox, H1, H2, Loading, P, Screen as ScreenBody } from "../../components/ui";
import { api } from "../../lib/api";
import { flag, useLocation } from "../../lib/location";
import type { Barber } from "../../lib/types";

export default function Home() {
  const t = useTheme();
  const { place, country } = useLocation();
  const [top, setTop] = useState<Barber[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!place) return;
    setTop(null);
    setError(null);
    api.barbers({ country: place.countryCode, city: place.city || undefined }).then((list) => setTop(list.slice(0, 3)), (e: Error) => setError(e.message));
  }, [place]);

  const where = place ? (place.city || country?.name || "") : "";

  return (
    <View style={{ flex: 1 }}>
      <ScreenBody>
        <H1>Stay fresh. Always.</H1>
        <P muted>Book top-rated barbers in your city — at their shop or at your door. Not sure what cut to get? Ask our AI stylist.</P>

        <Card style={{ marginTop: 18 }}>
          <H2>Where are you?</H2>
          <LocationPicker />
        </Card>

        <Card style={{ backgroundColor: t.primary, borderColor: t.primary }} onPress={() => router.push("/stylist")}>
          <P style={{ color: t.primaryText, fontWeight: "800", fontSize: 18 }}>✨ Find your perfect haircut</P>
          <P style={{ color: t.primaryText, marginTop: 4 }}>
            Snap a photo of your head and our AI stylist recommends the cuts that suit your face shape and hair — then matches you with barbers who nail them.
          </P>
        </Card>

        <Card onPress={() => router.push("/shop")}>
          <P style={{ fontWeight: "800", fontSize: 18 }}>🛍️ Buy all GP's Fresh products</P>
          <P muted style={{ marginTop: 4 }}>
            Pomades, beard oils, shampoos and tools — the same products our barbers use, delivered to your door.
          </P>
          <P style={{ color: t.primary, fontWeight: "700", marginTop: 8 }}>Shop now →</P>
        </Card>

        {place && (
          <>
            <H2>
              Top barbers in {country ? flag(country.code) : ""} {where}
            </H2>
            {error && <ErrorBox message={error} />}
            {!top && !error && <Loading />}
            {top?.length === 0 && <P muted>No barbers here yet — try another city.</P>}
            {top?.map((b) => <BarberCard key={b.id} barber={b} />)}
            {!!top?.length && <Button title={`See all barbers in ${where}`} variant="secondary" onPress={() => router.push("/barbers")} />}
          </>
        )}
      </ScreenBody>
    </View>
  );
}

