export interface PayButtonProps {
  clientSecret: string;
  currency: string;
  amount: number; // minor units
  amountLabel: string; // formatted, e.g. "£40.00"
  label: string; // what's being paid for, shown on the Apple Pay sheet
  onPaid: () => Promise<void>;
}
