import { usePathname } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Image, Modal, Pressable, ScrollView, useWindowDimensions, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HERO_PHOTOS } from "../lib/brandMedia";
import { DEMO_START } from "../lib/config";
import { storage } from "../lib/storage";
import { LogoLockup } from "./Brand";
import { colors, fonts, radius } from "./theme";
import { Button, Row, T } from "./ui";

const KEY = "af_welcomed";

const SLIDES = [
  { photo: HERO_PHOTOS[1]!, title: "The best barbers in the UAE", body: "See their real work, reels and reviews, then book a free time in seconds." },
  { photo: HERO_PHOTOS[0]!, title: "At the shop, or at your door", body: "Home, hotel, office or yacht. Pay with Apple Pay or Google Pay, and every tip goes to your barber." },
  { photo: HERO_PHOTOS[2]!, title: "Stay fresh every month", body: "Join The Club for monthly cuts, try new looks with AI, and get Always Fresh products delivered." },
];

/** Three slides the first time someone opens the app. Not on the team's or a shop's panel. */
export function WelcomeTour() {
  const path = usePathname();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [show, setShow] = useState(false);
  const [page, setPage] = useState(0);
  const scroller = useRef<ScrollView>(null);

  useEffect(() => {
    if (DEMO_START || path.startsWith("/admin") || path.startsWith("/shop-panel")) return;
    storage.get(KEY).then((v) => setShow(!v), () => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const done = () => {
    setShow(false);
    storage.set(KEY, "1").catch(() => {});
  };
  const next = () => {
    if (page >= SLIDES.length - 1) return done();
    scroller.current?.scrollTo({ x: (page + 1) * width, animated: true });
    setPage(page + 1);
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setPage(Math.round(e.nativeEvent.contentOffset.x / Math.max(1, width)));
  if (!show) return null;

  return (
    <Modal visible animationType="fade" onRequestClose={done} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: colors.ink }}>
        <ScrollView ref={scroller} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onScroll} onScroll={onScroll} scrollEventThrottle={64}>
          {SLIDES.map((s) => (
            <View key={s.title} style={{ width, height }}>
              <Image source={s.photo.source} accessibilityLabel={s.photo.label} style={{ position: "absolute", width: "100%", height: "100%" }} resizeMode="cover" />
              <LinearGradient colors={["rgba(11,11,11,0.15)", "rgba(11,11,11,0.25)", "rgba(11,11,11,0.92)"]} locations={[0, 0.45, 0.8]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
              <View style={{ position: "absolute", left: 28, right: 28, bottom: insets.bottom + 150, maxWidth: 520 }}>
                <T variant="display" color="#fff" style={{ fontSize: 38, lineHeight: 42 }}>{s.title}</T>
                <T color="rgba(255,255,255,0.82)" style={{ marginTop: 12, fontSize: 17, lineHeight: 25 }}>{s.body}</T>
              </View>
            </View>
          ))}
        </ScrollView>
        <View pointerEvents="box-none" style={{ position: "absolute", top: insets.top + 14, left: 24, right: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <LogoLockup size={40} color="#fff" muted="rgba(255,255,255,0.7)" est={false} />
          <Pressable onPress={done} accessibilityRole="button" accessibilityLabel="Skip the tour" hitSlop={10} style={{ paddingHorizontal: 14, height: 36, borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.14)", justifyContent: "center" }}>
            <T variant="caption" color="#fff" style={{ fontFamily: fonts.semibold }}>Skip</T>
          </Pressable>
        </View>
        <View style={{ position: "absolute", left: 28, right: 28, bottom: insets.bottom + 34, maxWidth: 520 }}>
          <Row gap={6} style={{ marginBottom: 22 }}>
            {SLIDES.map((s, i) => <View key={s.title} style={{ height: 6, width: i === page ? 22 : 6, borderRadius: 3, backgroundColor: i === page ? "#fff" : "rgba(255,255,255,0.35)" }} />)}
          </Row>
          <Button title={page === SLIDES.length - 1 ? "Get started" : "Next"} onPress={next} variant="light" />
        </View>
      </View>
    </Modal>
  );
}
