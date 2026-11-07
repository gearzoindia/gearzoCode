import React from 'react';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Ellipse,
  Rect,
  Polygon,
  G,
  Circle,
  Path,
} from 'react-native-svg';

export interface SvgProps {
  width?: number;
  height?: number;
  showBeam?: boolean;
  showTrail?: boolean;
}

export function CeilingLampSvg({ width = 200, height = 420 }: SvgProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 200 420">
      <Defs>
        <LinearGradient id="lampGrad" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.22" />
          <Stop offset="0.7" stopColor="#FFFFFF" stopOpacity="0.03" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Polygon points="80,0 120,0 200,420 0,420" fill="url(#lampGrad)" />
    </Svg>
  );
}

export function GreenGlowSvg({ width = 130, height = 120 }: SvgProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 130 120">
      <Defs>
        <RadialGradient id="glowGrad" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0" stopColor="#00E85D" stopOpacity="0.8" />
          <Stop offset="0.65" stopColor="#00E85D" stopOpacity="0" />
          <Stop offset="1" stopColor="#00E85D" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse cx="65" cy="60" rx="65" ry="60" fill="url(#glowGrad)" />
    </Svg>
  );
}

export function BikeSvg({
  width = 300,
  height = 154,
  showBeam = false,
  showTrail = false,
}: SvgProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 300 154"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <Defs>
        <LinearGradient id="tr" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#00E85D" stopOpacity="0" />
          <Stop offset="1" stopColor="#00E85D" stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="bm" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
          <Stop offset="1" stopColor="#00E85D" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="150" cy="150" rx="128" ry="5" fill="#000" opacity={0.55} />
      {showTrail ? (
        <Rect x="0" y="108" width="75" height="10" rx="5" fill="url(#tr)" opacity={0.85} />
      ) : null}
      {showBeam ? (
        <Polygon points="236,66 300,36 300,96" fill="url(#bm)" opacity={0.85} />
      ) : null}
      {/* Rear Wheel */}
      <G stroke="#0a0a0a" strokeWidth={3.5}>
        <Circle cx="66" cy="112" r="36" fill="#1f2321" />
        <Circle cx="66" cy="112" r="24" fill="#eef1ef" strokeWidth={3} />
        <Path d="M66 90V134M44 112H88M50 96L82 128M82 96L50 128" stroke="#0a0a0a" strokeWidth={2.6} />
        <Circle cx="66" cy="112" r="7" fill="#00E85D" strokeWidth={2.5} />
      </G>
      {/* Front Wheel */}
      <G stroke="#0a0a0a" strokeWidth={3.5}>
        <Circle cx="234" cy="112" r="36" fill="#1f2321" />
        <Circle cx="234" cy="112" r="24" fill="#eef1ef" strokeWidth={3} />
        <Path d="M234 90V134M212 112H256M218 96L250 128M250 96L218 128" stroke="#0a0a0a" strokeWidth={2.6} />
        <Circle cx="234" cy="112" r="7" fill="#00E85D" strokeWidth={2.5} />
      </G>
      {/* Bike Chassis & Body */}
      <G stroke="#0a0a0a" strokeWidth={3.5}>
        <Path d="M66 112L128 100" fill="none" strokeWidth={9} />
        <Path d="M66 112L128 100" fill="none" stroke="#3b4340" strokeWidth={4} />
        <Path d="M100 122L36 128" fill="none" strokeWidth={15} />
        <Path d="M100 122L36 128" fill="none" stroke="#d7dcda" strokeWidth={9} />
        <Rect x="112" y="82" width="68" height="40" rx="10" fill="#59625e" />
        <Path d="M122 88H170M122 96H170" stroke="#2a302d" strokeWidth={3} />
        <Circle cx="146" cy="108" r="13" fill="#9aa39f" />
        <Circle cx="146" cy="108" r="5" fill="#59625e" />
        <Path d="M104 66C116 36 190 32 212 54L204 80L108 80Z" fill="#00E85D" />
        <Path d="M122 54C148 44 184 44 200 54" fill="none" stroke="#fff" strokeWidth={5} />
        <Path d="M52 68C70 54 106 56 122 68L116 82L56 82Z" fill="#232826" />
        <Path d="M42 66L54 64L56 76L44 76Z" fill="#ff4b4b" />
        <Path d="M216 56L234 112" fill="none" strokeWidth={10} />
        <Path d="M216 56L234 112" fill="none" stroke="#d7dcda" strokeWidth={5} />
        <Path d="M218 84Q238 62 266 86" fill="none" strokeWidth={9} />
        <Path d="M218 84Q238 62 266 86" fill="none" stroke="#00E85D" strokeWidth={4.5} />
        <Path d="M208 52L230 44" fill="none" strokeWidth={8} />
        <Path d="M208 52L230 44" fill="none" stroke="#3b4340" strokeWidth={3} />
        <Path d="M228 44L226 28" fill="none" strokeWidth={3} />
        <Ellipse cx="226" cy="26" rx="7" ry="4" fill="#9aa39f" strokeWidth={2.5} />
        <Circle cx="228" cy="66" r="14" fill="#f4f6f5" />
        <Circle cx="231" cy="66" r="7.5" fill="#fff3a8" strokeWidth={2.5} />
      </G>
    </Svg>
  );
}

