/**
 * Premium SVG robot avatar for ASTRA AI.
 * Dark titanium body, glowing electric-blue eyes, gold accent ring.
 * Enterprise-grade aesthetic — Tesla + Jarvis + Palantir inspired.
 */
export function AstraAvatar({ size = 40 }: { size?: number }) {
  const id = "astra";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        {/* Outer gold ring gradient */}
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Body titanium gradient */}
        <linearGradient id={`${id}-body`} x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E2940" />
          <stop offset="35%" stopColor="#111827" />
          <stop offset="100%" stopColor="#070C18" />
        </linearGradient>

        {/* Face plate gradient */}
        <linearGradient id={`${id}-face`} x1="30" y1="30" x2="70" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1A2540" />
          <stop offset="100%" stopColor="#0D1526" />
        </linearGradient>

        {/* Blue eye glow */}
        <radialGradient id={`${id}-eye-l`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#BFDBFE" />
          <stop offset="35%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </radialGradient>
        <radialGradient id={`${id}-eye-r`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#BFDBFE" />
          <stop offset="35%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </radialGradient>

        {/* Eye outer glow filter */}
        <filter id={`${id}-eye-glow`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Outer ring glow */}
        <filter id={`${id}-ring-glow`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Body subtle inner glow */}
        <filter id={`${id}-body-glow`} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
          <feFlood floodColor="#3B82F6" floodOpacity="0.15" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Clip for circle */}
        <clipPath id={`${id}-clip`}>
          <circle cx="50" cy="50" r="47" />
        </clipPath>
      </defs>

      {/* ── OUTER GOLD RING ── */}
      <circle cx="50" cy="50" r="49" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="2.5" filter={`url(#${id}-ring-glow)`} />
      <circle cx="50" cy="50" r="47" fill="none" stroke="#F59E0B" strokeWidth="0.4" opacity="0.4" />

      {/* ── BACKGROUND ── */}
      <circle cx="50" cy="50" r="46" fill={`url(#${id}-body)`} clipPath={`url(#${id}-clip)`} />

      {/* Subtle blue inner rim */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="#3B82F6" strokeWidth="0.6" opacity="0.18" />

      {/* ── HEAD SHELL ── */}
      {/* Dome top */}
      <path d="M28 52 Q28 22 50 20 Q72 22 72 52" fill={`url(#${id}-body)`} stroke="#243050" strokeWidth="0.8" />

      {/* Face plate recess */}
      <rect x="30" y="36" width="40" height="30" rx="7" fill={`url(#${id}-face)`} stroke="#1E2D4A" strokeWidth="0.8" />

      {/* Face plate inner border glow */}
      <rect x="30" y="36" width="40" height="30" rx="7" fill="none" stroke="#3B82F6" strokeWidth="0.5" opacity="0.3" />

      {/* ── VISOR BAND ── */}
      <rect x="30" y="41" width="40" height="14" rx="4" fill="#0A1428" stroke="#1A2845" strokeWidth="0.6" />
      {/* Visor reflection streak */}
      <rect x="32" y="42.5" width="18" height="1.5" rx="0.75" fill="white" opacity="0.06" />

      {/* ── EYES ── */}
      {/* Left eye glow halo */}
      <ellipse cx="39" cy="48" rx="5.5" ry="4" fill="#3B82F6" opacity="0.18" filter={`url(#${id}-eye-glow)`} />
      {/* Right eye glow halo */}
      <ellipse cx="61" cy="48" rx="5.5" ry="4" fill="#3B82F6" opacity="0.18" filter={`url(#${id}-eye-glow)`} />

      {/* Left eye iris */}
      <ellipse cx="39" cy="48" rx="4" ry="3" fill={`url(#${id}-eye-l)`} filter={`url(#${id}-eye-glow)`} />
      {/* Right eye iris */}
      <ellipse cx="61" cy="48" rx="4" ry="3" fill={`url(#${id}-eye-r)`} filter={`url(#${id}-eye-glow)`} />

      {/* Eye specular highlight */}
      <ellipse cx="37.8" cy="47" rx="1.2" ry="0.9" fill="white" opacity="0.65" />
      <ellipse cx="59.8" cy="47" rx="1.2" ry="0.9" fill="white" opacity="0.65" />

      {/* Eye pupil dot */}
      <circle cx="39.2" cy="48.2" r="1.2" fill="#1D4ED8" />
      <circle cx="61.2" cy="48.2" r="1.2" fill="#1D4ED8" />

      {/* ── NOSE BRIDGE ── */}
      <rect x="48.5" y="53" width="3" height="1" rx="0.5" fill="#3B82F6" opacity="0.35" />

      {/* ── CHIN / LOWER FACE ── */}
      <path d="M33 66 Q33 76 50 78 Q67 76 67 66 L67 64 Q67 70 50 72 Q33 70 33 64 Z" fill="#0E1829" stroke="#1A2640" strokeWidth="0.7" />

      {/* Chin speaker grill lines */}
      <line x1="43" y1="69" x2="57" y2="69" stroke="#3B82F6" strokeWidth="0.5" opacity="0.25" />
      <line x1="44" y1="71" x2="56" y2="71" stroke="#3B82F6" strokeWidth="0.5" opacity="0.2" />
      <line x1="45" y1="73" x2="55" y2="73" stroke="#3B82F6" strokeWidth="0.5" opacity="0.15" />

      {/* ── TEMPLE DETAILS ── */}
      {/* Left temple plate */}
      <rect x="24" y="42" width="7" height="14" rx="2" fill="#0E1829" stroke="#1A2845" strokeWidth="0.6" />
      <line x1="26" y1="46" x2="30" y2="46" stroke="#F59E0B" strokeWidth="0.6" opacity="0.5" />
      <line x1="26" y1="48.5" x2="30" y2="48.5" stroke="#F59E0B" strokeWidth="0.4" opacity="0.3" />
      <line x1="26" y1="51" x2="30" y2="51" stroke="#F59E0B" strokeWidth="0.4" opacity="0.3" />

      {/* Right temple plate */}
      <rect x="69" y="42" width="7" height="14" rx="2" fill="#0E1829" stroke="#1A2845" strokeWidth="0.6" />
      <line x1="70" y1="46" x2="74" y2="46" stroke="#F59E0B" strokeWidth="0.6" opacity="0.5" />
      <line x1="70" y1="48.5" x2="74" y2="48.5" stroke="#F59E0B" strokeWidth="0.4" opacity="0.3" />
      <line x1="70" y1="51" x2="74" y2="51" stroke="#F59E0B" strokeWidth="0.4" opacity="0.3" />

      {/* ── CROWN DETAIL ── */}
      {/* Gold crown accent line */}
      <path d="M36 26 Q50 22 64 26" stroke={`url(#${id}-gold)`} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.8" />

      {/* Crown indicator lights */}
      <circle cx="42" cy="25" r="1.2" fill="#F59E0B" opacity="0.7" />
      <circle cx="50" cy="22.5" r="1.5" fill="#3B82F6" opacity="0.9" filter={`url(#${id}-eye-glow)`} />
      <circle cx="58" cy="25" r="1.2" fill="#F59E0B" opacity="0.7" />

      {/* ── BOTTOM NECK COLLAR ── */}
      <path d="M38 77 Q38 84 50 85 Q62 84 62 77" fill="#0B1525" stroke="#1A2540" strokeWidth="0.7" />
      {/* Gold collar accent */}
      <path d="M40 79 Q50 83 60 79" stroke={`url(#${id}-gold)`} strokeWidth="0.8" fill="none" opacity="0.5" />

      {/* ── SUBTLE SCANLINE OVERLAY ── */}
      <rect x="4" y="4" width="92" height="92" rx="46" fill="url(#scan)" opacity="0.03" />

      {/* Central blue status dot */}
      <circle cx="50" cy="48" r="0.8" fill="#60A5FA" opacity="0" />
    </svg>
  );
}
