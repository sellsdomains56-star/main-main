import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { AdminPage, BookingTable, shortDateTime, Toolbar } from "../../components/admin";
import { colors, radius } from "../../components/theme";
import { Button, ErrorBox, Field, Loading, Row, T } from "../../components/ui";
import { api } from "../../lib/api";
import { money } from "../../lib/format";
import type { AdminBookingRow } from "../../lib/types";

type Filter = "upcoming" | "completed" | "cancelled" | "pending_payment" | "all";

/** Every booking on the platform; the team can cancel one with a full refund. */
export default function Bookings() {
  const [status, setStatus] = useState<Filter>("upcoming");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<AdminBookingRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<AdminBookingRow | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.admin.bookings({ status, q }).then(setRows, (e: Error) => setError(e.message));
  }, [status, q]);
  useFocusEffect(load);

  const confirm = async () => {
    if (!cancelling) return;
    setBusy(true);
    setError(null);
    try {
      await api.admin.cancelBooking(cancelling.id, reason.trim());
      setCancelling(null);
      setReason("");
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminPage title="Bookings" subtitle="Search by customer, barber, email or booking number. Cancelling refunds the customer in full and tells both sides.">
      <Toolbar
        q={q}
        onQ={setQ}
        placeholder="Search bookings"
        filter={{ value: status, onChange: setStatus, options: [{ value: "upcoming", label: "Upcoming" }, { value: "completed", label: "Done" }, { value: "cancelled", label: "Cancelled" }, { value: "pending_payment", label: "Unpaid" }, { value: "all", label: "All" }] }}
      />
      {error && <ErrorBox message={error} />}
      {!rows ? (
        <Loading />
      ) : (
        <BookingTable
          rows={rows}
          action={(r) => (["confirmed", "on_the_way", "pending_payment"].includes(r.status) ? <Button title="Cancel" size="sm" variant="secondary" onPress={() => setCancelling(r)} /> : null)}
        />
      )}
      {rows && rows.length >= 300 && <T variant="caption" muted style={{ marginTop: 10 }}>Showing the latest 300 — search to narrow down.</T>}

      <Modal visible={!!cancelling} transparent animationType="fade" onRequestClose={() => setCancelling(null)}>
        <Pressable onPress={() => setCancelling(null)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <Pressable onPress={() => {}} style={{ width: "100%", maxWidth: 440, backgroundColor: colors.card, borderRadius: radius.lg, padding: 22 }}>
            {cancelling && (
              <>
                <T variant="title" style={{ fontSize: 20 }}>Cancel this booking?</T>
                <T muted style={{ marginTop: 6 }}>
                  {cancelling.customer?.name} with {cancelling.barber?.name}, {shortDateTime(cancelling.startsAt)}. {cancelling.status === "pending_payment" ? "Nothing was paid yet." : cancelling.coveredBy ? "The Club cut goes back to their membership." : `${money(cancelling.amount, cancelling.currency)} goes back to their card.`}
                </T>
                <Field label="Reason (both sides see it)" value={reason} onChangeText={setReason} placeholder="e.g. Barber unwell" maxLength={300} style={{ marginTop: 16 }} />
                <Row gap={10} style={{ marginTop: 4 }}>
                  <Button title="Keep it" variant="secondary" size="md" onPress={() => setCancelling(null)} style={{ flex: 1 }} />
                  <Button title="Cancel & refund" variant="danger" size="md" loading={busy} onPress={confirm} style={{ flex: 1.3 }} />
                </Row>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
      <View />
    </AdminPage>
  );
}
