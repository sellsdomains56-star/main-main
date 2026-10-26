import { Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Switch, View, Platform } from "react-native";
import { HourStepper, WEEK, DAY_NAMES } from "../../components/shopPanel";
import { colors } from "../../components/theme";
import { Button, Card, ErrorBox, IconLine, Loading, Pill, Row, Screen, Section, T, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import { policyLabel, ruleLabel } from "../../lib/rules";
import type { BookingRules, PriceRule } from "../../lib/types";

const FREE_HOURS = [0, 6, 12, 24, 48];
const FEES = [25, 50, 100];
const OFF_PEAK = [10, 15, 20, 25];
const PEAK = [10, 15, 20];

/** Late cancellations, quiet-hour discounts and busy-hour premiums. */
export default function Rules() {
  const [rules, setRules] = useState<BookingRules | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    api.myRules().then(setRules, (e: Error) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  if (!rules) return <Screen>{error ? <ErrorBox message={error} onRetry={load} /> : <Loading />}</Screen>;
  const set = (patch: Partial<BookingRules>) => {
    setSaved(false);
    setRules({ ...rules, ...patch });
  };
  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      setRules(await api.saveMyRules(rules));
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const p = rules.cancelPolicy;

  return (
    <Screen footer={<Button title={saved ? "Saved" : "Save rules"} icon={saved ? "checkmark" : undefined} onPress={save} loading={busy} disabled={saved} />}>
      <Stack.Screen options={{ title: "Booking rules & deals" }} />
      <T variant="title">Booking rules & deals</T>
      <T variant="caption" muted style={{ marginTop: 4 }}>Customers see these on your profile and before they pay.</T>

      <Section title="Late cancellations">
        <T variant="caption" muted style={{ marginBottom: 8 }}>Free to cancel until…</T>
        <Wrap>{FREE_HOURS.map((h) => <Pill key={h} label={h ? `${h} h before` : "Any time"} selected={p.freeHours === h} onPress={() => set({ cancelPolicy: { freeHours: h, lateFeePercent: h ? p.lateFeePercent || 50 : 0 } })} />)}</Wrap>
        {p.freeHours > 0 && (
          <>
            <T variant="caption" muted style={{ marginTop: 14, marginBottom: 8 }}>After that, you keep…</T>
            <Wrap>{FEES.map((f) => <Pill key={f} label={f === 100 ? "The full price" : `${f}%`} selected={p.lateFeePercent === f} onPress={() => set({ cancelPolicy: { ...p, lateFeePercent: f } })} />)}</Wrap>
          </>
        )}
        <Card tone="surface" style={{ marginTop: 14 }}>
          <IconLine icon="information-circle-outline">{policyLabel(p)}. Tips are always refunded. If you cancel, the client always gets everything back.</IconLine>
        </Card>
      </Section>

      <RuleEditor
        title="Off-peak deal"
        help="Fill quiet hours with a discount on the service (not extras or travel)."
        kind="offPeak"
        percents={OFF_PEAK}
        rule={rules.offPeak}
        fallback={{ percent: 15, days: [1, 2, 3], fromHour: 10, toHour: 13 }}
        onChange={(r) => set({ offPeak: r })}
      />
      <RuleEditor
        title="Peak hours"
        help="Charge a little more when everyone wants you (Friday evenings, weekends)."
        kind="peak"
        percents={PEAK}
        rule={rules.peak}
        fallback={{ percent: 10, days: [4, 5], fromHour: 17, toHour: 21 }}
        onChange={(r) => set({ peak: r })}
      />
      {error && <ErrorBox message={error} />}
    </Screen>
  );
}

function RuleEditor({ title, help, kind, percents, rule, fallback, onChange }: { title: string; help: string; kind: "offPeak" | "peak"; percents: number[]; rule: PriceRule | null; fallback: PriceRule; onChange: (r: PriceRule | null) => void }) {
  const on = !!rule;
  return (
    <Section title={title}>
      <Row gap={12}>
        <T variant="caption" muted style={{ flex: 1 }}>{help}</T>
        <Switch
          value={on}
          onValueChange={(v) => onChange(v ? fallback : null)}
          accessibilityLabel={title}
          trackColor={{ true: colors.ink, false: colors.surface }}
          thumbColor={Platform.OS === "android" ? colors.card : undefined}
          {...(Platform.OS === "web" ? ({ activeThumbColor: colors.card } as object) : {})}
        />
      </Row>
      {rule && (
        <View style={{ marginTop: 12 }}>
          <Wrap>{percents.map((x) => <Pill key={x} label={kind === "offPeak" ? `${x}% off` : `+${x}%`} selected={rule.percent === x} onPress={() => onChange({ ...rule, percent: x })} />)}</Wrap>
          <T variant="caption" muted style={{ marginTop: 12, marginBottom: 8 }}>Days</T>
          <Wrap>
            {WEEK.map((d) => (
              <Pill key={d} label={DAY_NAMES[d]!} selected={rule.days.includes(d)} onPress={() => onChange({ ...rule, days: rule.days.includes(d) ? rule.days.filter((x) => x !== d) : [...rule.days, d] })} />
            ))}
          </Wrap>
          <Row gap={10} style={{ marginTop: 12 }}>
            <HourStepper label="From" value={rule.fromHour} min={0} max={rule.toHour - 1} onChange={(v) => onChange({ ...rule, fromHour: v })} />
            <HourStepper label="Until" value={rule.toHour} min={rule.fromHour + 1} max={24} onChange={(v) => onChange({ ...rule, toHour: v })} />
          </Row>
          {rule.days.length > 0 && <T variant="caption" style={{ marginTop: 10 }}>Customers see: {ruleLabel(rule, kind)}</T>}
        </View>
      )}
    </Section>
  );
}
