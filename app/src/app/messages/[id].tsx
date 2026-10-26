import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radius } from "../../components/theme";
import { ErrorBox, Loading, T } from "../../components/ui";
import { api } from "../../lib/api";
import { onLive } from "../../lib/live";
import type { ChatThread } from "../../lib/types";

/** One conversation between a customer and a barber. */
export default function Thread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const scroll = useRef<ScrollView>(null);

  const load = useCallback(() => {
    api.chatThread(id).then(setThread, (e: Error) => setError(e.message));
  }, [id]);
  useEffect(() => {
    load();
    const t = setInterval(load, 15_000); // phones: catch replies while the thread is open
    const stop = onLive((e, data) => e === "chat" && (data as { chatId?: string } | null)?.chatId === id && load());
    return () => {
      clearInterval(t);
      stop();
    };
  }, [id, load]);
  useEffect(() => {
    setTimeout(() => scroll.current?.scrollToEnd({ animated: false }), 50);
  }, [thread?.messages.length]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    setError(null);
    try {
      const msg = await api.sendChat(id, text.trim());
      setText("");
      setThread((t) => (t ? { ...t, messages: [...t.messages, msg] } : t));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  if (!thread) return <View style={{ flex: 1, backgroundColor: colors.bg, padding: 20 }}>{error ? <ErrorBox message={error} onRetry={load} /> : <Loading />}</View>;
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <Stack.Screen options={{ title: thread.with.name }} />
      <ScrollView ref={scroll} contentContainerStyle={{ padding: 16, gap: 8, maxWidth: 720, width: "100%", alignSelf: "center" }}>
        {thread.messages.length === 0 && <T muted center style={{ marginTop: 24 }}>Say hello to {thread.with.name.split(" ")[0]}. Messages stay here with your bookings.</T>}
        {thread.messages.map((m) => {
          const mine = m.from === thread.side;
          return (
            <View key={m.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "80%", backgroundColor: mine ? colors.ink : colors.card, borderRadius: radius.lg, borderBottomRightRadius: mine ? 6 : radius.lg, borderBottomLeftRadius: mine ? radius.lg : 6, paddingHorizontal: 14, paddingVertical: 10, borderWidth: mine ? 0 : 1, borderColor: colors.border }}>
              <T color={mine ? colors.onInk : colors.text}>{m.text}</T>
              <T variant="small" color={mine ? colors.inkMuted : colors.muted} style={{ marginTop: 2, textAlign: "right" }}>{new Date(m.at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</T>
            </View>
          );
        })}
      </ScrollView>
      {error && <View style={{ paddingHorizontal: 16 }}><ErrorBox message={error} /></View>}
      <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-end", paddingHorizontal: 16, paddingTop: 10, paddingBottom: insets.bottom + 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message"
          placeholderTextColor={colors.faint}
          multiline
          maxLength={1000}
          accessibilityLabel="Message"
          onSubmitEditing={send}
          style={{ flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 11, color: colors.text, fontFamily: fonts.regular, fontSize: 16 }}
        />
        <Pressable onPress={send} disabled={sending || !text.trim()} accessibilityRole="button" accessibilityLabel="Send" style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: text.trim() ? colors.ink : colors.surface, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="arrow-up" size={20} color={text.trim() ? colors.onInk : colors.faint} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
