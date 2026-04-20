export default function LogoMark({ size = 38 }) {
  const id = 'lv-nav';
  const bg = '#0a0a0b';
  const gold = '#e6b129';
  const orange = '#e05a10';
  const cream = '#f5e8c0';
  const white = '#f5efe0';

  const shieldPath = "M 18 22 Q 18 8 32 8 L 168 8 Q 182 8 182 22 L 182 118 L 164 132 L 164 162 Q 100 232 100 232 Q 100 232 36 162 L 36 132 L 18 118 Z";
  const W = 200, H = 240;
  const scale = size / H;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W * scale} height={H * scale} aria-label="El Locu Viejo" style={{ flexShrink: 0 }}>
      <defs>
        <clipPath id={`shield-clip-${id}`}><path d={shieldPath}/></clipPath>
        <clipPath id={`top-clip-${id}`}><rect x="18" y="8" width="164" height="108"/></clipPath>
        <radialGradient id={`sun-${id}`} cx="55%" cy="70%" r="50%">
          <stop offset="0%" stopColor="#ffe566"/>
          <stop offset="40%" stopColor="#ffb030"/>
          <stop offset="100%" stopColor="#cc4400"/>
        </radialGradient>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff8c1a"/>
          <stop offset="55%" stopColor="#ffb030"/>
          <stop offset="100%" stopColor="#cc5500"/>
        </linearGradient>
        <linearGradient id={`fish-body-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5c800"/>
          <stop offset="40%" stopColor="#e09000"/>
          <stop offset="100%" stopColor="#7a5500"/>
        </linearGradient>
      </defs>

      {/* Shield fill */}
      <path d={shieldPath} fill={bg}/>

      {/* Sunset scene */}
      <g clipPath={`url(#shield-clip-${id})`}>
        <g clipPath={`url(#top-clip-${id})`}>
          <rect x="18" y="8" width="164" height="108" fill={`url(#sky-${id})`}/>
          <circle cx="110" cy="78" r="22" fill={`url(#sun-${id})`}/>
          <circle cx="110" cy="78" r="32" fill="#ffb030" opacity="0.2"/>
          <rect x="18" y="96" width="164" height="20" fill="#aa3300" opacity="0.7"/>
          <line x1="18" y1="96" x2="182" y2="96" stroke="#cc4400" strokeWidth="0.8" opacity="0.6"/>
          <line x1="85" y1="98" x2="135" y2="98" stroke="#ffdd88" strokeWidth="1.2" opacity="0.5"/>
          <g fill={bg}>
            <ellipse cx="44" cy="88" rx="5" ry="7"/>
            <circle cx="44" cy="78" r="4"/>
            <rect x="41" y="93" width="3" height="7" rx="1"/>
            <rect x="45" y="93" width="3" height="8" rx="1"/>
            <line x1="44" y1="80" x2="90" y2="55" stroke={bg} strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M 90 55 Q 105 60 102 68" fill="none" stroke={bg} strokeWidth="0.7"/>
          </g>
          <g fill={bg}>
            <path d="M 130 96 Q 145 101 160 96 L 158 100 Q 145 106 132 100 Z"/>
            <ellipse cx="145" cy="90" rx="4" ry="5"/>
            <circle cx="145" cy="83" r="3.5"/>
            <line x1="145" y1="84" x2="168" y2="66" stroke={bg} strokeWidth="1.1" strokeLinecap="round"/>
          </g>
        </g>
      </g>

      {/* Black band for title */}
      <path d="M 18 108 L 182 108 L 182 148 L 18 148 Z" fill={bg} clipPath={`url(#shield-clip-${id})`}/>

      {/* PASIÓN DE AMIGOS arc */}
      <path id={`arc-top-${id}`} d="M 28 50 A 78 78 0 0 1 172 50" fill="none"/>
      <text fontFamily="'Archivo Black','Arial Black',sans-serif" fontSize="13" fontWeight="900" fill={cream} letterSpacing="2">
        <textPath href={`#arc-top-${id}`} startOffset="50%" textAnchor="middle">PASIÓN DE AMIGOS</textPath>
      </text>

      {/* EL LOCU VIEJO */}
      <text x="100" y="130" textAnchor="middle" fontFamily="'Archivo Black','Arial Black',sans-serif"
            fontSize="22" fontWeight="900" fill={gold} letterSpacing="-0.5">EL LOCU VIEJO</text>
      <text x="100" y="146" textAnchor="middle" fontFamily="'Archivo Black','Arial Black',sans-serif"
            fontSize="13" fontWeight="700" fill={white} letterSpacing="3">NOMAS</text>

      {/* Dorado fish */}
      <g clipPath={`url(#shield-clip-${id})`}>
        <g transform="translate(20, 148)">
          <ellipse cx="65" cy="32" rx="59" ry="23" fill={`url(#fish-body-${id})`}/>
          <ellipse cx="59" cy="38" rx="43" ry="12" fill="#f5d050" opacity="0.6"/>
          <path d="M 117 19 L 152 7 L 146 31 L 152 55 L 117 45 Z" fill="#e09000"/>
          <path d="M 12 23 Q 3 32 12 41 L 34 47 L 28 20 Z" fill="#c07800"/>
          <circle cx="25" cy="27" r="3.5" fill="white"/>
          <circle cx="26" cy="27.5" r="2.1" fill="#1a0a00"/>
          <path d="M 40 12 Q 65 3 96 12 L 93 16 Q 65 10 40 16 Z" fill="#c07000" opacity="0.8"/>
        </g>
      </g>

      {/* Frases */}
      <text x="36" y="168" fontFamily="'Comic Sans MS',cursive" fontSize="6.5" fill={cream} opacity="0.85" transform="rotate(-8,36,168)">Me torcí</text>
      <text x="32" y="176" fontFamily="'Comic Sans MS',cursive" fontSize="6" fill={cream} opacity="0.75" transform="rotate(-8,32,176)">mal mal mal</text>
      <text x="130" y="163" fontFamily="'Comic Sans MS',cursive" fontSize="6.5" fill={cream} opacity="0.85" transform="rotate(6,130,163)">Hay que ser</text>
      <text x="133" y="171" fontFamily="'Comic Sans MS',cursive" fontSize="6" fill={cream} opacity="0.75" transform="rotate(6,133,171)">honesto</text>

      {/* COLONIA bottom arc */}
      <path id={`arc-bot-${id}`} d="M 40 190 A 68 68 0 0 0 160 190" fill="none"/>
      <text fontFamily="'Archivo Black','Arial Black',sans-serif" fontSize="10" fontWeight="700" fill={gold} letterSpacing="1.5">
        <textPath href={`#arc-bot-${id}`} startOffset="50%" textAnchor="middle">COLONIA · URUGUAY</textPath>
      </text>

      {/* Shield border */}
      <path d={shieldPath} fill="none" stroke={gold} strokeWidth="2.5"/>
    </svg>
  );
}
