import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { colors, radius } from "../../components/theme";
import { Avatar, Button, Card, EmptyState, ErrorBox, Field, IconLine, Pill, Placeholder, Row, Screen, SearchBar, T, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import { money } from "../../lib/format";
import type { Client } from "../../lib/types";

type Filter = "all" | "lapsed" | "regulars";
const WEEK = 7 * 86_400_000;
const ago = (iso: string) => {
  const days = Math.round((Date.now() - Date.parse(iso)) / 86_400_000);
  return days < 1 ? "today" : days === 1 ? "yesterday" : days < 14 ? `${days} days ago` : `${Math.round(days / 7)} weeks ago`;
};
const TEMPLATE = "We miss you in the chair! Book this week and I'll make sure you leave fresh.";

/** Everyone who's sat in the chair: visits, spend, notes, and a "we miss you" message to the ones who've gone quiet. */
export default function Clients() {
  const [list, setList] = useState<Client[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [picked, setPicked] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null); // client card with the note editor
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [composer, setComposer] = useState(false);
  const [text, setText] = useState(TEMPLATE);
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setError(null);
    api.myClients().then(setList, (e: Error) => setError(e.message));
  }, []);
  useFocusEffect(load);

  const lapsed = (c: Client) => !c.nextVisit && !!c.lastVisit && Date.now() - Date.parse(c.lastVisit) > 6 * WEEK;
  const shown = (list ?? []).filter((c) => (!q.trim() || c.name.toLowerCase().includes(q.trim().toLowerCase())) && (filter === "all" || (filter === "lapsed" ? lapsed(c) : c.visits >= 3)));
  const toggle = (key: string) => setPicked((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));
  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await api.messageClients(picked, text);
      setResult(`Sent to ${r.sent} ${r.sent === 1 ? "client" : "clients"}${r.skipped ? ` · ${r.skipped} skipped (messaged this week, walk-ins or offers off)` : ""}.`);
      setComposer(false);
      setPicked([]);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const saveNote = async (c: Client) => {
    try {
      await api.saveClientNote(c.key, notes[c.key] ?? "");
      setList((l) => l?.map((x) => (x.key === c.key ? { ...x, note: notes[c.key] ?? "" } : x)) ?? l);
      setOpen(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Screen footer={picked.length > 0 && !composer ? <Button title={`Message ${picked.length} ${picked.length === 1 ? "client" : "clients"}`} icon="chatbubble-ellipses-outline" onPress={() => setComposer(true)} /> : undefined}>
      <Stack.Screen options={{ title: "Clients" }} />
      <T variant="title">Clients</T>
      <T variant="caption" muted style={{ marginTop: 4, marginBottom: 12 }}>{list ? `${list.length} people have sat in your chair.` : " "}</T>
      <SearchBar value={q} onChangeText={setQ} placeholder="Search by name" />
      <Wrap>
        <Pill label="All" selected={filter === "all"} onPress={() => setFilter("all")} />
        <Pill label="Not seen in 6+ weeks" icon="hourglass-outline" selected={filter === "lapsed"} onPress={() => setFilter("lapsed")} />
        <Pill label="Regulars (3+ visits)" icon="repeat" selected={filter === "regulars"} onPress={() => setFilter("regulars")} />
      </Wrap>
      {filter === "lapsed" && shown.some((c) => c.fromApp) && (
        <Button title="Pick everyone here" size="sm" variant="ghost" style={{ alignSelf: "flex-start", marginTop: 8 }} onPress={() => setPicked(shown.filter((c) => c.fromApp).map((c) => c.key))} />
      )}
      {result && <View style={{ marginTop: 12 }}><IconLine icon="checkmark-circle-outline">{result}</IconLine></View>}
      {composer && (
        <Card tone="surface" style={{ marginTop: 14 }}>
          <T variant="strong">Message {picked.length} {picked.length === 1 ? "client" : "clients"}</T>
          <T variant="caption" muted style={{ marginTop: 2, marginBottom: 10 }}>Arrives in their JB alerts with your booking link. People who turned offers off, or got a message from you this week, are skipped.</T>
          <Field label="Message" value={text} onChangeText={setText} multiline maxLength={400} />
          <Row gap={8}>
            <Button title="Send" size="sm" icon="send" onPress={send} loading={busy} disabled={text.trim().length < 5} />
            <Button title="Cancel" size="sm" variant="ghost" onPress={() => setComposer(false)} />
          </Row>
        </Card>
      )}
      {error && <ErrorBox message={error} onRetry={load} />}
      <View style={{ marginTop: 14 }}>
        {!list && !error && <Placeholder kind="rows" />}
        {list && shown.length === 0 && <EmptyState icon="people-outline" title={list.length ? "Nobody here" : "No clients yet"} body={list.length ? "Try another filter." : "Everyone you cut appears here, with their visits and your notes."} />}
        {shown.map((c) => (
          <Card key={c.key} style={{ marginBottom: 10 }}>
            <Row gap={12}>
              {c.fromApp ? (
                <Pressable onPress={() => toggle(c.key)} accessibilityRole="checkbox" accessibilityState={{ checked: picked.includes(c.key) }} accessibilityLabel={`Pick ${c.name}`} hitSlop={8}>
                  <Ionicons name={picked.includes(c.key) ? "checkbox" : "square-outline"} size={22} color={picked.includes(c.key) ? colors.text : colors.faint} />
                </Pressable>
              ) : (
                <View style={{ width: 22 }} />
              )}
              <Avatar uri={c.photoUrl} name={c.name} size={42} />
              <View style={{ flex: 1 }}>
                <T variant="strong">{c.name}</T>
                <T variant="caption" muted>
                  {c.visits ? `${c.visits} ${c.visits === 1 ? "visit" : "visits"}` : "New client"}{c.lastVisit ? ` · last ${ago(c.lastVisit)}` : ""} · {money(c.spend, c.currency)}
                </T>
              </View>
              {lapsed(c) && <Ionicons name="hourglass-outline" size={16} color={colors.muted} accessibilityLabel="Not seen in a while" />}
            </Row>
            <View style={{ marginTop: 8, gap: 4 }}>
              {c.nextVisit && <IconLine icon="calendar-outline">Next: {new Date(c.nextVisit).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}</IconLine>}
              {c.lastService && <IconLine icon="cut-outline" muted>Last time: {c.lastService}{c.cutNotes ? ` · ${c.cutNotes}` : ""}</IconLine>}
              {!!c.preferences?.drink && <IconLine icon="cafe-outline" muted>{c.preferences.drink}{c.preferences.conversation === "quiet" ? " · prefers quiet" : ""}</IconLine>}
              {!c.fromApp && <IconLine icon="walk-outline" muted>Walk-in{c.phone ? ` · ${c.phone}` : ""}</IconLine>}
              {c.note && open !== c.key && <IconLine icon="lock-closed-outline">{c.note}</IconLine>}
            </View>
            {open === c.key ? (
              <View style={{ marginTop: 10 }}>
                <Field label="Private note (only you see it)" value={notes[c.key] ?? c.note} onChangeText={(v) => setNotes((n) => ({ ...n, [c.key]: v }))} multiline maxLength={500} />
                <Row gap={8}>
                  <Button title="Save note" size="sm" onPress={() => saveNote(c)} />
                  <Button title="Cancel" size="sm" variant="ghost" onPress={() => setOpen(null)} />
                </Row>
              </View>
            ) : (
              <Pressable onPress={() => setOpen(c.key)} accessibilityRole="button" style={{ marginTop: 8, alignSelf: "flex-start", paddingVertical: 4, borderRadius: radius.sm }}>
                <T variant="caption" style={{ textDecorationLine: "underline" }}>{c.note ? "Edit note" : "Add a private note"}</T>
              </Pressable>
            )}
          </Card>
        ))}
      </View>
    </Screen>
  );
}
