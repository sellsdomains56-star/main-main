import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { Reel, ReelComment } from "../lib/types";
import { compact } from "./ReelThumb";
import { fonts, radius } from "./theme";
import { Avatar, Row, T } from "./ui";

const SHEET = "#141414";
const LINE = "rgba(255,255,255,0.1)";
const MUTED = "rgba(255,255,255,0.55)";

/** Dark bottom sheet, like Instagram's comment and ⋯ sheets. */
export function Sheet({ visible, onClose, title, children, tall }: { visible: boolean; onClose: () => void; title?: string; children: ReactNode; tall?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }} onPress={onClose} accessibilityLabel="Close" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={{ backgroundColor: SHEET, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingBottom: insets.bottom + 8, maxHeight: tall ? "78%" : undefined, height: tall ? 560 : undefined, width: "100%", maxWidth: 640, alignSelf: "center" }}>
          <View style={{ alignItems: "center", paddingTop: 10 }}>
            <View style={{ width: 38, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.3)" }} />
          </View>
          {title && (
            <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: LINE }}>
              <T variant="strong" color="#fff" center style={{ fontFamily: fonts.semibold }}>{title}</T>
            </View>
          )}
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const ago = (iso: string) => {
  const m = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 60_000));
  if (m < 60) return `${m}m`;
  if (m < 60 * 24) return `${Math.round(m / 60)}h`;
  if (m < 60 * 24 * 7) return `${Math.round(m / 1440)}d`;
  return `${Math.round(m / 10080)}w`;
};

/** Comments: newest first, like a comment, delete your own, write one. */
export function CommentsSheet({ reel, visible, onClose, onCount }: { reel: Reel; visible: boolean; onClose: () => void; onCount: (n: number) => void }) {
  const { user } = useAuth();
  const [list, setList] = useState<ReelComment[] | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setList(null);
    api.reelComments(reel.id).then(setList, (e: Error) => setError(e.message));
  }, [visible, reel.id]);

  async function post() {
    if (!user) {
      onClose();
      router.push("/login");
      return;
    }
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const c = await api.addReelComment(reel.id, text.trim());
      setList((l) => [c, ...(l ?? [])]);
      onCount((list?.length ?? 0) + 1);
      setText("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function like(c: ReelComment) {
    if (!user) return router.push("/login");
    setList((l) => l?.map((x) => (x.id === c.id ? { ...x, likedByMe: !x.likedByMe, likes: x.likes + (x.likedByMe ? -1 : 1) } : x)) ?? null);
    api.likeReelComment(reel.id, c.id).catch(() => {});
  }

  async function remove(c: ReelComment) {
    setList((l) => l?.filter((x) => x.id !== c.id) ?? null);
    onCount(Math.max(0, (list?.length ?? 1) - 1));
    api.deleteReelComment(reel.id, c.id).catch(() => {});
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Comments" tall>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 18 }} keyboardShouldPersistTaps="handled">
        {!list && !error && <ActivityIndicator color="#fff" />}
        {list?.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <T variant="heading" color="#fff">No comments yet</T>
            <T variant="caption" color={MUTED} style={{ marginTop: 4 }}>Start the conversation.</T>
          </View>
        )}
        {list?.map((c) => (
          <Row key={c.id} gap={12} style={{ alignItems: "flex-start" }}>
            <Avatar name={c.name} size={34} />
            <View style={{ flex: 1 }}>
              <Row gap={6}>
                <T variant="caption" color="#fff" style={{ fontFamily: fonts.semibold }}>{c.name}</T>
                <T variant="small" color={MUTED}>{ago(c.createdAt)}</T>
              </Row>
              <T color="#fff" style={{ marginTop: 2 }}>{c.text}</T>
              {c.mine && (
                <Pressable onPress={() => remove(c)} hitSlop={6} accessibilityLabel="Delete comment">
                  <T variant="small" color={MUTED} style={{ marginTop: 4 }}>Delete</T>
                </Pressable>
              )}
            </View>
            <Pressable onPress={() => like(c)} hitSlop={8} accessibilityLabel={c.likedByMe ? "Unlike comment" : "Like comment"} style={{ alignItems: "center", paddingTop: 2 }}>
              <Ionicons name={c.likedByMe ? "heart" : "heart-outline"} size={16} color={c.likedByMe ? "#FF3B5C" : MUTED} />
              {c.likes > 0 && <T variant="small" color={MUTED}>{compact(c.likes)}</T>}
            </Pressable>
          </Row>
        ))}
        {error && <T variant="caption" color="#FF8A8A">{error}</T>}
      </ScrollView>
      <Row gap={10} style={{ paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: LINE }}>
        <Avatar name={user?.name ?? "You"} size={34} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={user ? `Add a comment for ${reel.barber.name.split(" ")[0]}…` : "Sign in to comment"}
          placeholderTextColor={MUTED}
          accessibilityLabel="Add a comment"
          onSubmitEditing={post}
          maxLength={500}
          style={{ flex: 1, color: "#fff", fontFamily: fonts.regular, fontSize: 15, height: 42, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: LINE }}
        />
        <Pressable onPress={post} disabled={busy} accessibilityRole="button" accessibilityLabel="Post comment" hitSlop={6}>
          {busy ? <ActivityIndicator color="#fff" /> : <T variant="strong" color={text.trim() ? "#fff" : MUTED} style={{ fontFamily: fonts.semibold }}>Post</T>}
        </Pressable>
      </Row>
    </Sheet>
  );
}

