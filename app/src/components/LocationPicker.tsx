import { ScrollView, View } from "react-native";
import { flag, useLocation } from "../lib/location";
import { Chip, ErrorBox, Loading, P } from "./ui";

/** Choose country, then city. Picking "All cities" searches the whole country. */
export function LocationPicker() {
  const { countries, place, setPlace, country, error, reload } = useLocation();
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!countries.length) return <Loading />;
  return (
    <View>
      <P muted style={{ marginBottom: 8, fontWeight: "600" }}>Country</P>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {countries.map((c) => (
          <Chip
            key={c.code}
            label={`${flag(c.code)} ${c.name}`}
            selected={place?.countryCode === c.code}
            onPress={() => setPlace({ countryCode: c.code, city: "" })}
          />
        ))}
      </ScrollView>
      {country && (
        <>
          <P muted style={{ marginVertical: 8, fontWeight: "600" }}>City</P>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <Chip label="All cities" selected={place?.city === ""} onPress={() => setPlace({ countryCode: country.code, city: "" })} />
            {country.cities.map((city) => (
              <Chip
                key={city.name}
                label={`${city.name} (${city.barberCount})`}
                selected={place?.city === city.name}
                onPress={() => setPlace({ countryCode: country.code, city: city.name })}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}
