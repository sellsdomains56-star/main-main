import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Card, ErrorBox, IconLine, Screen, T } from "../../components/ui";
import { LEGAL, LEGAL_REVIEWED, LEGAL_UPDATED } from "../../lib/legal";

/** Terms of use and privacy policy. */
export default function LegalPage() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const page = LEGAL[doc as keyof typeof LEGAL];
  if (!page) return <Screen><ErrorBox message="Page not found." /></Screen>;
  return (
    <Screen>
      <Stack.Screen options={{ title: page.title }} />
      <T variant="display">{page.title}</T>
      <T variant="caption" muted style={{ marginTop: 6 }}>Last updated {LEGAL_UPDATED}</T>
      {!LEGAL_REVIEWED && <Card tone="surface" style={{ marginTop: 14 }}><IconLine icon="information-circle-outline" muted>Draft: this wording is being reviewed by our lawyers before launch.</IconLine></Card>}
      <T style={{ marginTop: 16, lineHeight: 24 }}>{page.intro}</T>
      {page.sections.map((s) => (
        <View key={s.heading} style={{ marginTop: 22 }}>
          <T variant="heading" style={{ marginBottom: 6 }}>{s.heading}</T>
          {s.body.map((p, i) => <T key={i} muted style={{ lineHeight: 23, marginTop: i ? 8 : 0 }}>{p}</T>)}
        </View>
      ))}
    </Screen>
  );
}
