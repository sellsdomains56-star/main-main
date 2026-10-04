import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { BarberCard } from "../components/BarberCard";
import { LocationPill } from "../components/LocationSheet";
import { colors } from "../components/theme";
import { Divider, EmptyState, ErrorBox, Loading, Pill, Screen, SearchBar, T } from "../components/ui";
import { api } from "../lib/api";
import { useLocation } from "../lib/location";
import type { Barber } from "../lib/types";

export default function Explore() {
  const params = useLocalSearchParams<{ home?: string; q?: string }>();
  const { place } = useLocation();
  const [search, setSearch] = useState(params.q ?? "");
  const [homeVisits, setHomeVisits] = useState(params.home === "1");
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
      <LocationPill label="Showing barbers in" />
      <View style={{ marginTop: 16 }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search name or style" autoFocus={!params.home} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 14 }}>
        <Pill label="Comes to me" icon="home-outline" selected={homeVisits} onPress={() => setHomeVisits(!homeVisits)} />
        <Pill label="Top rated" icon="star-outline" selected={sort === "rating"} onPress={() => setSort("rating")} />
        <Pill label="Lowest price" icon="pricetag-outline" selected={sort === "price"} onPress={() => setSort("price")} />
      </ScrollView>

      <View style={{ marginTop: 12 }}>
        {!place && <EmptyState icon="location-outline" title="Choose your city" body="Tap the location above to see barbers near you." />}
        {error && <ErrorBox message={error} />}
        {place && !list && !error && <Loading />}
        {list?.length === 0 && <EmptyState icon="cut-outline" title="No barbers found" body="Try another city or clear the filters." />}
        {!!list?.length && <T variant="caption" muted style={{ marginTop: 6 }}>{list.length} {list.length === 1 ? "barber" : "barbers"}</T>}
        {list?.map((b, i) => (
          <View key={b.id}>
            {i > 0 && <Divider style={{ marginVertical: 0, backgroundColor: colors.border }} />}
            <BarberCard barber={b} />
          </View>
        ))}
      </View>
    </Screen>
  );
}
