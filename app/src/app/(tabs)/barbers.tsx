import { useEffect, useState } from "react";
import { View } from "react-native";
import { BarberCard } from "../../components/BarberCard";
import { LocationPicker } from "../../components/LocationPicker";
import { Card, Chip, ErrorBox, Field, Loading, P, Screen } from "../../components/ui";
import { api } from "../../lib/api";
import { useLocation } from "../../lib/location";
import type { Barber } from "../../lib/types";

export default function Barbers() {
  const { place } = useLocation();
  const [search, setSearch] = useState("");
  const [homeVisits, setHomeVisits] = useState(false);
  const [sort, setSort] = useState<"rating" | "price">("rating");
  const [list, setList] = useState<Barber[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!place) return;
    setError(null);
    const handle = setTimeout(() => {
      api
        .barbers({ country: place.countryCode, city: place.city || undefined, search: search.trim() || undefined, homeVisits, sort })
        .then(setList, (e: Error) => setError(e.message));
    }, 250);
    return () => clearTimeout(handle);
  }, [place, search, homeVisits, sort]);

  return (
    <Screen>
      <Card>
        <LocationPicker />
      </Card>
      {!place ? (
        <P muted>Pick your country and city to see barbers near you.</P>
      ) : (
        <>
          <Field label="Search" placeholder="Name or style, e.g. fade, beard, afro" value={search} onChangeText={setSearch} autoCapitalize="none" />
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <Chip label="🏠 Comes to me" selected={homeVisits} onPress={() => setHomeVisits(!homeVisits)} />
            <Chip label="⭐ Top rated" selected={sort === "rating"} onPress={() => setSort("rating")} />
            <Chip label="💸 Lowest price" selected={sort === "price"} onPress={() => setSort("price")} />
          </View>
          {error && <ErrorBox message={error} />}
          {!list && !error && <Loading />}
          {list?.length === 0 && <P muted>No barbers match. Try another city or clear the filters.</P>}
          {list?.map((b) => <BarberCard key={b.id} barber={b} />)}
        </>
      )}
    </Screen>
  );
}
