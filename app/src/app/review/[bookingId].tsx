import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Avatar, Button, ErrorBox, Field, Loading, Screen, StarsInput, T } from "../../components/ui";
import { api } from "../../lib/api";
import type { Booking } from "../../lib/types";

const LABELS = ["", "Not great", "Okay", "Good", "Great", "Fresh to death 🔥"];

export default function ReviewScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
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
      await api.review(bookingId, rating, comment);
      router.back();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen footer={<Button title="Submit rating" onPress={submit} loading={busy} />}>
      <View style={{ alignItems: "center", marginTop: 12, marginBottom: 24 }}>
        <Avatar uri={booking.barber.photoUrl} name={booking.barber.name} size={84} />
        <T variant="title" center style={{ marginTop: 14 }}>How was your cut with {booking.barber.name.split(" ")[0]}?</T>
        <View style={{ marginTop: 18 }}><StarsInput value={rating} onChange={setRating} /></View>
        <T variant="strong" muted style={{ marginTop: 10 }}>{LABELS[rating]}</T>
      </View>
      <Field label="Tell others about it (optional)" value={comment} onChangeText={setComment} multiline placeholder="Clean fade, on time, great vibe…" />
      {error && <ErrorBox message={error} />}
    </Screen>
  );
}