export function MechanicSvg({ width = 150, height = 240 }: SvgProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 150 240"
      stroke="#0a0a0a"
      strokeWidth={3.5}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <Ellipse cx="66" cy="236" rx="46" ry="5" fill="#000" opacity={0.6} stroke="none" />
      <Path d="M50 140L42 226H64L70 150Z" fill="#d95a1c" />
      <Path d="M66 140L80 226H102L90 140Z" fill="#ff7a2f" />
      <Path d="M36 226h28v10H34z" fill="#1b1b1b" />
      <Path d="M80 226h30q6 0 6 10H78z" fill="#1b1b1b" />
      <Path d="M52 92L46 126" strokeWidth={19} fill="none" />
      <Path d="M52 92L46 126" stroke="#d95a1c" strokeWidth={12} fill="none" />
      <Circle cx="46" cy="132" r="8" fill="#c98a5b" />
      <Path d="M44 80Q70 66 98 84L92 150H48Z" fill="#ff7a2f" />
      <Path d="M70 74L82 98L94 82Z" fill="#d95a1c" />
      <Rect x="54" y="108" width="16" height="14" rx="3" fill="#ff8a43" />
      <Circle cx="62" cy="112" r="2.5" fill="#dfe5e8" strokeWidth={1.5} />
      <Path d="M70 98V148" strokeWidth={2.5} fill="none" />
      <Rect x="66" y="64" width="12" height="16" rx="5" fill="#b87a50" stroke="none" />
      <Circle cx="55" cy="52" r="7" fill="#c98a5b" />
      <Circle cx="76" cy="46" r="25" fill="#c98a5b" />
      <Path d="M54 56Q58 80 78 78Q98 74 100 56Q90 68 77 66Q64 64 54 56Z" fill="#1a1410" strokeWidth={2.5} />
      <Path d="M52 40Q52 18 77 18Q100 18 100 40Q82 32 52 40Z" fill="#161616" />
      <Path d="M94 32L116 36Q118 41 112 42L96 42Z" fill="#161616" />
      <Path d="M58 24Q76 17 94 24" fill="none" stroke="#00E85D" strokeWidth={3} />
      <Circle cx="88" cy="48" r="4" fill="#0a0a0a" stroke="none" />
      <Circle cx="89.5" cy="46.5" r="1.4" fill="#fff" stroke="none" />
      <Path d="M82 40Q88 37 94 40" fill="none" strokeWidth={2.5} />
      <Path d="M78 56Q86 60 96 55" fill="none" stroke="#1a1410" strokeWidth={3.5} />
      <Path d="M80 63Q88 69 97 62" fill="none" stroke="#fff" strokeWidth={2.5} />
      {/* Arm with Wrench */}
      <G id="arm">
        <Path d="M84 88L98 120" strokeWidth={22} fill="none" />
        <Path d="M84 88L98 120" stroke="#ff7a2f" strokeWidth={15} fill="none" />
        <Path d="M99 124L116 148" strokeWidth={15} fill="none" />
        <Path d="M99 124L116 148" stroke="#c98a5b" strokeWidth={8.5} fill="none" />
        <Path d="M92 110L103 128" stroke="#d95a1c" strokeWidth={16} fill="none" strokeLinecap="butt" />
        <Circle cx="117" cy="149" r="7.5" fill="#c98a5b" />
        <G id="wr">
          <Path d="M117 149L132 166" strokeWidth={10} fill="none" />
          <Path d="M117 149L132 166" stroke="#dfe5e8" strokeWidth={5} fill="none" />
          <Path d="M129 160A8 8 0 1 1 140 172" fill="none" strokeWidth={9} />
          <Path d="M129 160A8 8 0 1 1 140 172" fill="none" stroke="#dfe5e8" strokeWidth={4.5} />
        </G>
      </G>
    </Svg>
  );
}

