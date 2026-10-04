import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { flag, useLocation } from "../lib/location";
import type { Country } from "../lib/types";
import { colors, fonts, radius } from "./theme";
import { ErrorBox, IconButton, Loading, Row, T } from "./ui";

/** "Berlin, Germany ⌄" pill — opens a sheet to pick country, then city. */
export function LocationPill({ label = "Your city" }: { label?: string }) {
  const { place, country } = useLocation();
  const [open, setOpen] = useState(false);
  const text = place ? (place.city ? `${place.city}, ${country?.name ?? place.countryCode}` : `All of ${country?.name ?? place.countryCode}`) : "Choose your city";
  return (
    <>
      <Pressable onPress={() => setOpen(true)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`${label}: ${text}`}>
        <T variant="small" muted>{label}</T>
        <Row gap={4}>
          <Ionicons name="location" size={16} color={colors.gold} />
          <T variant="strong" numberOfLines={1} style={{ fontFamily: fonts.bold, maxWidth: 240 }}>{text}</T>
          <Ionicons name="chevron-down" size={16} color={colors.text} />
        </Row>
      </Pressable>
      <LocationSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function LocationSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { countries, place, setPlace, error, reload } = useLocation();
  const [picked, setPicked] = useState<Country | null>(null);
  const insets = useSafeAreaInsets();
  const close = () => {
    setPicked(null);
    onClose();
  };
  const choose = (countryCode: string, city: string) => {
    setPlace({ countryCode, city });
    close();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(16,24,20,0.35)" }} onPress={close} accessibilityLabel="Close" />
      <View style={{ backgroundColor: colors.bg, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: "80%", paddingBottom: insets.bottom + 12, width: "100%", maxWidth: 760, alignSelf: "center" }}>
        <View style={{ alignItems: "center", paddingTop: 10 }}>
          <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: colors.surfaceStrong }} />
        </View>
        <Row style={{ paddingHorizontal: 20, paddingVertical: 14, justifyContent: "space-between" }}>
          <Row gap={6}>
            {picked && <IconButton icon="chevron-back" label="Back" tone="plain" onPress={() => setPicked(null)} />}
            <T variant="title">{picked ? `${flag(picked.code)} ${picked.name}` : "Where are you?"}</T>
          </Row>
          <IconButton icon="close" label="Close" onPress={close} />
        </Row>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 12 }}>
          {error && <View style={{ paddingHorizontal: 8 }}><ErrorBox message={error} onRetry={reload} /></View>}
          {!countries.length && !error && <Loading />}
          {!picked &&
            countries.map((c) => (
              <Option
                key={c.code}
                flag={flag(c.code)}
                title={c.name}
                subtitle={`${c.cities.length} ${c.cities.length === 1 ? "city" : "cities"}`}
                selected={place?.countryCode === c.code}
                chevron
                onPress={() => setPicked(c)}
              />
            ))}
          {picked && (
            <>
              <Option icon="globe-outline" title={`All of ${picked.name}`} selected={place?.countryCode === picked.code && place.city === ""} onPress={() => choose(picked.code, "")} />
              {picked.cities.map((city) => (
                <Option
                  key={city.name}
                  icon="business-outline"
                  title={city.name}
                  subtitle={`${city.barberCount} ${city.barberCount === 1 ? "barber" : "barbers"}`}
                  selected={place?.countryCode === picked.code && place.city === city.name}
                  onPress={() => choose(picked.code, city.name)}
                />
              ))}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function Option({ flag: flagText, icon, title, subtitle, selected, chevron, onPress }: { flag?: string; icon?: keyof typeof Ionicons.glyphMap; title: string; subtitle?: string; selected?: boolean; chevron?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, padding: 12, borderRadius: radius.md, backgroundColor: pressed || selected ? colors.surface : "transparent" })}>
      {flagText ? (
        <T style={{ fontSize: 26, lineHeight: 32, width: 40, textAlign: "center" }}>{flagText}</T>
      ) : (
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.goldSoft, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name={icon ?? "location-outline"} size={19} color={colors.goldDeep} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <T variant="strong">{title}</T>
        {subtitle && <T variant="caption" muted>{subtitle}</T>}
      </View>
      {selected && <Ionicons name="checkmark-circle" size={22} color={colors.gold} />}
      {chevron && <Ionicons name="chevron-forward" size={18} color={colors.faint} />}
    </Pressable>
  );
}
