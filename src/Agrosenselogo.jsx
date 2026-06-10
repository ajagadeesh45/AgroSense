// ═══════════════════════════════════════════════
//  AgroSense — SVG Logo Component
//  Indian Farmer carrying Traditional Wooden Plough
// ═══════════════════════════════════════════════

export default function AgroSenseLogo({ size = 48, showText = true, light = false }) {
  const textColor = light ? "#ffffff" : "#052e16";
  const subColor  = light ? "rgba(255,255,255,0.7)" : "#0f766e";

  return (
    <div style={{ display:"flex", alignItems:"center", gap: size * 0.25 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="bgG" cx="50%" cy="40%" r="55%">
            <stop offset="0%"   stopColor="#16a34a"/>
            <stop offset="100%" stopColor="#052e16"/>
          </radialGradient>
          {/* Skin */}
          <linearGradient id="skinG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#d4956a"/>
            <stop offset="100%" stopColor="#b5723a"/>
          </linearGradient>
          {/* Turban red */}
          <linearGradient id="turbanG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#ef4444"/>
            <stop offset="100%" stopColor="#991b1b"/>
          </linearGradient>
          {/* White clothes */}
          <linearGradient id="clothG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#f8fafc"/>
            <stop offset="100%" stopColor="#e2e8f0"/>
          </linearGradient>
          {/* Wooden plough */}
          <linearGradient id="woodG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#d97706"/>
            <stop offset="50%"  stopColor="#b45309"/>
            <stop offset="100%" stopColor="#92400e"/>
          </linearGradient>
          <linearGradient id="woodLightG" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#b45309"/>
            <stop offset="100%" stopColor="#fbbf24"/>
          </linearGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* ── Circular background ── */}
        <circle cx="50" cy="50" r="48" fill="url(#bgG)"/>
        <circle cx="50" cy="50" r="48" fill="none"
          stroke="rgba(20,184,166,0.45)" strokeWidth="1.5"/>
        {/* Inner ring */}
        <circle cx="50" cy="50" r="44" fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>

        {/* ══════════════════════════════════════
            WOODEN TRADITIONAL PLOUGH
            (carried diagonally on left shoulder,
             tip pointing upper-right)
        ══════════════════════════════════════ */}

        {/* Long main beam — diagonal from lower-left to upper-right */}
        <rect x="18" y="22" width="62" height="5" rx="2.5"
          fill="url(#woodG)"
          transform="rotate(-30 18 22)"
          filter="url(#softShadow)"/>
        {/* Beam top highlight */}
        <rect x="18" y="22" width="62" height="1.5" rx="0.75"
          fill="rgba(251,191,36,0.5)"
          transform="rotate(-30 18 22)"/>

        {/* Vertical share/body piece (the upright part) */}
        {/* From lower beam junction going up at slight angle */}
        <path d="M33 62 L28 36 L35 34 L38 60 Z"
          fill="url(#woodG)" filter="url(#softShadow)"/>
        {/* Vertical piece highlight */}
        <path d="M29 37 L32 61" stroke="rgba(251,191,36,0.4)"
          strokeWidth="1.2" strokeLinecap="round"/>

        {/* Pointed plough share / blade at bottom */}
        <path d="M33 62 L38 60 L36 72 Z"
          fill="url(#woodLightG)" filter="url(#softShadow)"/>
        <path d="M33 62 L36 72" stroke="#92400e" strokeWidth="0.5"/>

        {/* Crossbar peg (horizontal pin through vertical body) */}
        <rect x="26" y="50" width="14" height="3.5" rx="1.75"
          fill="url(#woodLightG)"/>
        {/* Peg ends (knobs) */}
        <circle cx="26.5" cy="51.75" r="2.5" fill="#b45309"/>
        <circle cx="39.5" cy="51.75" r="2.5" fill="#b45309"/>

        {/* Small round peg higher up */}
        <circle cx="32" cy="42" r="2" fill="#b45309"/>

        {/* ══════════════════════════════════════
            FARMER BODY
        ══════════════════════════════════════ */}

        {/* Dhoti / baggy pants */}
        <path d="M38 72 Q36 82 33 94 Q36 96 40 95 Q42 87 44 79
                 Q46 87 47 95 Q51 96 54 95 Q52 82 50 72 Z"
          fill="url(#clothG)"/>
        {/* Dhoti shadow fold */}
        <path d="M38 75 Q41 80 44 79 Q47 80 50 75"
          stroke="rgba(148,163,184,0.5)" strokeWidth="1" fill="none"/>

        {/* Torso / white kurta */}
        <path d="M34 50 Q32 58 33 72 L50 72 Q51 58 52 50 Z"
          fill="url(#clothG)" filter="url(#softShadow)"/>
        {/* V-neck detail */}
        <path d="M39 50 L43 57 L47 50"
          stroke="rgba(148,163,184,0.6)" strokeWidth="1" fill="none"
          strokeLinecap="round" strokeLinejoin="round"/>
        {/* Shirt fold lines */}
        <path d="M36 57 Q41 59 46 57" stroke="rgba(148,163,184,0.3)"
          strokeWidth="0.8" fill="none"/>
        <path d="M35 63 Q41 65 47 63" stroke="rgba(148,163,184,0.3)"
          strokeWidth="0.8" fill="none"/>

        {/* Left arm (raised — holding plough on shoulder) */}
        <path d="M34 52 Q30 46 28 40 Q27 38 30 37"
          stroke="url(#skinG)" strokeWidth="6" strokeLinecap="round" fill="none"/>
        {/* Left hand gripping plough */}
        <circle cx="30" cy="37" r="4" fill="url(#skinG)"/>
        {/* Finger lines */}
        <path d="M28 35 Q30 33 32 35" stroke="#b5723a" strokeWidth="0.8"
          strokeLinecap="round" fill="none"/>

        {/* Right arm (hanging relaxed at side) */}
        <path d="M50 52 Q53 60 54 68"
          stroke="url(#skinG)" strokeWidth="6" strokeLinecap="round" fill="none"/>
        {/* Right hand */}
        <circle cx="54" cy="68" r="3.5" fill="url(#skinG)"/>

        {/* Neck */}
        <rect x="41" y="44" width="6" height="8" rx="3"
          fill="url(#skinG)"/>

        {/* ══════════════════════════════════════
            HEAD & FACE
        ══════════════════════════════════════ */}

        {/* Head */}
        <circle cx="44" cy="36" r="11" fill="url(#skinG)"
          filter="url(#softShadow)"/>

        {/* ── Red Turban (Pagdi) ── */}
        {/* Main turban wrap — dome shape on top */}
        <path d="M33.5 32 Q34 20 44 19 Q54 20 54.5 32 Q50 28 44 28 Q38 28 33.5 32 Z"
          fill="url(#turbanG)"/>
        {/* Turban wrap layers */}
        <path d="M33.5 32 Q36 26 44 25 Q52 26 54.5 32"
          stroke="rgba(239,68,68,0.7)" strokeWidth="2" fill="none"/>
        <path d="M34 30 Q36 24 44 23 Q52 24 54 30"
          stroke="rgba(239,68,68,0.5)" strokeWidth="1.5" fill="none"/>
        {/* Turban top knot / fold */}
        <ellipse cx="44" cy="20" rx="6" ry="3"
          fill="url(#turbanG)" transform="rotate(-5 44 20)"/>
        {/* Turban tail draping to right side */}
        <path d="M54 26 Q59 28 58 35 Q57 39 55 38"
          stroke="url(#turbanG)" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
        <path d="M54 26 Q59 28 58 35 Q57 39 55 38"
          stroke="rgba(239,68,68,0.4)" strokeWidth="1" strokeLinecap="round" fill="none"/>
        {/* Turban highlight */}
        <path d="M36 26 Q40 22 48 23"
          stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>

        {/* ── Beard (dark brown/black) ── */}
        <path d="M35 36 Q34 42 37 46 Q40 49 44 49 Q48 49 51 46 Q54 42 53 36
                 Q50 40 44 40 Q38 40 35 36 Z"
          fill="#2d1810" opacity="0.9"/>
        {/* Beard highlight */}
        <path d="M37 39 Q40 41 44 41 Q48 41 51 39"
          stroke="rgba(120,70,40,0.4)" strokeWidth="1" fill="none"/>
        {/* Mustache */}
        <path d="M39 35 Q42 37 44 36 Q46 37 49 35"
          stroke="#1c0f0a" strokeWidth="2" strokeLinecap="round" fill="none"/>

        {/* ── Eyes ── */}
        {/* Eye whites */}
        <ellipse cx="41" cy="33" rx="2.5" ry="1.8" fill="white"/>
        <ellipse cx="47" cy="33" rx="2.5" ry="1.8" fill="white"/>
        {/* Pupils */}
        <circle cx="41.5" cy="33.3" r="1.3" fill="#1c0f0a"/>
        <circle cx="47.5" cy="33.3" r="1.3" fill="#1c0f0a"/>
        {/* Eye shine */}
        <circle cx="42" cy="32.8" r="0.5" fill="white" opacity="0.8"/>
        <circle cx="48" cy="32.8" r="0.5" fill="white" opacity="0.8"/>
        {/* Eyebrows */}
        <path d="M39 30.5 Q41 29.5 43.5 30.5"
          stroke="#2d1810" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        <path d="M45.5 30.5 Q47.5 29.5 50 30.5"
          stroke="#2d1810" strokeWidth="1.2" strokeLinecap="round" fill="none"/>

        {/* Nose */}
        <path d="M44 33 Q43 36 41.5 37 Q44 38 46.5 37 Q45 36 44 33"
          fill="#b5723a" opacity="0.6"/>

        {/* ── Feet & Sandals ── */}
        {/* Left foot */}
        <ellipse cx="38" cy="95" rx="5" ry="2.5" fill="#b5723a"/>
        {/* Sandal strap left */}
        <path d="M34 93 Q38 91 42 93" stroke="#7c3a1a"
          strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        {/* Right foot */}
        <ellipse cx="49" cy="95" rx="5" ry="2.5" fill="#b5723a"/>
        {/* Sandal strap right */}
        <path d="M45 93 Q49 91 53 93" stroke="#7c3a1a"
          strokeWidth="1.2" fill="none" strokeLinecap="round"/>

        {/* ── Small green leaves at base ── */}
        <path d="M8 90 Q12 82 10 78 Q8 84 14 85 Q10 88 8 90Z"
          fill="#16a34a" opacity="0.7"/>
        <path d="M88 85 Q84 77 86 73 Q88 79 82 80 Q86 83 88 85Z"
          fill="#16a34a" opacity="0.7"/>

        {/* ── Teal AI sparkle accents ── */}
        <circle cx="82" cy="20" r="2"   fill="#5eead4" opacity="0.85"/>
        <circle cx="88" cy="28" r="1.2" fill="#86efac" opacity="0.7"/>
        <circle cx="79" cy="30" r="1.5" fill="#5eead4" opacity="0.6"/>
        <line x1="82" y1="20" x2="88" y2="28"
          stroke="rgba(94,234,212,0.25)" strokeWidth="0.8"/>
      </svg>

      {/* ── Text label ── */}
      {showText && (
        <div style={{ lineHeight: 1 }}>
          <div style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: size * 0.52,
            fontWeight: 400,
            color: textColor,
            letterSpacing: "-0.01em",
            lineHeight: 1,
          }}>
            Agro<span style={{ color: "#14b8a6" }}>Sense</span>
          </div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: size * 0.22,
            color: subColor,
            letterSpacing: "0.04em",
            marginTop: size * 0.06,
            fontWeight: 500,
          }}>
            SENSE THE FARM
          </div>
        </div>
      )}
    </div>
  );
}