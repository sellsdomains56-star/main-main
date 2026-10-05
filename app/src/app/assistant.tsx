import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarberCard } from "../components/BarberCard";
import { Orb } from "../components/Orb";
import { colors, fonts, glowSmall, radius } from "../components/theme";
import { Button, Card, ErrorBox, GoldIcon, IconButton, Row, styles, T } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { dateTime } from "../lib/format";
import { useLocation } from "../lib/location";
import { storage } from "../lib/storage";
import type { AssistantAction, Barber, ChatMessage } from "../lib/types";

const GUEST_KEY = "af_guest_key";
const CHAT_KEY = "af_chat_id";

const SUGGESTIONS = [
  "Find me a skin fade today",
  "Best-rated barbers who come to my home",
  "What's your cancellation policy?",
  "Help me with my booking",
];

async function guestKey() {
  let key = await storage.get(GUEST_KEY);
  if (!key) {
    key = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    await storage.set(GUEST_KEY, key);
  }
  return key;
}

/** JB Concierge: Claude-powered help with finding barbers, bookings and support. */
export default function Assistant() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { place } = useLocation();
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scroll = useRef<ScrollView>(null);
  const chatKey = `${CHAT_KEY}_${user?.id ?? "guest"}`;

  // Resume the last conversation on this device.
  useEffect(() => {
    (async () => {
      const id = await storage.get(chatKey);
      if (!id) return;
      try {
        const convo = await api.conversation(id, await guestKey());
        setConversationId(convo.id);
        setMessages(convo.display);
      } catch {
        await storage.remove(chatKey);
      }
    })();
  }, [chatKey]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || sending) return;
    setInput("");
    setError(null);
    setSending(true);
    setMessages((m) => [...m, { role: "user", text: message, at: new Date().toISOString() }]);
    try {
      const res = await api.chat({ conversationId, message, country: place?.countryCode, city: place?.city || undefined }, await guestKey());
      setConversationId(res.conversationId);
      await storage.set(chatKey, res.conversationId);
      setMessages((m) => [...m, { role: "assistant", text: res.reply, actions: res.actions, at: new Date().toISOString() }]);
    } catch (e) {
      setMessages((m) => m.slice(0, -1)); // the turn didn't happen; let them retry
      setInput(message);
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  async function newChat() {
    await storage.remove(chatKey);
    setConversationId(undefined);
    setMessages([]);
    setError(null);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <Stack.Screen
        options={{
          title: "JB Concierge",
          headerRight: () => (messages.length ? <IconButton icon="create-outline" label="New chat" tone="plain" onPress={newChat} /> : null),
        }}
      />
      <ScrollView
        ref={scroll}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={[styles.inner, { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 32 }}>
            <Orb size={132} />
            <T variant="eyebrow" style={{ marginTop: 28 }}>JB Concierge</T>
            <T variant="display" center style={{ marginTop: 8, fontSize: 30, lineHeight: 36 }}>
              {user ? `${user.name.split(" ")[0]}, how` : "How"} can I{"\n"}help today?
            </T>
            <T muted center style={{ marginTop: 10, maxWidth: 360 }}>
              Find a barber anywhere, check free times, sort out a booking — or ask me anything.
            </T>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 22, paddingBottom: 16, paddingHorizontal: 16 }} style={{ alignSelf: "stretch", marginHorizontal: -16 }}>
              {SUGGESTIONS.map((s) => (
                <Pressable key={s} onPress={() => send(s)} accessibilityRole="button" style={({ pressed }) => [styles.card, { width: 150, minHeight: 104, padding: 14 }, pressed && styles.pressed]}>
                  <Ionicons name="sparkles" size={16} color={colors.gold} />
                  <T variant="caption" style={{ marginTop: 10 }}>{s}</T>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {messages.map((m, i) => (m.role === "user" ? <UserBubble key={i} text={m.text} /> : <AssistantBubble key={i} message={m} />))}

        {sending && (
          <Row gap={8} style={{ marginTop: 12 }}>
            <GoldIcon icon="sparkles" size={30} />
            <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: colors.border }}>
              <ActivityIndicator size="small" color={colors.gold} />
            </View>
          </Row>
        )}
        {error && (
          <View style={{ marginTop: 12 }}>
            <ErrorBox message={error} />
            <Button title="Visit the help centre" variant="ghost" size="sm" onPress={() => router.push("/help")} style={{ alignSelf: "flex-start" }} />
          </View>
        )}
      </ScrollView>

      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 12, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 10) }}>
        <Row gap={8} style={{ width: "100%", maxWidth: 760, alignSelf: "center" }}>
          <TextInput
            accessibilityLabel="Message"
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything…"
            placeholderTextColor={colors.faint}
            multiline
            onSubmitEditing={() => send(input)}
            blurOnSubmit={Platform.OS === "web"}
            style={{ flex: 1, minHeight: 46, maxHeight: 120, backgroundColor: colors.surface, borderRadius: 23, paddingHorizontal: 16, paddingTop: 13, paddingBottom: 11, fontSize: 16, fontFamily: fonts.regular, color: colors.text }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send"
            disabled={!input.trim() || sending}
            onPress={() => send(input)}
            style={({ pressed }) => [{ width: 46, height: 46, borderRadius: 23, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center", opacity: !input.trim() || sending ? 0.35 : 1 }, !!input.trim() && !sending && glowSmall, pressed && styles.pressed]}
          >
            <Ionicons name="arrow-up" size={20} color={colors.onGold} />
          </Pressable>
        </Row>
      </View>
    </KeyboardAvoidingView>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <View style={[{ alignSelf: "flex-end", maxWidth: "85%", marginTop: 12, backgroundColor: colors.gold, borderRadius: radius.lg, borderBottomRightRadius: 6, paddingHorizontal: 14, paddingVertical: 10 }, glowSmall]}>
      <T color={colors.onGold}>{text}</T>
    </View>
  );
}

function AssistantBubble({ message }: { message: ChatMessage }) {
  return (
    <View style={{ marginTop: 12, maxWidth: "92%" }}>
      <Row gap={8} style={{ alignItems: "flex-start" }}>
        <GoldIcon icon="sparkles" size={30} />
        <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, borderTopLeftRadius: 6, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: colors.border }}>
          <T>{message.text}</T>
        </View>
      </Row>
      {message.actions?.map((a, i) => <ActionView key={i} action={a} />)}
    </View>
  );
}

