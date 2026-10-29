export const fmt = (n: number) =>
  `AED ${n.toLocaleString("en-AE", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
export const r2 = (n: number) => Math.round(n * 100) / 100;
