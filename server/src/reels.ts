import type { Reel } from "./types.js";

// Sample clips (built by scripts/make-demo-media.sh from Unsplash photos). Barbers replace them
// by uploading real videos from the app.
const c = (id: string, name: string, text: string, hoursAgo: number, likes = 0) => ({
  id, userId: `demo-${name}`, name, text, likedBy: Array.from({ length: likes }, (_, i) => `demo-l${i}`),
  createdAt: new Date(Date.UTC(2026, 8, 30, 12) - hoursAgo * 3_600_000).toISOString(),
});

// A few sample comments so the demo doesn't look empty.
const SAMPLE_COMMENTS: Record<string, ReturnType<typeof c>[]> = {
  r1: [c("r1c1", "Leon", "Cleanest blend in Berlin, no debate", 5, 24), c("r1c2", "Amir", "Booked for Saturday 🔥", 20, 6)],
  r4: [c("r4c1", "Kerem", "The hot towel at the end 😮‍💨", 3, 31), c("r4c2", "Jonas", "Need this before my wedding", 30, 9)],
  r6: [c("r6c1", "Tobi", "Waves are crazy. What brush do you use?", 2, 41), c("r6c2", "Dre Clipz", "Medium-soft boar bristle, 20 min a day 🙏", 1, 58), c("r6c3", "Marcus", "South London's finest fr", 12, 7)],
  r10: [c("r10c1", "Rashed", "Came to my villa in Palm Jumeirah, 10/10", 6, 19)],
  r13: [c("r13c1", "Khalid", "Best fade in Downtown, booked again for Thursday", 3, 27), c("r13c2", "Hassan Farouk", "See you Thursday bro 🤝", 2, 12)],
  r14: [c("r14c1", "Majed", "The Marina shop is a vibe on weekends", 8, 15)],
  r15: [c("r15c1", "Noura", "My son actually sat still for once 😂 thank you Ahmed", 5, 44), c("r15c2", "Ali", "Family Saturdays here are the best", 20, 9)],
  r16: [c("r16c1", "Omar", "A shave on a yacht?? Booking this for my wedding", 4, 38), c("r16c2", "Faris Al Zarooni", "Congratulations! Send me the date 🙏", 3, 21)],
};

const demo = (id: string, barberId: string, caption: string, daysAgo: number, likes: number): Reel => ({
  id,
  barberId,
  videoUrl: `/media/demo/${id}.mp4`,
  posterUrl: `/media/demo/${id}.jpg`,
  caption,
  likedBy: Array.from({ length: likes }, (_, i) => `demo-${i}`),
  views: likes * 23 + 410,
  shares: Math.round(likes / 9),
  comments: SAMPLE_COMMENTS[id] ?? [],
  createdAt: new Date(Date.UTC(2026, 8, 30 - daysAgo, 12)).toISOString(),
});

export const DEMO_REELS: Reel[] = [
  demo("r1", "b1", "Zero to skin fade in 25 minutes ✂️ #fade #berlin", 1, 342),
  demo("r2", "b1", "Beard sculpt + hot line-up. Book me, I come to you 🏠", 4, 198),
  demo("r3", "b2", "Textured crop with scissors only. Low maintenance, high style.", 2, 156),
  demo("r4", "b3", "Turkish hot towel shave — the full ritual 🔥", 3, 421),
  demo("r5", "b4", "The modern mullet, done right.", 5, 127),
  demo("r6", "b5", "360 waves check 🌊 Brushing routine in the caption", 1, 512),
  demo("r7", "b5", "Custom hair design — bring your idea", 6, 289),
  demo("r8", "b6", "Classic side part, Jermyn Street style.", 2, 173),
  demo("r9", "b8", "French crop, Amsterdam minimal.", 3, 144),
  demo("r10", "b9", "Luxury shave at a villa in Jumeirah ✨", 2, 377),
  demo("r11", "b10", "Taper + waves in Brooklyn", 1, 265),
  demo("r12", "b11", "Pompadour with volume that lasts all day", 4, 208),
  // Dubai
  demo("r13", "b36", "Skin fade on the Boulevard, Burj in the window ✂️ #dubai #fade", 0, 486),
  demo("r14", "b19", "Saturday at JB’s Fresh Dubai Marina — every chair full 🔥", 1, 391),
  demo("r15", "b38", "First haircut? Ahmed has the patience of a saint 👦", 2, 334),
  demo("r16", "b40", "Hot towel shave on a yacht at Dubai Harbour ⚓", 1, 612),
  demo("r17", "b37", "Blow-dry and finish — boardroom-ready by 9am", 3, 219),
  demo("r18", "b41", "Tools of the trade. Beard line-up next 👀", 2, 247),
];