function ActionView({ action }: { action: AssistantAction }) {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  useEffect(() => {
    const ids = action.type === "barbers" ? action.barberIds : action.type === "book" ? [action.barberId] : [];
    Promise.all(ids.map((id) => api.barber(id).catch(() => null))).then((list) => setBarbers(list.filter((b): b is Barber & { reviews: never[] } => !!b)));
  }, [action]);

  if (action.type === "barbers") {
    return (
      <Card style={{ marginTop: 8, marginLeft: 38, paddingVertical: 4 }}>
        {barbers.map((b) => <BarberCard key={b.id} barber={b} showCountry />)}
      </Card>
    );
  }
  if (action.type === "book") {
    const b = barbers[0];
    const service = b?.services.find((s) => s.id === action.serviceId);
    return (
      <Card style={{ marginTop: 8, marginLeft: 38, borderColor: colors.gold, borderWidth: 1.5 }}>
        <T variant="small" color={colors.goldDeep} style={{ fontFamily: fonts.semibold }}>READY TO BOOK</T>
        <T variant="strong" style={{ marginTop: 4 }}>{service?.name ?? "Appointment"}{b ? ` with ${b.name}` : ""}</T>
        {b && <T variant="caption" muted>{dateTime(action.startsAt, b.timeZone)} ({b.city} time) · {action.locationType === "home" ? "at your place" : "at the shop"}</T>}
        <Button
          title="Review & book"
          size="md"
          style={{ marginTop: 12, alignSelf: "flex-start" }}
          onPress={() => router.push({ pathname: "/book/[barberId]", params: { barberId: action.barberId, serviceId: action.serviceId, startsAt: action.startsAt, locationType: action.locationType } })}
        />
      </Card>
    );
  }
  return (
    <Card tone="surface" style={{ marginTop: 8, marginLeft: 38 }}>
      <Row gap={8}>
        <Ionicons name="checkmark-circle" size={18} color={colors.gold} />
        <T variant="caption">Support ticket #{action.ticketId.slice(0, 8)} opened — we'll reply by email.</T>
      </Row>
    </Card>
  );
}
