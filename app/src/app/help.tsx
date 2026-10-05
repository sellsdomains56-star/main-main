import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { colors, fonts, radius } from "../components/theme";
import { Button, Card, Divider, ErrorBox, Field, GoldIcon, Loading, Pill, Row, Screen, SearchBar, Section, T, Wrap, styles } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { FaqItem } from "../lib/types";

const TOPICS: { value: string; label: string }[] = [
  { value: "booking", label: "A booking" },
  { value: "payment", label: "Payment or refund" },
  { value: "account", label: "My account" },
  { value: "barber", label: "I'm a barber" },
  { value: "shop", label: "Shop order" },
  { value: "other", label: "Something else" },
];

export default function Help() {
  const { user } = useAuth();
  const [faq, setFaq] = useState<FaqItem[] | null>(null);
  const [supportEmail, setSupportEmail] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [topic, setTopic] = useState("booking");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.faq().then((r) => {
      setFaq(r.faq);
      setSupportEmail(r.email);
    }, (e: Error) => setError(e.message));
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (faq ?? []).filter((f) => !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
  }, [faq, query]);

  async function submit() {
    setSending(true);
    setError(null);
    try {
      const t = await api.createTicket({ topic, message, email: user ? undefined : email });
      setSent(t.id);
      setMessage("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Help centre" }} />
      <T variant="display">How can we help?</T>

      <Pressable
        onPress={() => router.push("/assistant")}
        accessibilityRole="button"
        style={({ pressed }) => [{ marginTop: 18, backgroundColor: colors.ink, borderRadius: radius.lg, padding: 18, flexDirection: "row", alignItems: "center", gap: 14 }, pressed && styles.pressed]}
      >
        <GoldIcon icon="sparkles" dark size={48} />
        <View style={{ flex: 1 }}>
          <T variant="heading" color={colors.gold}>Chat with JB Concierge</T>
          <T variant="caption" color="rgba(255,255,255,0.75)">Instant answers, barber recommendations and booking help — 24/7.</T>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.gold} />
      </Pressable>

      <Section title="Common questions">
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search help articles" />
        <View style={{ marginTop: 8 }}>
          {!faq && !error && <Loading />}
          {faq && shown.length === 0 && <T muted style={{ marginTop: 12 }}>No articles match — ask the concierge or contact us below.</T>}
          {shown.map((f, i) => {
            const expanded = open === f.id;
            return (
              <View key={f.id}>
                {i > 0 && <Divider style={{ marginVertical: 0 }} />}
                <Pressable
                  onPress={() => setOpen(expanded ? null : f.id)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 16, minHeight: 44 }}
                >
                  <T variant="strong" style={{ flex: 1 }}>{f.question}</T>
                  <Ionicons name={expanded ? "remove" : "add"} size={20} color={colors.goldDeep} />
                </Pressable>
                {expanded && <T muted style={{ paddingBottom: 16, lineHeight: 23 }}>{f.answer}</T>}
              </View>
            );
          })}
        </View>
      </Section>

      <Section title="Contact support">
        {sent ? (
          <Card tone="surface">
            <Row gap={10}>
              <Ionicons name="checkmark-circle" size={22} color={colors.gold} />
              <View style={{ flex: 1 }}>
                <T variant="strong">Message sent</T>
                <T variant="caption" muted>Ticket #{sent.slice(0, 8)} · we usually reply within 24 hours{user ? ` to ${user.email}` : ""}.</T>
              </View>
            </Row>
            <Button title="Send another message" variant="ghost" size="sm" onPress={() => setSent(null)} style={{ alignSelf: "flex-start", marginTop: 8 }} />
          </Card>
        ) : (
          <>
            <T variant="caption" muted style={{ marginBottom: 8 }}>What's it about?</T>
            <Wrap>{TOPICS.map((t) => <Pill key={t.value} label={t.label} selected={topic === t.value} onPress={() => setTopic(t.value)} />)}</Wrap>
            <View style={{ marginTop: 16 }}>
              {!user && <Field label="Your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />}
              <Field label="Message" value={message} onChangeText={setMessage} multiline placeholder="Tell us what happened — include the barber and date if it's about a booking." />
            </View>
            {error && <ErrorBox message={error} />}
            <Button title="Send message" onPress={submit} loading={sending} disabled={message.trim().length < 10 || (!user && !email.includes("@"))} />
          </>
        )}
        {!!supportEmail && (
          <T variant="caption" muted center style={{ marginTop: 14 }}>
            Or email us at <T variant="caption" color={colors.goldDeep} style={{ fontFamily: fonts.semibold }}>{supportEmail}</T>
          </T>
        )}
      </Section>
    </Screen>
  );
}
