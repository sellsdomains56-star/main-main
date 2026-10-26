import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Platform, Share, View } from "react-native";
import { AdminPage, sumText } from "../../components/admin";
import { colors } from "../../components/theme";
import { Button, Card, ErrorBox, IconLine, Loading, Pill, Row, T, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import { saveFile } from "../../lib/saveFile";
import type { AdminFinance } from "../../lib/types";

/** The last six months, newest first, as YYYY-MM. */
const MONTHS = Array.from({ length: 6 }, (_, i) => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1)).toISOString().slice(0, 7);
});
const short = (m: string) => new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${m}-15T00:00:00Z`));

/** A month's money per currency (never converted), VAT in JB's income, and the transactions as CSV for the accountant. */
export default function Finance() {
  const [month, setMonth] = useState(MONTHS[0]!);
  const [f, setF] = useState<AdminFinance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => {
    setF(null);
    api.admin.finance(month).then(setF, (e: Error) => setError(e.message));
  }, [month]);
  useFocusEffect(load);

  const download = async () => {
    setBusy(true);
    try {
      const csv = await api.admin.financeCsv(month);
      if (Platform.OS === "web") await saveFile(`jb-finance-${month}.csv`, csv, "text/csv");
      else await Share.share({ message: csv, title: `jb-finance-${month}.csv` });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminPage title="Finance & VAT" subtitle={f ? `${f.label} · ${f.transactions} transactions` : undefined} actions={<Button title="Download CSV" icon="download-outline" size="sm" variant="secondary" loading={busy} onPress={download} />}>
      <Wrap>{MONTHS.map((m) => <Pill key={m} label={short(m)} selected={m === month} onPress={() => setMonth(m)} />)}</Wrap>
      {error && <ErrorBox message={error} onRetry={load} />}
      {!f ? <Loading /> : (
        <Card style={{ marginTop: 16, padding: 0, overflow: "hidden" }}>
          {f.lines.map((l, i) => (
            <Row key={l.key} style={{ justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border, backgroundColor: l.key === "fees" || l.key === "vat" ? colors.surface : undefined }} gap={12}>
              <T variant={l.key === "fees" ? "strong" : "body"} style={{ flex: 1 }}>{l.label}</T>
              <T variant={l.key === "fees" ? "strong" : "body"}>{sumText(l.amounts)}</T>
            </Row>
          ))}
        </Card>
      )}
      <View style={{ marginTop: 14, gap: 6 }}>
        <IconLine icon="information-circle-outline" muted>Amounts are kept in each currency, never converted. Tips go to barbers in full; JB's income is its fees, products, the Club and gift cards.</IconLine>
        {f && !f.vatRegistered && <IconLine icon="alert-circle-outline" muted>Once JB is VAT-registered in the UAE, set VAT_TRN on the server: receipts become tax invoices and VAT shows here.</IconLine>}
      </View>
    </AdminPage>
  );
}
