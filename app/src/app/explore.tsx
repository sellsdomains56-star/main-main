import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarberCard } from "../components/BarberCard";
import { LocationPill } from "../components/LocationSheet";
import { colors, fonts, radius } from "../components/theme";
import { Button, Divider, EmptyState, ErrorBox, Field, IconButton, Loading, Pill, Row, SearchBar, Segmented, T, Wrap, styles } from "../components/ui";
import { api } from "../lib/api";
import { useLocation } from "../lib/location";
import type { Barber, BarberSearch } from "../lib/types";

type Sort = NonNullable<BarberSearch["sort"]>;
const SORTS: { value: Sort; label: string }[] = [
  { value: "rating", label: "Top rated" },
  { value: "soonest", label: "Soonest" },
  { value: "price", label: "Lowest price" },
  { value: "experience", label: "Most experienced" },
];
const RATINGS = [0, 4, 4.5, 4.8];

interface Filters {
  specialty: string[];
  minRating: number;
  maxPrice: string; // major units, only with a country selected
  availableToday: boolean;
  homeVisits: boolean;
  sort: Sort;
}

export default function Explore() {
  const params = useLocalSearchParams<{ home?: string; q?: string; specialty?: string; anywhere?: string }>();
  const { place, country } = useLocation();
  const [scope, setScope] = useState<"near" | "anywhere">(params.anywhere === "1" || !place ? "anywhere" : "near");
  const [search, setSearch] = useState(params.q ?? "");
  const [filters, setFilters] = useState<Filters>({
    specialty: params.specialty ? params.specialty.split(",") : [],
    minRating: 0,
    maxPrice: "",
    availableToday: false,
    homeVisits: params.home === "1",
    sort: "rating",
  });
  const [sheet, setSheet] = useState(false);
  const [list, setList] = useState<Barber[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const near = scope === "near" && !!place;
  const query = useMemo<BarberSearch>(
    () => ({
      country: near ? place!.countryCode : undefined,
      city: near ? place!.city || undefined : undefined,
      search: search.trim() || undefined,
      specialty: filters.specialty,
      minRating: filters.minRating || undefined,
      maxPrice: near && parseFloat(filters.maxPrice) > 0 ? Math.round(parseFloat(filters.maxPrice) * 100) : undefined,
      availableToday: filters.availableToday,
      homeVisits: filters.homeVisits,
      sort: filters.sort,
    }),
    [near, place, search, filters],
  );

  useEffect(() => {
    setError(null);
    const handle = setTimeout(() => api.barbers(query).then(setList, (e: Error) => setError(e.message)), 250);
    return () => clearTimeout(handle);
  }, [query]);

  const activeCount =
    filters.specialty.length + (filters.minRating ? 1 : 0) + (near && filters.maxPrice ? 1 : 0) + (filters.availableToday ? 1 : 0) + (filters.homeVisits ? 1 : 0) + (filters.sort !== "rating" ? 1 : 0);
  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ title: "Find a barber" }} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={[styles.inner, styles.padded]}>
          {place && (
            <Segmented
              value={scope}
              onChange={setScope}
              options={[
                { value: "near", label: place.city ? `In ${place.city}` : `In ${country?.name ?? "my country"}` },
                { value: "anywhere", label: "Anywhere in the world" },
              ]}
            />
          )}
          {!place && <LocationPill label="Searching worldwide · set your city" />}

          <View style={{ marginTop: 14 }}>
            <SearchBar value={search} onChangeText={setSearch} placeholder={near ? "Name or style, e.g. skin fade" : "Style, city or name, e.g. braids lagos"} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginTop: 4, marginBottom: -10 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingVertical: 10 }}>
            <Pill label={activeCount ? `Filters · ${activeCount}` : "Filters"} icon="options-outline" selected={activeCount > 0} onPress={() => setSheet(true)} />
            <Pill label="Available today" icon="time-outline" selected={filters.availableToday} onPress={() => set({ availableToday: !filters.availableToday })} />
            <Pill label="Comes to me" icon="home-outline" selected={filters.homeVisits} onPress={() => set({ homeVisits: !filters.homeVisits })} />
            <Pill label="4.5+" icon="star-outline" selected={filters.minRating === 4.5} onPress={() => set({ minRating: filters.minRating === 4.5 ? 0 : 4.5 })} />
          </ScrollView>
          {filters.specialty.length > 0 && (
            <Row gap={6} style={{ marginTop: 10, flexWrap: "wrap" }}>
              {filters.specialty.map((s) => (
                <Pressable key={s} onPress={() => set({ specialty: filters.specialty.filter((x) => x !== s) })} accessibilityLabel={`Remove ${s}`}
                  style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.goldSoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <T variant="small" color={colors.goldDeep} style={{ fontFamily: fonts.semibold }}>{s}</T>
                  <Ionicons name="close" size={13} color={colors.goldDeep} />
                </Pressable>
              ))}
            </Row>
          )}

          <View style={{ marginTop: 12 }}>
            {error && <ErrorBox message={error} />}
            {!list && !error && <Loading />}
            {list?.length === 0 && (
              <EmptyState icon="cut-outline" title="No barbers found" body="Try fewer filters or search anywhere in the world." action={near ? { label: "Search anywhere", onPress: () => setScope("anywhere") } : undefined} />
            )}
            {!!list?.length && (
              <T variant="caption" muted style={{ marginTop: 4 }}>
                {list.length} {list.length === 1 ? "barber" : "barbers"} {near ? `in ${place!.city || country?.name}` : "worldwide"}
              </T>
            )}
            {list?.map((b, i) => (
              <View key={b.id}>
                {i > 0 && <Divider style={{ marginVertical: 0 }} />}
                <BarberCard barber={b} showCountry={!near} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <FilterSheet visible={sheet} onClose={() => setSheet(false)} filters={filters} set={set} near={near} currency={country?.currency} count={list?.length} />
    </View>
  );
}

function FilterSheet({ visible, onClose, filters, set, near, currency, count }: {
  visible: boolean; onClose: () => void; filters: Filters; set: (p: Partial<Filters>) => void; near: boolean; currency?: string; count?: number;
}) {
  const insets = useSafeAreaInsets();
  const [specialties, setSpecialties] = useState<string[]>([]);
  useEffect(() => {
    if (visible && !specialties.length) api.specialties().then(setSpecialties, () => {});
  }, [visible, specialties.length]);
  const toggle = (s: string) => set({ specialty: filters.specialty.includes(s) ? filters.specialty.filter((x) => x !== s) : [...filters.specialty, s] });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)" }} onPress={onClose} accessibilityLabel="Close filters" />
      <View style={{ backgroundColor: colors.bg, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: "86%", width: "100%", maxWidth: 760, alignSelf: "center", paddingBottom: insets.bottom + 12 }}>
        <Row style={{ justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 }}>
          <T variant="title">Filters</T>
          <IconButton icon="close" label="Close" onPress={onClose} />
        </Row>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}>
          <T variant="heading" style={{ marginTop: 8, marginBottom: 10 }}>Sort by</T>
          <Wrap>{SORTS.map((s) => <Pill key={s.value} label={s.label} selected={filters.sort === s.value} onPress={() => set({ sort: s.value })} />)}</Wrap>

          <T variant="heading" style={{ marginTop: 22, marginBottom: 10 }}>Hairstyle & specialty</T>
          {!specialties.length ? <Loading /> : <Wrap>{specialties.map((s) => <Pill key={s} label={s} selected={filters.specialty.includes(s)} onPress={() => toggle(s)} />)}</Wrap>}

          <T variant="heading" style={{ marginTop: 22, marginBottom: 10 }}>Rating</T>
          <Wrap>{RATINGS.map((r) => <Pill key={r} label={r ? `${r}+ stars` : "Any"} selected={filters.minRating === r} onPress={() => set({ minRating: r })} />)}</Wrap>

          <T variant="heading" style={{ marginTop: 22, marginBottom: 10 }}>Price</T>
          {near ? (
            <Field label={`Max starting price${currency ? ` (${currency.toUpperCase()})` : ""}`} value={filters.maxPrice} onChangeText={(maxPrice) => set({ maxPrice: maxPrice.replace(/[^\d.,]/g, "").replace(",", ".") })} keyboardType="decimal-pad" placeholder="Any" />
          ) : (
            <T variant="caption" muted>Prices are in each barber's local currency — choose a city to filter by price.</T>
          )}

          <T variant="heading" style={{ marginTop: 22, marginBottom: 10 }}>Availability & location</T>
          <Wrap>
            <Pill label="Available today" icon="time-outline" selected={filters.availableToday} onPress={() => set({ availableToday: !filters.availableToday })} />
            <Pill label="Comes to me" icon="home-outline" selected={filters.homeVisits} onPress={() => set({ homeVisits: !filters.homeVisits })} />
          </Wrap>
        </ScrollView>
        <Row gap={12} style={{ paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Button title="Reset" variant="ghost" size="md" onPress={() => set({ specialty: [], minRating: 0, maxPrice: "", availableToday: false, homeVisits: false, sort: "rating" })} />
          <Button title={count === undefined ? "Show barbers" : `Show ${count} ${count === 1 ? "barber" : "barbers"}`} onPress={onClose} style={{ flex: 1 }} />
        </Row>
      </View>
    </Modal>
  );
}
