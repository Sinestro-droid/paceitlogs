import React from 'react';

// Soft network of dots and lines for the page background
export const NetworkBackdrop: React.FC = () => {
  const lines: [number, number, number, number][] = [
    [160, 205, 230, 245], [355, 237, 455, 215], [455, 215, 395, 262],
    [583, 155, 612, 250], [903, 303, 977, 383], [977, 383, 1037, 375],
    [1380, 228, 1350, 250], [1315, 380, 1285, 470], [1555, 465, 1500, 490],
    [1465, 733, 1595, 695], [1595, 695, 1555, 640], [1465, 733, 1490, 840],
    [205, 670, 140, 755], [340, 727, 325, 790], [30, 420, 135, 462],
    [720, 612, 800, 720],
  ];
  const dots: [number, number][] = [
    [160, 208], [230, 245], [355, 237], [455, 215], [395, 262], [583, 155],
    [612, 250], [977, 383], [1037, 375], [1380, 228], [1315, 380], [1555, 465],
    [1465, 733], [1595, 695], [140, 755], [340, 727], [135, 462], [855, 125],
    [995, 688], [1207, 810], [472, 788], [720, 612],
  ];

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {lines.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#b9e0c3" strokeWidth="1.5" />
      ))}
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="#a6d7b3" />
      ))}
    </svg>
  );
};

