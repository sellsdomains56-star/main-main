import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { colors } from "../../components/theme";
import { Avatar, Button, Card, EmptyState, ErrorBox, Field, Photo, Placeholder, Rating, Row, Screen, T } from "../../components/ui";
import { api } from "../../lib/api";
import type { Review } from "../../lib/types";

/** Every review of the barber, with a reply box. Replies show under the review on the public profile. */
export default function BusinessReviews() {
  const [list, setList] = useState<Review[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    api.myReviews().then(setList, (e: Error) => setError(e.message));
  }, []);
  useFocusEffect(load);

  const send = async (r: Review) => {
    setBusy(r.id);
    setError(null);
    try {
      const saved = await api.replyToReview(r.id, drafts[r.id] ?? "");
      setList((l) => l?.map((x) => (x.id === r.id ? { ...x, reply: saved.reply } : x)) ?? l);
      setEditing(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const unanswered = list?.filter((r) => !r.reply).length ?? 0;
  return (
    <Screen>
      <Stack.Screen options={{ title: "Reviews" }} />
      <T variant="title">Reviews</T>
      <T variant="caption" muted style={{ marginTop: 4, marginBottom: 16 }}>
        {list ? (unanswered ? `${unanswered} waiting for a reply. A short thank-you goes a long way.` : "All answered. Nice work.") : " "}
      </T>
      {error && <ErrorBox message={error} onRetry={load} />}
      {!list && !error && <Placeholder kind="cards" />}
      {list?.length === 0 && <EmptyState icon="chatbubble-ellipses-outline" title="No reviews yet" body="Clients can rate you after each finished cut." />}
      {list?.map((r) => {
        return (
          <Card key={r.id} style={{ marginBottom: 12 }}>
            <Row gap={10}>
              <Avatar name={r.customerName} size={36} />
              <View style={{ flex: 1 }}>
                <T variant="strong">{r.customerName}</T>
                <T variant="small" muted>{new Date(r.createdAt).toLocaleDateString()}</T>
              </View>
              <Rating value={r.rating} />
            </Row>
            {!!r.comment && <T style={{ marginTop: 8 }}>{r.comment}</T>}
            {!!r.photoUrl && <Photo uri={r.photoUrl} name={r.customerName} style={{ width: 96, height: 96, marginTop: 10 }} />}
            {r.reply && editing !== r.id && (
              <View style={{ marginTop: 10, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: colors.border }}>
                <T variant="caption" muted>Your reply</T>
                <T variant="caption" style={{ marginTop: 2 }}>{r.reply.text}</T>
                <Button title="Edit" size="sm" variant="ghost" style={{ alignSelf: "flex-start" }} onPress={() => { setDrafts((d) => ({ ...d, [r.id]: r.reply!.text })); setEditing(r.id); }} />
              </View>
            )}
            {(!r.reply || editing === r.id) && (
              <View style={{ marginTop: 10 }}>
                <Field
                  label={r.reply ? "Edit your reply" : "Reply"}
                  value={drafts[r.id] ?? ""}
                  onChangeText={(v) => setDrafts((d) => ({ ...d, [r.id]: v }))}
                  placeholder={`Thanks ${r.customerName}, see you next time!`}
                  multiline
                  maxLength={500}
                  style={{ marginBottom: 8 }}
                />
                <Row gap={8}>
                  <Button title={r.reply ? "Save reply" : "Send reply"} size="sm" disabled={(drafts[r.id] ?? "").trim().length < 2} loading={busy === r.id} onPress={() => send(r)} />
                  {editing === r.id && <Button title="Cancel" size="sm" variant="ghost" onPress={() => setEditing(null)} />}
                </Row>
              </View>
            )}
          </Card>
        );
      })}
    </Screen>
  );
}
