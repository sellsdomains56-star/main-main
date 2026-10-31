import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { colors } from "../../components/theme";
import { Button, Card, Divider, ErrorBox, Loading, Row, Screen, SummaryLine, T } from "../../components/ui";
import { api } from "../../lib/api";
import { money } from "../../lib/format";
import type { Invoice } from "../../lib/types";

/** A receipt (or UAE tax invoice once Always Fresh is VAT-registered) for a paid booking. Printable on the website. */
export default function InvoiceScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [inv, setInv] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api.invoice(bookingId).then(setInv, (e: Error) => setError(e.message));
  }, [bookingId]);
  if (!inv) return <Screen>{error ? <ErrorBox message={error} /> : <Loading />}</Screen>;
  const date = (iso: string) => new Intl.DateTimeFormat(undefined, { day: "numeric", month: "long", year: "numeric", timeZone: inv.timeZone }).format(new Date(iso));
  const m = (n: number) => money(n, inv.currency);

  return (
    <Screen footer={Platform.OS === "web" ? <Button title="Print or save as PDF" icon="print-outline" variant="secondary" onPress={() => window.print()} /> : undefined}>
      <Stack.Screen options={{ title: inv.title }} />
      <Card style={{ padding: 22 }}>
        <Row style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <T variant="eyebrow" muted>{inv.title}</T>
            <T variant="title" style={{ marginTop: 4 }}>{inv.number}</T>
          </View>
          <T variant="strong">{m(inv.total)}</T>
        </Row>
        <View style={{ marginTop: 16, gap: 2 }}>
          <T variant="strong">{inv.seller.name}</T>
          <T variant="caption" muted>{inv.seller.address}</T>
          {inv.seller.trn && <T variant="caption" muted>TRN {inv.seller.trn}</T>}
          <T variant="caption" muted>Service by {inv.seller.onBehalfOf}</T>
        </View>
        <View style={{ marginTop: 14, gap: 2 }}>
          <T variant="small" muted>Billed to</T>
          <T variant="caption">{inv.customer.name}{inv.customer.email ? ` · ${inv.customer.email}` : ""}</T>
          <T variant="small" muted style={{ marginTop: 6 }}>Issued {date(inv.issuedAt)} · appointment {date(inv.serviceDate)}</T>
        </View>
        <Divider style={{ marginVertical: 16 }} />
        {inv.lines.map((l) => <SummaryLine key={l.description} label={l.description} value={m(l.amount)} />)}
        {inv.discounts.map((d) => <SummaryLine key={d.description} label={d.description} value={`− ${m(d.amount)}`} />)}
        <Divider style={{ marginVertical: 12 }} />
        <SummaryLine label="Total paid" value={m(inv.total)} strong />
        {inv.vat && <SummaryLine label={`Includes VAT (${inv.vat.percent}%)`} value={m(inv.vat.amount)} />}
        {inv.tip > 0 && <SummaryLine label="Tip (all to your barber, no VAT)" value={m(inv.tip)} />}
        {!!inv.note && <T variant="small" color={colors.muted} style={{ marginTop: 12 }}>{inv.note}</T>}
      </Card>
    </Screen>
  );
}