// Login scene: a card on a green panel and a person working at a desk
export const LoginIllustration: React.FC = () => {
  const ink = '#26352d';
  return (
    <svg viewBox="0 0 480 450" className="w-full h-auto" aria-hidden="true">
      {/* soft circle behind everything */}
      <circle cx="250" cy="250" r="195" fill="#dcf4e3" />

      {/* side frames */}
      <rect x="28" y="150" width="78" height="150" fill="none" stroke="#6b7c72" strokeWidth="1.5" />
      <rect x="36" y="160" width="62" height="130" fill="none" stroke="#6b7c72" strokeWidth="1" />
      <rect x="392" y="150" width="78" height="150" fill="none" stroke="#6b7c72" strokeWidth="1.5" />
      <rect x="400" y="160" width="62" height="130" fill="none" stroke="#6b7c72" strokeWidth="1" />

      {/* main panel */}
      <rect x="76" y="26" width="330" height="280" rx="8" fill={ink} />
      <rect x="70" y="20" width="330" height="280" rx="8" fill="#9be3a8" />

      {/* leaves */}
      <g fill="#6fcf86">
        <ellipse cx="92" cy="70" rx="9" ry="16" transform="rotate(-25 92 70)" />
        <ellipse cx="110" cy="52" rx="8" ry="15" transform="rotate(30 110 52)" />
        <ellipse cx="88" cy="110" rx="8" ry="15" transform="rotate(-10 88 110)" />
        <ellipse cx="104" cy="140" rx="9" ry="16" transform="rotate(35 104 140)" />
        <ellipse cx="86" cy="175" rx="8" ry="15" transform="rotate(-30 86 175)" />
        <ellipse cx="380" cy="60" rx="9" ry="16" transform="rotate(25 380 60)" />
        <ellipse cx="364" cy="96" rx="8" ry="15" transform="rotate(-30 364 96)" />
        <ellipse cx="382" cy="130" rx="9" ry="16" transform="rotate(20 382 130)" />
        <ellipse cx="366" cy="170" rx="8" ry="15" transform="rotate(-35 366 170)" />
        <ellipse cx="384" cy="210" rx="9" ry="16" transform="rotate(25 384 210)" />
        <ellipse cx="368" cy="250" rx="8" ry="15" transform="rotate(-20 368 250)" />
        <ellipse cx="100" cy="230" rx="9" ry="16" transform="rotate(30 100 230)" />
        <ellipse cx="120" cy="265" rx="8" ry="15" transform="rotate(-25 120 265)" />
      </g>
      <g fill="#4eb36a">
        <ellipse cx="126" cy="84" rx="6" ry="12" transform="rotate(-20 126 84)" />
        <ellipse cx="118" cy="190" rx="6" ry="12" transform="rotate(25 118 190)" />
        <ellipse cx="350" cy="64" rx="6" ry="12" transform="rotate(20 350 64)" />
        <ellipse cx="352" cy="230" rx="6" ry="12" transform="rotate(-25 352 230)" />
      </g>

      {/* clouds */}
      <g fill="#ffffff">
        <ellipse cx="300" cy="62" rx="34" ry="10" />
        <ellipse cx="318" cy="52" rx="20" ry="11" />
        <ellipse cx="284" cy="54" rx="14" ry="9" />
        <ellipse cx="344" cy="112" rx="20" ry="7" />
        <ellipse cx="356" cy="105" rx="12" ry="8" />
        <ellipse cx="128" cy="236" rx="26" ry="8" />
      </g>

      {/* speech tail */}
      <path d="M300 300 L330 332 L345 300 Z" fill={ink} />

      {/* login card */}
      <rect x="146" y="96" width="190" height="205" rx="8" fill="#ffffff" stroke={ink} strokeWidth="2.5" />
      <circle cx="241" cy="92" r="30" fill="#ffffff" stroke={ink} strokeWidth="2.5" />
      <circle cx="241" cy="84" r="10" fill={ink} />
      <path d="M221 112 C221 99 261 99 261 112 Z" fill={ink} />
      <text
        x="241"
        y="168"
        textAnchor="middle"
        fontSize="19"
        fontWeight="500"
        fill={ink}
        style={{ fontFamily: 'IBM Plex Sans, sans-serif', letterSpacing: '0.5px' }}
      >
        LOGIN
      </text>
      <rect x="176" y="182" width="130" height="17" fill="#ffffff" stroke={ink} strokeWidth="1.5" />
      <rect x="176" y="214" width="130" height="17" fill="#ffffff" stroke={ink} strokeWidth="1.5" />
      <text x="241" y="194" textAnchor="middle" fontSize="7" fill="#9aa59e" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
        USERNAME
      </text>
      <text x="241" y="226" textAnchor="middle" fontSize="7" fill="#9aa59e" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
        PASSWORD
      </text>

      {/* ground line */}
      <line x1="10" y1="420" x2="470" y2="420" stroke={ink} strokeWidth="2" />

      {/* desk */}
      <rect x="205" y="388" width="170" height="32" fill="#ffffff" stroke={ink} strokeWidth="2" />
      <rect x="196" y="380" width="188" height="9" fill="#ffffff" stroke={ink} strokeWidth="2" />

      {/* monitor */}
      <line x1="346" y1="296" x2="358" y2="378" stroke={ink} strokeWidth="3" />
      <line x1="342" y1="296" x2="354" y2="378" stroke={ink} strokeWidth="1.5" />
      <rect x="326" y="372" width="48" height="6" rx="2" fill={ink} />
      {/* keyboard */}
      <rect x="236" y="371" width="64" height="9" rx="2" fill="#ffffff" stroke={ink} strokeWidth="1.5" />

      {/* plant */}
      <g stroke={ink} strokeWidth="2" fill="none">
        <path d="M392 380 C390 350 384 335 380 322" />
        <path d="M398 380 C400 345 408 330 414 318" />
        <path d="M395 380 C395 355 396 340 396 326" />
      </g>
      <g fill={ink}>
        <ellipse cx="379" cy="322" rx="4" ry="8" transform="rotate(-20 379 322)" />
        <ellipse cx="415" cy="318" rx="4" ry="8" transform="rotate(20 415 318)" />
        <ellipse cx="396" cy="324" rx="4" ry="8" />
        <ellipse cx="386" cy="340" rx="3.5" ry="7" transform="rotate(-35 386 340)" />
        <ellipse cx="406" cy="338" rx="3.5" ry="7" transform="rotate(35 406 338)" />
      </g>
      <rect x="383" y="380" width="26" height="30" fill={ink} />

      {/* chair */}
      <path d="M96 340 C92 360 94 395 112 408 L126 408 C112 392 112 362 118 340 Z" fill={ink} />
      <rect x="118" y="404" width="120" height="8" rx="3" fill={ink} />

      {/* person */}
      <path d="M150 312 C190 304 204 322 208 352 L206 404 L160 404 C146 378 140 340 150 312 Z" fill="#aeb2b0" stroke={ink} strokeWidth="2" />
      <path d="M172 372 L236 372 L240 394 L174 400 Z" fill="#8e9290" stroke={ink} strokeWidth="2" />
      <path d="M200 338 L246 366 L240 376 L194 354 Z" fill="#aeb2b0" stroke={ink} strokeWidth="2" />
      <circle cx="244" cy="372" r="5" fill="#f1d6c0" stroke={ink} strokeWidth="1.5" />
      <rect x="150" y="296" width="14" height="22" rx="6" fill="#f1d6c0" stroke={ink} strokeWidth="2" />
      <circle cx="160" cy="278" r="21" fill="#f1d6c0" stroke={ink} strokeWidth="2" />
      <path d="M140 276 C138 252 170 250 180 268 C174 262 160 262 148 272 Z" fill={ink} />
      <ellipse cx="144" cy="252" rx="13" ry="8" fill="#ffffff" stroke={ink} strokeWidth="2" />
      <path d="M142 286 C148 292 156 292 160 288" stroke={ink} strokeWidth="1.5" fill="none" />
      <circle cx="170" cy="278" r="1.6" fill={ink} />
    </svg>
  );
};
