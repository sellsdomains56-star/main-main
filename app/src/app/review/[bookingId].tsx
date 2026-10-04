import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Avatar, Button, ErrorBox, Field, H1, Loading, P, Screen, Stars } from "../../components/ui";
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
    <Screen>
      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <Avatar uri={booking.barber.photoUrl} size={80} />
        <H1>How was {booking.barber.name.split(" ")[0]}?</H1>
        <Stars value={rating} size={38} onChange={setRating} />
        <P muted style={{ marginTop: 8 }}>{LABELS[rating]}</P>
      </View>
      <Field label="Tell others about your cut (optional)" value={comment} onChangeText={setComment} multiline placeholder="Clean fade, on time, great vibe…" />
      {error && <ErrorBox message={error} />}
      <Button title="Submit rating" onPress={submit} loading={busy} />
    </Screen>
  );
}
