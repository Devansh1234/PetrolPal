// Inline SVG infographics for the Get Petrol Pal page. Drawn to scale where they show numbers.

const PETROL = '#E3A33B';
const ETHANOL = '#5EEAD4';

/** E20: a fuel column split 80 / 20 by volume. */
export function E20Column() {
  // column 360 px tall: 80 % = 288 px petrol, 20 % = 72 px ethanol
  return (
    <svg viewBox="0 0 320 420" role="img" aria-label="E20 petrol is 80 percent petrol and 20 percent ethanol by volume" className="h-auto w-full max-w-[320px]">
      <defs>
        <clipPath id="col">
          <rect x="70" y="30" width="110" height="360" rx="22" />
        </clipPath>
        <linearGradient id="pg" x1="0" x2="1">
          <stop offset="0" stopColor="#C9821F" />
          <stop offset="0.5" stopColor={PETROL} />
          <stop offset="1" stopColor="#C9821F" />
        </linearGradient>
        <linearGradient id="eg" x1="0" x2="1">
          <stop offset="0" stopColor="#2CB5A4" />
          <stop offset="0.5" stopColor={ETHANOL} />
          <stop offset="1" stopColor="#2CB5A4" />
        </linearGradient>
      </defs>
      <g clipPath="url(#col)">
        <rect x="70" y="30" width="110" height="72" fill="url(#eg)" />
        <rect x="70" y="102" width="110" height="288" fill="url(#pg)" />
        <rect x="70" y="101" width="110" height="2" fill="#ffffff" opacity="0.7" />
      </g>
      <rect x="70" y="30" width="110" height="360" rx="22" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <g fontFamily="'IBM Plex Mono', ui-monospace, monospace" fill="currentColor">
        <line x1="190" y1="66" x2="206" y2="66" stroke="currentColor" strokeOpacity="0.5" />
        <text x="212" y="62" fontSize="26" fontWeight="600">20%</text>
        <text x="212" y="84" fontSize="13" opacity="0.7">ethanol</text>
        <line x1="190" y1="246" x2="206" y2="246" stroke="currentColor" strokeOpacity="0.5" />
        <text x="212" y="242" fontSize="26" fontWeight="600">80%</text>
        <text x="212" y="264" fontSize="13" opacity="0.7">petrol</text>
        <text x="125" y="412" fontSize="13" opacity="0.7" textAnchor="middle">E20 · by volume</text>
      </g>
    </svg>
  );
}

/** Relative permittivity bars, to scale (0–25). Petrol ≈ 2, ethanol ≈ 25. */
export function PermittivityBars() {
  const x0 = 120;
  const W = 380; // px for 25
  const px = (v) => (v / 25) * W;
  return (
    <svg viewBox="0 0 540 200" role="img" aria-label="Relative permittivity: petrol about 2, ethanol about 25" className="h-auto w-full">
      <g fontFamily="'IBM Plex Mono', ui-monospace, monospace" fill="currentColor">
        <text x="0" y="56" fontSize="15" fontWeight="600">Petrol</text>
        <rect x={x0} y="38" width={px(2)} height="26" rx="5" fill={PETROL} />
        <text x={x0 + px(2) + 10} y="57" fontSize="15">≈ 2</text>

        <text x="0" y="116" fontSize="15" fontWeight="600">Ethanol</text>
        <rect x={x0} y="98" width={px(25)} height="26" rx="5" fill={ETHANOL} />
        <text x={x0 + px(25) - 10} y="117" fontSize="15" textAnchor="end" fill="#063A34">≈ 25</text>

        {[0, 5, 10, 15, 20, 25].map((v) => (
          <g key={v}>
            <line x1={x0 + px(v)} x2={x0 + px(v)} y1="140" y2="148" stroke="currentColor" strokeOpacity="0.4" />
            <text x={x0 + px(v)} y="166" fontSize="12" textAnchor="middle" opacity="0.6">
              {v}
            </text>
          </g>
        ))}
        <line x1={x0} x2={x0 + W} y1="140" y2="140" stroke="currentColor" strokeOpacity="0.25" />
        <text x={x0 + W / 2} y="192" fontSize="12" textAnchor="middle" opacity="0.6">
          relative permittivity (how much electric charge a liquid stores)
        </text>
      </g>
    </svg>
  );
}

