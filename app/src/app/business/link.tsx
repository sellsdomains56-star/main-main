import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { QrCode } from "../../components/QrCode";
import { colors, radius } from "../../components/theme";
import { Button, Card, ErrorBox, IconLine, Loading, Row, Screen, Section, T, Tag } from "../../components/ui";
import { api } from "../../lib/api";
import { LEVEL_HELP, LEVEL_LABEL } from "../../lib/rules";
import { shareText } from "../../lib/share";
import type { Level } from "../../lib/types";

const LEVELS: Level[] = ["new", "rising", "pro", "elite"];

/** The barber's own booking link and QR code (for the mirror, the card, the Instagram bio), and their level. */
export default function MyLink() {
  const [link, setLink] = useState<{ url: string; name: string; level: Level; levelLabel: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  useEffect(() => {
    api.myLink().then(setLink, (e: Error) => setError(e.message));
  }, []);
  if (!link) return <Screen>{error ? <ErrorBox message={error} /> : <Loading />}</Screen>;

  const share = async () => {
    const how = await shareText(`Book ${link.name}`, `Book your next cut with me on JB Always Fresh:`, link.url);
    setNote(how === "copied" ? "Link copied." : null);
  };

  return (
    <Screen footer={<Button title="Share my link" icon="share-social-outline" onPress={share} />}>
      <Stack.Screen options={{ title: "My link & QR" }} />
      <T variant="title">My link & QR code</T>
      <T variant="caption" muted style={{ marginTop: 4 }}>Clients scan it at your chair or tap it in your bio, and land on your profile ready to book.</T>
      <Card style={{ marginTop: 18, alignItems: "center", paddingVertical: 24, borderRadius: radius.xl }}>
        <QrCode value={link.url} size={220} label={`QR code to book ${link.name}`} />
        <T variant="heading" style={{ marginTop: 14 }}>{link.name}</T>
        <T variant="caption" muted center>{link.url.replace(/^https?:\/\//, "")}</T>
        <T variant="small" muted style={{ marginTop: 10 }}>Screenshot it and print it for your mirror.</T>
      </Card>
      {note && <View style={{ marginTop: 12 }}><IconLine icon="checkmark-circle-outline">{note}</IconLine></View>}

      <Section title="Your level">
        <Row gap={8} style={{ flexWrap: "wrap" }}>
          {LEVELS.map((l) => <Tag key={l} label={LEVEL_LABEL[l]} tone={l === link.level ? "dark" : "neutral"} icon={l === link.level ? "ribbon" : undefined} />)}
        </Row>
        <View style={{ marginTop: 12, gap: 6 }}>
          {LEVELS.map((l) => <IconLine key={l} icon={l === link.level ? "checkmark-circle" : "ellipse-outline"} muted={l !== link.level}>{LEVEL_LABEL[l]}: {LEVEL_HELP[l]}</IconLine>)}
        </View>
        <T variant="small" color={colors.muted} style={{ marginTop: 10 }}>Your level shows on your profile. Finished cuts and good ratings move you up.</T>
      </Section>
    </Screen>
  );
}
