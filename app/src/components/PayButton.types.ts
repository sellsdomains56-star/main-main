export interface PayButtonProps {
  clientSecret: string;
  currency: string;
  amountLabel: string;
  onPaid: () => Promise<void>;
}