const REASONS = ["It's spam", "Nudity or sexual content", "Hate speech or symbols", "Violence or dangerous acts", "Scam or fraud", "Something else"];

/** The ⋯ menu: save, copy link, barber, book, not interested, report. */
export function MoreSheet({
  reel,
  visible,
  onClose,
  onSave,
  onCopyLink,
  onHide,
  onReported,
}: {
  reel: Reel;
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  onCopyLink: () => void;
  onHide: () => void;
  onReported: () => void;
}) {
  const { user } = useAuth();
  const [reporting, setReporting] = useState(false);
  useEffect(() => {
    if (!visible) setReporting(false);
  }, [visible]);
  const first = reel.barber.name.split(" ")[0];
  const go = (fn: () => void) => () => {
    onClose();
    fn();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={reporting ? "Why are you reporting this reel?" : undefined}>
      {reporting ? (
        <View style={{ paddingVertical: 6 }}>
          {REASONS.map((r) => (
            <Item
              key={r}
              label={r}
              onPress={go(() => {
                api.reportReel(reel.id, r).catch(() => {});
                onReported();
              })}
            />
          ))}
        </View>
      ) : (
        <View style={{ paddingTop: 8 }}>
          <Row gap={10} style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
            <Tile icon={reel.savedByMe ? "bookmark" : "bookmark-outline"} label={reel.savedByMe ? "Saved" : "Save"} onPress={go(onSave)} />
            <Tile icon="link-outline" label="Copy link" onPress={go(onCopyLink)} />
            <Tile icon="calendar-outline" label={`Book ${first}`} onPress={go(() => router.push({ pathname: "/book/[barberId]", params: { barberId: reel.barber.id } }))} />
          </Row>
          <View style={{ borderTopWidth: 1, borderTopColor: LINE }}>
            <Item icon="person-circle-outline" label={`About ${reel.barber.name}`} onPress={go(() => router.push({ pathname: "/barber/[id]", params: { id: reel.barber.id } }))} />
            <Item icon="eye-off-outline" label="Not interested" onPress={go(onHide)} />
            <Item icon="alert-circle-outline" label="Report" danger onPress={() => (user ? setReporting(true) : go(() => router.push("/login"))())} />
          </View>
        </View>
      )}
    </Sheet>
  );
}

function Tile({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => ({ flex: 1, alignItems: "center", gap: 8, paddingVertical: 14, borderRadius: radius.lg, backgroundColor: pressed ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)" })}>
      <Ionicons name={icon} size={22} color="#fff" />
      <T variant="small" color="#fff" numberOfLines={1}>{label}</T>
    </Pressable>
  );
}

function Item({ icon, label, onPress, danger }: { icon?: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; danger?: boolean }) {
  const color = danger ? "#FF5A5F" : "#fff";
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingVertical: 15, backgroundColor: pressed ? "rgba(255,255,255,0.06)" : "transparent" })}>
      {icon && <Ionicons name={icon} size={22} color={color} />}
      <T color={color}>{label}</T>
    </Pressable>
  );
}
