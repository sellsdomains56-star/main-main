import { router, Slot } from "expo-router";
import { Pressable, View } from "react-native";
import { PanelShell, type NavItem } from "../../components/admin";
import { colors, fonts, radius } from "../../components/theme";
import { EmptyState, Loading, Screen, T } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import { ROLE_LABEL, ShopPanelProvider, useShopPanel } from "../../lib/shopPanel";
import type { ShopRole } from "../../lib/types";

const NAV: (NavItem & { need: ShopRole })[] = [
  { href: "/shop-panel", label: "Calendar", icon: "calendar-outline", need: "front_desk" },
  { href: "/shop-panel/queue", label: "Walk-in queue", icon: "people-circle-outline", need: "front_desk" },
  { href: "/shop-panel/orders", label: "Orders & stock", icon: "bag-handle-outline", need: "front_desk" },
  { href: "/shop-panel/team", label: "Barbers", icon: "people-outline", need: "manager" },
  { href: "/shop-panel/services", label: "Services & times", icon: "pricetags-outline", need: "manager" },
  { href: "/shop-panel/reports", label: "Reports", icon: "stats-chart-outline", need: "manager" },
  { href: "/shop-panel/payroll", label: "Pay & split", icon: "wallet-outline", need: "manager" },
  { href: "/shop-panel/staff", label: "Staff & roles", icon: "key-outline", need: "owner" },
  { href: "/shop-panel/settings", label: "Shop settings", icon: "settings-outline", need: "manager" },
];

/** The shop panel: for a barbershop's owner, managers and front desk (given access by the Always Fresh team or the owner). The API checks again on every call. */
export default function ShopPanelLayout() {
  const { user, loading } = useAuth();
  if (loading) return <Screen><Loading /></Screen>;
  if (!user?.manages) {
    return (
      <Screen>
        <EmptyState
          icon="storefront-outline"
          title="For barbershops"
          body="The shop panel is for barbershop owners and their staff on Always Fresh. Ask the Always Fresh team, or your shop's owner, to connect your account."
          action={user ? { label: "Back to the app", onPress: () => router.replace("/") } : { label: "Sign in", onPress: () => router.push("/login") }}
        />
      </Screen>
    );
  }
  return (
    <ShopPanelProvider>
      <Shell />
    </ShopPanelProvider>
  );
}

function Shell() {
  const { panel, switchBranch, can } = useShopPanel();
  const branches = panel?.branches ?? [];
  const switcher = branches.length > 1 && panel ? (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {branches.map((b) => {
        const on = b.id === panel.shop.id;
        return (
          <Pressable
            key={b.id}
            onPress={() => !on && switchBranch(b.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`Open ${b.name}`}
            style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: on ? colors.onInk : colors.inkLine, backgroundColor: on ? colors.onInk : "transparent" }}
          >
            <T variant="small" color={on ? colors.ink : colors.onInk} style={{ fontFamily: fonts.semibold }}>{b.name.replace(/^Always Fresh /, "")}</T>
          </Pressable>
        );
      })}
    </View>
  ) : null;
  return (
    <PanelShell
      title={panel?.shop.name ?? "Your barbershop"}
      subtitle={panel ? `Shop panel · ${ROLE_LABEL[panel.role]}` : "Shop panel · Always Fresh"}
      nav={NAV.filter((n) => !panel || can(n.need))}
      extra={switcher}
    >
      <Slot key={panel?.shop.id /* switching branch reloads the page */} />
    </PanelShell>
  );
}
