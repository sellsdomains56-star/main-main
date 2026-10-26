import { router, Slot } from "expo-router";
import { useEffect, useState } from "react";
import { PanelShell, type NavItem } from "../../components/admin";
import { EmptyState, Loading, Screen } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";

const NAV: NavItem[] = [
  { href: "/shop-panel", label: "Calendar", icon: "calendar-outline" },
  { href: "/shop-panel/team", label: "Barbers", icon: "people-outline" },
  { href: "/shop-panel/services", label: "Services & times", icon: "pricetags-outline" },
  { href: "/shop-panel/reports", label: "Reports", icon: "stats-chart-outline" },
  { href: "/shop-panel/settings", label: "Shop settings", icon: "settings-outline" },
];

/** The shop panel: for a barbershop's owner or manager (given access by the JB team). The API checks again on every call. */
export default function ShopPanelLayout() {
  const { user, loading } = useAuth();
  const [name, setName] = useState("Your barbershop");
  useEffect(() => {
    if (user?.manages) api.manage.panel().then((p) => setName(p.shop.name), () => {});
  }, [user]);
  if (loading) return <Screen><Loading /></Screen>;
  if (!user?.manages) {
    return (
      <Screen>
        <EmptyState
          icon="storefront-outline"
          title="For barbershops"
          body="The shop panel is for barbershop owners and managers on JB Always Fresh. Ask the JB team to connect your account to your shop."
          action={user ? { label: "Back to the app", onPress: () => router.replace("/") } : { label: "Sign in", onPress: () => router.push("/login") }}
        />
      </Screen>
    );
  }
  return (
    <PanelShell title={name} subtitle="Shop panel · JB Always Fresh" nav={NAV}>
      <Slot />
    </PanelShell>
  );
}
