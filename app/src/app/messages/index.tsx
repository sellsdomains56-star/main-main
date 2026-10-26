import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { colors, fonts } from "../../components/theme";
import { Avatar, EmptyState, ErrorBox, Placeholder, Row, Screen, T } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { onLive } from "../../lib/live";
import type { ChatSummary } from "../../lib/types";

const when = (iso: string) => {
  const d = new Date(iso);
  return Date.now() - d.getTime() < 86_400_000 ? d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

/** Conversations with barbers (or, for a barber, with clients). */
export default function Messages() {
  const { user } = useAuth();
  const [list, setList] = useState<ChatSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    if (!user) return;
    api.chats().then(setList, (e: Error) => setError(e.message));
  }, [user]);
  useFocusEffect(load);
  useEffect(() => onLive((e) => e === "chat" && load()), [load]);

  if (!user) return <Screen><EmptyState icon="chatbubbles-outline" title="Messages" body="Sign in to message your barber." action={{ label: "Sign in", onPress: () => router.push("/login") }} /></Screen>;
  return (
    <Screen>
      <T variant="title">Messages</T>
      <T variant="caption" muted style={{ marginTop: 4, marginBottom: 12 }}>{user.role === "barber" ? "Questions from your clients." : "Talk to barbers you've booked: a photo of the cut you want, running late, parking."}</T>
      {error && <ErrorBox message={error} onRetry={load} />}
      {!list && !error && <Placeholder kind="rows" />}
      {list?.length === 0 && <EmptyState icon="chatbubbles-outline" title="No messages yet" body={user.role === "barber" ? "When a client messages you, it appears here." : "Open a booking or a barber you've booked and tap Message."} />}
      {list?.map((c) => (
        <Pressable key={c.id} onPress={() => router.push({ pathname: "/messages/[id]", params: { id: c.id } })} accessibilityRole="button" accessibilityLabel={`Conversation with ${c.with.name}`} style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Row gap={12}>
            <Avatar uri={c.with.photoUrl} name={c.with.name} size={48} />
            <View style={{ flex: 1 }}>
              <Row style={{ justifyContent: "space-between" }}>
                <T variant="strong">{c.with.name}</T>
                <T variant="small" muted>{when(c.updatedAt)}</T>
              </Row>
              <T variant="caption" muted numberOfLines={1} style={c.unread ? { color: colors.text, fontFamily: fonts.semibold } : undefined}>
                {c.last ? `${c.last.from === (user.role === "barber" ? "barber" : "customer") ? "You: " : ""}${c.last.text}` : "Say hello"}
              </T>
            </View>
            {c.unread > 0 && <View style={{ minWidth: 22, height: 22, borderRadius: 11, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 }}><T variant="small" color={colors.onInk}>{c.unread}</T></View>}
          </Row>
        </Pressable>
      ))}
    </Screen>
  );
}
