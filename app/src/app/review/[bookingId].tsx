import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Pressable } from "react-native";
import { colors, radius } from "../../components/theme";
import { Avatar, Button, ErrorBox, Field, IconLine, Loading, Photo, Pill, Row, Screen, StarsInput, T, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import { money } from "../../lib/format";
import { tipChoices } from "../../lib/menu";
import { pickAndUploadImage } from "../../lib/upload";
import type { Booking } from "../../lib/types";

const LABELS = ["", "Not great", "Okay", "Good", "Great", "Fresh to death"];

export default function ReviewScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [tip, setTip] = useState(0); // minor units; 0 = no tip
  const [photo, setPhoto] = useState<string | null>(null); // the customer's own photo of the cut
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.booking(bookingId).then(setBooking, (e: Error) => setError(e.message));
  }, [bookingId]);

  if (!booking) return <Screen>{error ? <ErrorBox message={error} /> : <Loading />}</Screen>;

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await api.review(bookingId, rating, comment, photo ?? undefined);
      if (tip > 0) {
        // The tip is paid on its own (Apple Pay / Google Pay); all of it goes to the barber.
        const { purchase } = await api.tip(bookingId, tip);
        router.replace({ pathname: "/checkout/[purchaseId]", params: { purchaseId: purchase.id } });
      } else router.back();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen footer={<Button title={tip > 0 ? `Submit and tip ${money(tip, booking.currency)}` : "Submit rating"} onPress={submit} loading={busy} />}>
      <View style={{ alignItems: "center", marginTop: 12, marginBottom: 24 }}>
        <Avatar uri={booking.barber.photoUrl} name={booking.barber.name} size={84} />
        <T variant="title" center style={{ marginTop: 14 }}>How was your cut with {booking.barber.name.split(" ")[0]}?</T>
        <View style={{ marginTop: 18 }}><StarsInput value={rating} onChange={setRating} /></View>
        <T variant="strong" muted style={{ marginTop: 10 }}>{LABELS[rating]}</T>
      </View>
      <Field label="Tell others about it (optional)" value={comment} onChangeText={setComment} multiline placeholder="Clean fade, on time, great vibe…" />
      <View style={{ marginBottom: 18 }}>
        <T variant="strong">Add a photo of your cut (optional)</T>
        <T variant="caption" muted style={{ marginBottom: 10 }}>Shown with your review on {booking.barber.name.split(" ")[0]}'s profile.</T>
        {photo ? (
          <Row gap={12}>
            <Photo uri={photo} name="Your cut" style={{ width: 88, height: 88 }} />
            <Button title="Remove" size="sm" variant="ghost" onPress={() => setPhoto(null)} />
          </Row>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add a photo of your cut"
            disabled={uploading}
            onPress={async () => {
              setUploading(true);
              try {
                setPhoto(await pickAndUploadImage({ square: true }));
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setUploading(false);
              }
            }}
            style={{ width: 88, height: 88, borderRadius: radius.md, borderWidth: 1, borderStyle: "dashed", borderColor: colors.border, alignItems: "center", justifyContent: "center" }}
          >
            {uploading ? <Loading /> : <IconLine icon="camera-outline" muted>Add</IconLine>}
          </Pressable>
        )}
      </View>
      {!booking.tip && (
        <View style={{ marginBottom: 16 }}>
          <T variant="strong">Leave a tip for {booking.barber.name.split(" ")[0]}?</T>
          <T variant="caption" muted style={{ marginBottom: 10 }}>Optional · 100% goes to your barber</T>
          <Wrap gap={8}>
            <Pill label="No tip" selected={tip === 0} onPress={() => setTip(0)} />
            {tipChoices((booking.service?.price ?? booking.amount) + (booking.extras ?? []).reduce((t, x) => t + x.price, 0)).map((c) => (
              <Pill key={c.percent} label={`${c.percent}% · ${money(c.amount, booking.currency)}`} selected={tip === c.amount} onPress={() => setTip(c.amount)} />
            ))}
          </Wrap>
        </View>
      )}
      {error && <ErrorBox message={error} />}
    </Screen>
  );
}
