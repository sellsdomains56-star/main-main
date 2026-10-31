import { Redirect } from "expo-router";

/** The centre tab opens Always Fresh Concierge full screen (the tab bar pushes it; this covers deep links). */
export default function ConciergeTab() {
  return <Redirect href="/assistant" />;
}
