import { router, Slot } from "expo-router";
import { AdminShell } from "../../components/admin";
import { EmptyState, Loading, Screen } from "../../components/ui";
import { useAuth } from "../../lib/auth";

/** The team's admin panel. Only accounts listed in ADMIN_EMAILS get in; the API checks again on every call. */
export default function AdminLayout() {
  const { user, loading } = useAuth();
  if (loading) return <Screen><Loading /></Screen>;
  if (!user?.admin) {
    return (
      <Screen>
        <EmptyState
          icon="lock-closed-outline"
          title="Team only"
          body="The admin panel is for the Always Fresh team. Sign in with your team account."
          action={user ? { label: "Back to the app", onPress: () => router.replace("/") } : { label: "Sign in", onPress: () => router.push("/login") }}
        />
      </Screen>
    );
  }
  return (
    <AdminShell>
      <Slot />
    </AdminShell>
  );
}