export function GearzoLogoSvg({ width = 260, height = 58 }: SvgProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 240 52">
      <Path
        d="M26 15.5C23.6 11.2 19.4 8.5 14 8.5C6.2 8.5 0 15 0 23.5C0 32 6.2 38.5 14.5 38.5C21 38.5 25.5 34.8 26.8 28.5H14.5V23.5H32V25.5C31.5 37 24 43.5 14 43.5C4 43.5 -5 34.5 -5 23.5C-5 12.5 4 3.5 14 3.5C21.5 3.5 27.5 7.8 30.5 13.5L26 15.5Z"
        fill="#FFFFFF"
        transform="translate(8, 0)"
      />
      <Path
        d="M48 8.5H68V13.8H54V21H66V26H54V33.2H68.5V38.5H48V8.5Z"
        fill="#FFFFFF"
      />
      <Path
        d="M84 8.5H91.5L103 38.5H96L93.5 31.8H82.2L79.7 38.5H72.8L84 8.5ZM91.8 27L87.8 15.8L83.8 27H91.8Z"
        fill="#FFFFFF"
      />
      <Path
        d="M110 8.5H124C129.5 8.5 133.5 12 133.5 17C133.5 20.8 131 23.5 127 24.8L135 38.5H127.5L120.5 25.8H116V38.5H110V8.5ZM116 21H123C126 21 127.5 19.5 127.5 17C127.5 14.5 126 13.5 123 13.5H116V21Z"
        fill="#FFFFFF"
      />
      <Path
        d="M141 8.5H161V13.8L148.5 33.2H161.5V38.5H140.5V33.2L153 13.8H141V8.5Z"
        fill="#FFFFFF"
      />
      <G transform="translate(172, 3)">
        <Circle cx="23" cy="23" r="15" fill="none" stroke="#00E85D" strokeWidth={5.5} />
        <Circle cx="23" cy="23" r="6.5" fill="#00E85D" />
        <Rect x="20.5" y="2" width="5" height="6.5" rx="2" fill="#00E85D" />
        <Rect x="20.5" y="37.5" width="5" height="6.5" rx="2" fill="#00E85D" />
        <Rect x="2" y="20.5" width="6.5" height="5" rx="2" fill="#00E85D" />
        <Rect x="37.5" y="20.5" width="6.5" height="5" rx="2" fill="#00E85D" />
        <Rect x="8" y="8" width="6" height="5" rx="1.8" transform="rotate(45 11 10.5)" fill="#00E85D" />
        <Rect x="33" y="33" width="6" height="5" rx="1.8" transform="rotate(45 36 35.5)" fill="#00E85D" />
        <Rect x="8" y="33" width="6" height="5" rx="1.8" transform="rotate(-45 11 35.5)" fill="#00E85D" />
        <Rect x="33" y="8" width="6" height="5" rx="1.8" transform="rotate(-45 36 10.5)" fill="#00E85D" />
      </G>
    </Svg>
  );
}
