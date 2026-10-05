import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useState } from "react";
import { View } from "react-native";
import { colors, radius } from "../components/theme";
import { Button, EmptyState, IconBadge, ErrorBox, Field, Screen, T } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

/** Barbers post short videos of their cuts; they show up in the Reels feed for their city. */
export default function PostReel() {
  const { user } = useAuth();
  const [video, setVideo] = useState<{ uri: string; mimeType: string } | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const player = useVideoPlayer(video?.uri ?? null, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  if (user?.role !== "barber") {
    return <Screen><EmptyState icon="videocam-outline" title="Reels are for barbers" body="Create a barber profile to post reels of your cuts." action={{ label: "Join as a barber", onPress: () => router.replace("/become-barber") }} /></Screen>;
  }

  async function pick() {
    setError(null);
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["videos"], allowsEditing: true, videoMaxDuration: 60, quality: 1 });
    if (res.canceled || !res.assets[0]) return;
    const asset = res.assets[0];
    if (asset.duration && asset.duration > 61_000) {
      setError("Reels can be up to 60 seconds.");
      return;
    }
    setVideo({ uri: asset.uri, mimeType: asset.mimeType ?? "video/mp4" });
  }

  async function upload() {
    if (!video) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await (await fetch(video.uri)).blob();
      await api.postReel(blob, video.mimeType, caption.trim());
      router.replace({ pathname: "/barber/[id]", params: { id: user!.barberId! } });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen footer={<Button title="Post reel" icon="cloud-upload-outline" onPress={upload} loading={busy} disabled={!video} />}>
      <T variant="title">Show off your work</T>
      <T muted style={{ marginTop: 6 }}>Vertical videos up to 60 seconds work best. Before/after transformations get the most bookings.</T>

      <View style={{ marginTop: 20, alignItems: "center" }}>
        {video ? (
          <View style={{ width: 220, height: 390, borderRadius: radius.lg, overflow: "hidden", backgroundColor: "#000" }}>
            <VideoView player={player} style={{ width: "100%", height: "100%" }} contentFit="cover" nativeControls={false} />
          </View>
        ) : (
          <View style={{ width: "100%", borderWidth: 2, borderStyle: "dashed", borderColor: colors.surfaceStrong, borderRadius: radius.xl, padding: 28, alignItems: "center", backgroundColor: colors.surface }}>
            <IconBadge icon="videocam-outline" size={60} />
            <T variant="strong" style={{ marginTop: 8 }}>Choose a video</T>
          </View>
        )}
        <Button title={video ? "Choose another" : "Choose video"} variant={video ? "ghost" : "primary"} size="md" icon="film-outline" onPress={pick} style={{ marginTop: 12 }} />
      </View>

      <View style={{ marginTop: 20 }}>
        <Field label="Caption" value={caption} onChangeText={setCaption} placeholder="e.g. Skin fade + beard sculpt #fade" maxLength={300} multiline />
      </View>
      {error && <ErrorBox message={error} />}
    </Screen>
  );
}
