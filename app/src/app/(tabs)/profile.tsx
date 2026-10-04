import { router } from "expo-router";
import { LocationPicker } from "../../components/LocationPicker";
import { Button, Card, H1, H2, Loading, P, Screen } from "../../components/ui";
import { useAuth } from "../../lib/auth";

export default function Profile() {
  const { user, loading, signOut } = useAuth();
  if (loading) return <Screen><Loading /></Screen>;

  return (
    <Screen>
      {user ? (
        <>
          <H1>Hi, {user.name.split(" ")[0]} 👋</H1>
          <P muted>{user.email}{user.role === "barber" ? " · Barber account" : ""}</P>
          {user.role === "barber" && user.barberId && (
            <Card style={{ marginTop: 14 }} onPress={() => router.push(`/barber/${user.barberId}`)}>
              <P style={{ fontWeight: "700" }}>View my public profile →</P>
              <P muted>See your services, rating and reviews as customers do.</P>
            </Card>
          )}
        </>
      ) : (
        <>
          <H1>Welcome to Always Fresh</H1>
          <P muted style={{ marginBottom: 14 }}>Sign in to book barbers, pay with Apple Pay or Google Pay, and use the AI stylist.</P>
          <Button title="Sign in or create account" onPress={() => router.push("/login")} />
        </>
      )}

      <H2>My location</H2>
      <Card>
        <LocationPicker />
      </Card>

      {!user && (
        <>
          <H2>Are you a barber?</H2>
          <Card onPress={() => router.push("/become-barber")}>
            <P style={{ fontWeight: "700" }}>Join Always Fresh →</P>
            <P muted>Get booked by customers in your city, get paid online, build your rating.</P>
          </Card>
        </>
      )}

      {user && (
        <>
          <H2>Account</H2>
          <Button title="Sign out" variant="secondary" onPress={signOut} />
        </>
      )}
    </Screen>
  );
}
