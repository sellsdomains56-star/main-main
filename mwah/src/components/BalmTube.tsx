// Illustrated lip balm tube, tinted per flavour. Used when a product has no photo yet.
export function BalmTube({ color, color2, className = "", label = "mwah" }: { color: string; color2: string; className?: string; label?: string }) {
  const id = `g${color.replace("#", "")}${color2.replace("#", "")}`;
  return (
    <svg viewBox="0 0 120 260" className={className} role="img" aria-label="Mwah lip balm">
      <defs>
        <linearGradient id={id} x1="0" x2="1"><stop offset="0" stopColor={color2} /><stop offset=".45" stopColor={color} /><stop offset="1" stopColor={color} stopOpacity=".85" /></linearGradient>
      </defs>
      <ellipse cx="60" cy="248" rx="38" ry="7" fill="#2a1320" opacity=".12" />
      <path d="M32 22c0-10 10-16 28-16s28 6 28 16v38H32z" fill="#2a1320" />
      <rect x="30" y="56" width="60" height="10" rx="3" fill="#fff6ee" />
      <path d="M30 66h60v168c0 8-6 12-14 12H44c-8 0-14-4-14-12z" fill={`url(#${id})`} />
      <rect x="40" y="86" width="12" height="130" rx="6" fill="#fff" opacity=".35" />
      <text x="62" y="170" textAnchor="middle" fontFamily="Bricolage Grotesque, system-ui" fontWeight="800" fontSize="24" fill="#fff" transform="rotate(-90 62 170)">{label}</text>
      <path d="M44 22c0-6 6-10 16-10" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".25" fill="none" />
    </svg>
  );
}