/** Cross-section through the comb: alternating fingers, field lines arcing through the sample. */
export function CombField() {
  const fingers = Array.from({ length: 9 }, (_, i) => i);
  return (
    <svg viewBox="0 0 540 230" role="img" aria-label="Cross-section of the sensing paddle: alternating gold fingers with electric field lines passing through the fuel sample above them" className="h-auto w-full">
      <rect x="0" y="40" width="540" height="120" fill={PETROL} opacity="0.16" />
      <text x="12" y="62" fontSize="12" fontFamily="'IBM Plex Mono', ui-monospace, monospace" fill="currentColor" opacity="0.7">
        fuel sample
      </text>
      {fingers.slice(0, -1).map((i) => {
        const x1 = 50 + i * 55 + 15;
        const x2 = x1 + 55;
        return [18, 34, 52].map((hgt, k) => (
          <path
            key={`${i}-${k}`}
            d={`M ${x1} 160 Q ${(x1 + x2) / 2} ${160 - hgt * 2} ${x2} 160`}
            fill="none"
            stroke={ETHANOL}
            strokeWidth="1.6"
            strokeOpacity={0.9 - k * 0.25}
          />
        ));
      })}
      {fingers.map((i) => (
        <g key={i}>
          <rect x={50 + i * 55} y="160" width="30" height="10" rx="2" fill="#D6B25E" />
          <text x={65 + i * 55} y="194" fontSize="16" textAnchor="middle" fontFamily="'IBM Plex Mono', ui-monospace, monospace" fill="currentColor" opacity="0.75">
            {i % 2 === 0 ? '+' : '−'}
          </text>
        </g>
      ))}
      <rect x="20" y="170" width="500" height="14" fill="currentColor" opacity="0.12" />
      <text x="270" y="222" fontSize="12" textAnchor="middle" fontFamily="'IBM Plex Mono', ui-monospace, monospace" fill="currentColor" opacity="0.7">
        gold fingers on the circuit board · 1 mm apart
      </text>
    </svg>
  );
}

/** Three-step pictograms: fill, dip, read. */
export function StepFill() {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className="h-full w-full">
      <path d="M78 22 h44 v18 h-10 v12 h-24 v-12 h-10z" fill="currentColor" opacity="0.8" />
      <path d="M100 60 q-6 10 0 16 q6 -6 0 -16z" fill={PETROL} />
      <rect x="66" y="84" width="68" height="100" rx="18" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="3" />
      <path d="M69 120 h62 v46 a15 15 0 0 1 -15 15 h-32 a15 15 0 0 1 -15 -15z" fill={PETROL} opacity="0.85" />
      <line x1="58" y1="120" x2="66" y2="120" stroke="currentColor" strokeWidth="2" />
      <text x="54" y="124" fontSize="10" textAnchor="end" fontFamily="'IBM Plex Mono', monospace" fill="currentColor">FILL</text>
    </svg>
  );
}

export function StepDip() {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className="h-full w-full">
      <rect x="66" y="96" width="68" height="94" rx="18" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="3" />
      <path d="M69 128 h62 v44 a15 15 0 0 1 -15 15 h-32 a15 15 0 0 1 -15 -15z" fill={PETROL} opacity="0.85" />
      <rect x="78" y="8" width="44" height="74" rx="11" fill="currentColor" opacity="0.85" />
      <rect x="82" y="80" width="36" height="8" rx="3" fill="#14B8A6" />
      <rect x="88" y="88" width="24" height="88" rx="1.5" fill="#1B2023" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={i % 2 ? 91 : 93} y={110 + i * 7} width="16" height="2" fill="#D6B25E" />
      ))}
      <path d="M100 2 v-0" />
    </svg>
  );
}

export function StepRead() {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className="h-full w-full">
      <rect x="40" y="20" width="120" height="160" rx="26" fill="currentColor" opacity="0.88" />
      <rect x="56" y="40" width="88" height="56" rx="8" fill="#000" />
      <text x="100" y="78" fontSize="28" fontWeight="700" textAnchor="middle" fontFamily="Archivo, 'Arial Narrow', sans-serif" fill="#F2F5F4">
        19.8%
      </text>
      <rect x="64" y="86" width="72" height="3" fill="#2A3133" />
      <rect x="95" y="83" width="12" height="9" rx="2" fill="#5EEAD4" opacity="0.4" />
      <circle cx="100" cy="132" r="11" fill="#14B8A6" />
    </svg>
  );
}
