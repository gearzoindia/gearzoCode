import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, Text, TouchableOpacity, TextInput } from 'react-native';
import { GEARZO_LOGO_BASE64 } from './assets/gearzo-logo-base64';

export interface GearzoSplashLoginProps {
  appType?: 'customer' | 'mechanic';
  title?: string;
  subtitle?: string;
  tagline?: string;
  badge?: string;
  onContinue: (phone: string) => Promise<void>;
  isLoading?: boolean;
  errorMessage?: string | null;
  onTermsPress?: () => void;
  onPrivacyPress?: () => void;
}

export function GearzoSplashLogin({
  appType = 'customer',
  title = appType === 'mechanic' ? 'Gearzo Partner' : 'Welcome to Gearzo',
  subtitle = appType === 'mechanic'
    ? 'Grow your garage business with instant job dispatch.'
    : 'Your journey deserves a reliable mechanic.',
  tagline = appType === 'mechanic' ? 'Partner Network. Instant Dispatch.' : 'Mechanic, Minutes Away.',
  badge = appType === 'mechanic' ? 'FOR MECHANICS & GARAGES' : undefined,
  onContinue,
  isLoading = false,
  errorMessage = null,
  onTermsPress,
  onPrivacyPress,
}: GearzoSplashLoginProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<any>(null);

  // Play animation sequence
  const playAnimation = () => {
    if (Platform.OS !== 'web') return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const stage = stageRef.current;
    if (!stage) return;
    stage.classList.remove('play', 'live');
    // force reflow
    void stage.offsetWidth;
    stage.classList.add('play');
    timerRef.current = setTimeout(() => {
      stage.classList.add('live');
    }, 3400);
  };

  // Responsive scale to viewport
  const fitStage = () => {
    if (Platform.OS !== 'web') return;
    const stage = stageRef.current;
    const wrap = wrapRef.current;
    if (!stage || !wrap || typeof window === 'undefined') return;
    const scale = Math.min(window.innerWidth / 390, window.innerHeight / 844);
    stage.style.transform = `scale(${scale})`;
    wrap.style.width = `${390 * scale}px`;
    wrap.style.height = `${844 * scale}px`;
  };

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('resize', fitStage);
      fitStage();
      playAnimation();
      return () => {
        window.removeEventListener('resize', fitStage);
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, []);

  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
    if (localError) setLocalError(null);
  };

  const handleSubmit = async () => {
    if (phoneNumber.length !== 10) {
      setLocalError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLocalError(null);
    try {
      await onContinue(phoneNumber);
    } catch {
      // Error handled by caller
    }
  };

  const displayError = errorMessage || localError;
  const isButtonEnabled = phoneNumber.length === 10 && !isLoading;

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#050505',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Sora, system-ui, sans-serif',
        color: '#FFFFFF',
      }}
    >
      {/* Dynamic Embedded CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --bk: #050505;
              --wh: #fff;
              --gr: #00E85D;
              --mu: #8d948f;
              color-scheme: dark;
            }
            .gz-abs { position: absolute; }
            #gz-wall {
              inset: 0 0 374px;
              background: repeating-linear-gradient(90deg, #0d100e 0 38px, #090b0a 38px 40px);
            }
            #gz-strip {
              left: 0; right: 0; top: 250px; height: 3px;
              background: var(--gr);
              box-shadow: 0 0 18px 2px rgba(0,232,93,.55);
              opacity: .55;
            }
            #gz-lamp {
              left: 95px; top: -10px; width: 200px; height: 420px;
              background: radial-gradient(ellipse at 50% 0, rgba(255,255,255,.2), transparent 70%);
              clip-path: polygon(40% 0, 60% 0, 100% 100%, 0 100%);
            }
            #gz-floor {
              left: 0; right: 0; top: 470px; bottom: 0;
              background: linear-gradient(#141815, #050505 70%);
              border-top: 1px solid #222925;
            }
            #gz-streaks {
              inset: 330px 0 374px; opacity: 0;
              background: repeating-linear-gradient(0deg, transparent 0 22px, rgba(0,232,93,.35) 22px 23px, transparent 23px 48px);
              -webkit-mask: linear-gradient(90deg, transparent, #000 40%, transparent);
              mask: linear-gradient(90deg, transparent, #000 40%, transparent);
            }
            #gz-glow {
              left: 138px; top: 357px; width: 130px; height: 120px;
              border-radius: 50%;
              background: radial-gradient(circle, rgba(0,232,93,.8), transparent 65%);
              opacity: 0;
            }
            #gz-road {
              left: 24px; right: 24px; top: 215px; height: 2px;
              border-radius: 2px;
              background: linear-gradient(90deg, transparent, #00E85D, transparent);
              box-shadow: 0 0 22px 3px rgba(0,232,93,.4);
              opacity: 0;
            }
            #gz-bikeW {
              left: 45px; top: 322px; width: 300px; height: 154px;
              transform-origin: 150px 148px;
            }
            #gz-bikeW svg, #gz-mech svg { overflow: visible; display: block; }
            #gz-mech {
              left: 85px; top: 250px; width: 150px; height: 240px;
            }
            #gz-arm { transform-origin: 84px 88px; }
            #gz-wr { transform-origin: 116px 148px; }
            .gz-wh { transform-box: fill-box; transform-origin: center; }
            #gz-brand {
              left: 65px; top: 540px; width: 260px; transform-origin: 0 0;
            }
            #gz-wm { position: relative; width: 260px; height: 58.3px; }
            .gz-sg {
              position: absolute; top: 0; height: 100%;
              background-image: url(${GEARZO_LOGO_BASE64});
              background-size: 260px 58.3px;
              background-repeat: no-repeat;
              opacity: 0;
            }
            #gz-tg {
              margin: 14px 0 0; font-size: 19px; line-height: 1.3;
              color: var(--gr); opacity: 0; white-space: nowrap;
              font-weight: 600;
            }
            .play .gz-sg {
              animation: gz-pop .3s cubic-bezier(.2,.8,.2,1) var(--d) both;
            }
            .play .gz-sg.o {
              animation: gz-pop .3s cubic-bezier(.2,.8,.2,1) var(--d) both, gz-glo .9s ease-out 2.2s both;
            }
            @keyframes gz-pop {
              from { opacity: 0; transform: translateY(16px) scale(.85); }
              to { opacity: 1; transform: none; }
            }
            @keyframes gz-glo {
              0% { filter: drop-shadow(0 0 0 rgba(0,232,93,0)); }
              40% { filter: drop-shadow(0 0 12px rgba(0,232,93,.9)); }
              100% { filter: drop-shadow(0 0 3px rgba(0,232,93,.35)); }
            }
            .play #gz-tg { animation: gz-rise .35s ease-out 2.25s both; }
            @keyframes gz-rise {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: none; }
            }
            .play #gz-brand { animation: gz-up .6s cubic-bezier(.65,0,.25,1) 2.55s both; }
            @keyframes gz-up {
              to { transform: translate(-37px, -300px) scale(.677); }
            }
            #gz-login {
              inset: 0; padding: 240px 28px 0; opacity: 0;
              transform: translateY(14px); pointer-events: none;
            }
            .gz-title {
              font-size: 28px; line-height: 1.15; margin: 44px 0 8px;
              font-weight: 700; color: #FFFFFF;
            }
            .gz-sub {
              margin: 0 0 24px; color: var(--mu); font-size: 14px; line-height: 1.5;
            }
            .gz-badge {
              display: inline-block;
              background: rgba(0, 232, 93, 0.15);
              border: 1px solid rgba(0, 232, 93, 0.4);
              color: var(--gr);
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 0.1em;
              padding: 3px 8px;
              border-radius: 6px;
              margin-bottom: 8px;
            }
            .gz-row { display: flex; gap: 10px; }
            .gz-cc, .gz-num {
              height: 54px; border-radius: 14px;
              border: 1px solid rgba(255,255,255,.14);
              background: #0d0f0e; color: var(--wh);
              font: 600 16px Sora, system-ui, sans-serif;
            }
            .gz-cc {
              width: 86px; display: flex; align-items: center; justify-content: center; gap: 6px;
              user-select: none;
            }
            .gz-num {
              flex: 1; min-width: 0; padding: 0 16px; outline: 0; letter-spacing: .06em;
              box-sizing: border-box;
            }
            .gz-num:focus {
              border-color: var(--gr);
              box-shadow: 0 0 0 3px rgba(0,232,93,.18);
            }
            #gz-go {
              margin-top: 16px; width: 100%; height: 54px; border: 0;
              border-radius: 14px; background: var(--gr); color: var(--bk);
              font: 700 16px Sora, system-ui, sans-serif;
              opacity: .4; transition: all .2s; cursor: not-allowed;
            }
            #gz-go.gz-on { opacity: 1; cursor: pointer; }
            #gz-note {
              min-height: 18px; margin: 10px 2px 0; font-size: 12px; color: #EF4444; font-weight: 500;
            }
            #gz-terms {
              left: 28px; right: 28px; bottom: 32px; text-align: center;
              font-size: 11px; line-height: 1.5; color: #6f7671; opacity: 0;
            }
            #gz-terms a { color: #b5bbb7; text-decoration: underline; cursor: pointer; }
            #gz-replay {
              position: fixed; top: max(10px, env(safe-area-inset-top)); right: 14px;
              z-index: 99; background: #111; color: #cfd4d1;
              border: 1px solid #2a2f2c; border-radius: 999px;
              padding: 7px 14px; font: 600 12px Sora, system-ui, sans-serif;
              cursor: pointer; transition: background .15s;
            }
            #gz-replay:hover { background: #222; }
            .play #gz-bikeW { animation: gz-ride 3.2s both; }
            @keyframes gz-ride {
              0%, 37.5% { transform: none; animation-timing-function: cubic-bezier(.6,0,.95,.55); }
              68.75% { transform: translate(420px, 0); }
              68.76%, 71.9% { transform: translate(-190px,-570px) scale(.75) rotate(12deg); animation-timing-function: cubic-bezier(.1,.7,.2,1); }
              100% { transform: translate(40px,-255px) scale(.75); }
            }
            .play .gz-wh { animation: gz-spin 2s cubic-bezier(.35,0,.2,1) 1.2s both; }
            @keyframes gz-spin { to { transform: rotate(2520deg); } }
            .play #gz-beam { animation: gz-lamp .5s 1.2s both; }
            @keyframes gz-lamp { 0% { opacity: 0; } 25% { opacity: 1; } 45% { opacity: .25; } 100% { opacity: .85; } }
            .play #gz-body { animation: gz-shake .4s 1.2s; }
            @keyframes gz-shake { 25% { transform: translateY(-1.5px); } 50% { transform: translateY(1px); } 75% { transform: translateY(-1px); } }
            .play #gz-trail { animation: gz-trail 3.2s both; }
            @keyframes gz-trail { 0%, 38% { opacity: 0; } 56% { opacity: .9; } 68.75% { opacity: .4; } 72%, 74% { opacity: 0; } 80% { opacity: .8; } 100% { opacity: 0; } }
            .play #gz-arm { animation: gz-arm .28s ease-in-out 0s 3 alternate both; }
            @keyframes gz-arm { from { transform: rotate(-3deg); } to { transform: rotate(3deg); } }
            .play #gz-wr { animation: gz-wrench .28s ease-in-out 0s 3 alternate both; }
            @keyframes gz-wrench { from { transform: rotate(-16deg); } to { transform: rotate(14deg); } }
            .play #gz-mech { animation: gz-away .5s ease-in .9s both; }
            @keyframes gz-away { to { transform: translateX(-190px); opacity: 0; } }
            .play #gz-glow { animation: gz-pulse 1s .8s both; }
            @keyframes gz-pulse { 0% { opacity: 0; transform: scale(.6); } 35% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1.15); } }
            .play #gz-streaks { animation: gz-streak 1s 1.5s both; }
            @keyframes gz-streak { 0% { opacity: 0; background-position-x: 0; } 40% { opacity: .5; } 100% { opacity: 0; background-position-x: -400px; } }
            .play #gz-road { animation: gz-fade .6s 2.6s both; }
            .play #gz-wall, .play #gz-lamp, .play #gz-strip, .play #gz-floor { animation: gz-dim 1s 2.2s both; }
            @keyframes gz-dim { to { opacity: .18; } }
            .play #gz-login { animation: gz-in .5s cubic-bezier(.2,.7,.2,1) 3s both; }
            .play #gz-terms { animation: gz-fade .5s 3.2s both; }
            @keyframes gz-in { to { opacity: 1; transform: none; } }
            @keyframes gz-fade { to { opacity: 1; } }
            #gz-stage.live #gz-login { pointer-events: auto; }
            @media (prefers-reduced-motion:reduce) {
              .play * { animation-duration: .01ms !important; animation-delay: 0s !important; }
            }
          `,
        }}
      />

      {/* Floating Replay Button */}
      {/* <button id="gz-replay" type="button"  onClick={playAnimation} title="Replay intro animation">
        ↺ Replay
      </button> */}

      {/* Scaled Responsive Canvas Container */}
      <div id="gz-wrap" ref={wrapRef} style={{ position: 'relative', margin: '0 auto' }}>
        <div id="gz-stage" ref={stageRef} className="play" style={{ width: 390, height: 844, position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', overflow: 'hidden', background: '#050505' }}>
          {/* Background Wall, Ceiling Lamp, Strip, Floor */}
          <div id="gz-wall" className="gz-abs" />
          <div id="gz-lamp" className="gz-abs" />
          <div id="gz-strip" className="gz-abs" />
          <div id="gz-floor" className="gz-abs" />

          {/* Speed Streaks, Green Energy Glow, and Road Line */}
          <div id="gz-streaks" className="gz-abs" />
          <div id="gz-glow" className="gz-abs" />
          <div id="gz-road" className="gz-abs" />

          {/* SVG Animated Bike */}
          <div id="gz-bikeW" className="gz-abs">
            <svg width="300" height="154" viewBox="0 0 300 154" aria-hidden="true" strokeLinejoin="round" strokeLinecap="round">
              <defs>
                <linearGradient id="gz-tr">
                  <stop offset="0" stopColor="#00E85D" stopOpacity="0" />
                  <stop offset="1" stopColor="#00E85D" />
                </linearGradient>
                <linearGradient id="gz-bm">
                  <stop offset="0" stopColor="#fff" stopOpacity=".9" />
                  <stop offset="1" stopColor="#00E85D" stopOpacity="0" />
                </linearGradient>
              </defs>
              <ellipse cx="150" cy="150" rx="128" ry="5" fill="#000" opacity=".55" />
              <rect id="gz-trail" x="-230" y="108" width="270" height="10" rx="5" fill="url(#gz-tr)" opacity="0" />
              <polygon id="gz-beam" points="236,66 345,28 345,106" fill="url(#gz-bm)" opacity="0" />
              <g className="gz-wh">
                <circle cx="66" cy="112" r="36" fill="#1f2321" stroke="#0a0a0a" strokeWidth="3.5" />
                <circle cx="66" cy="112" r="24" fill="#eef1ef" stroke="#0a0a0a" strokeWidth="3" />
                <path d="M66 90V134M44 112H88M50 96L82 128M82 96L50 128" stroke="#0a0a0a" strokeWidth="2.6" />
                <circle cx="66" cy="112" r="7" fill="#00E85D" stroke="#0a0a0a" strokeWidth="2.5" />
              </g>
              <g className="gz-wh">
                <circle cx="234" cy="112" r="36" fill="#1f2321" stroke="#0a0a0a" strokeWidth="3.5" />
                <circle cx="234" cy="112" r="24" fill="#eef1ef" stroke="#0a0a0a" strokeWidth="3" />
                <path d="M234 90V134M212 112H256M218 96L250 128M250 96L218 128" stroke="#0a0a0a" strokeWidth="2.6" />
                <circle cx="234" cy="112" r="7" fill="#00E85D" stroke="#0a0a0a" strokeWidth="2.5" />
              </g>
              <g id="gz-body" stroke="#0a0a0a" strokeWidth="3.5">
                <path d="M66 112L128 100" fill="none" strokeWidth="9" />
                <path d="M66 112L128 100" fill="none" stroke="#3b4340" strokeWidth="4" />
                <path d="M100 122L36 128" fill="none" strokeWidth="15" />
                <path d="M100 122L36 128" fill="none" stroke="#d7dcda" strokeWidth="9" />
                <rect x="112" y="82" width="68" height="40" rx="10" fill="#59625e" />
                <path d="M122 88H170M122 96H170" stroke="#2a302d" strokeWidth="3" />
                <circle cx="146" cy="108" r="13" fill="#9aa39f" />
                <circle cx="146" cy="108" r="5" fill="#59625e" />
                <path d="M104 66C116 36 190 32 212 54L204 80L108 80Z" fill="#00E85D" />
                <path d="M122 54C148 44 184 44 200 54" fill="none" stroke="#fff" strokeWidth="5" />
                <path d="M52 68C70 54 106 56 122 68L116 82L56 82Z" fill="#232826" />
                <path d="M42 66L54 64L56 76L44 76Z" fill="#ff4b4b" />
                <path d="M216 56L234 112" fill="none" strokeWidth="10" />
                <path d="M216 56L234 112" fill="none" stroke="#d7dcda" strokeWidth="5" />
                <path d="M218 84Q238 62 266 86" fill="none" strokeWidth="9" />
                <path d="M218 84Q238 62 266 86" fill="none" stroke="#00E85D" strokeWidth="4.5" />
                <path d="M208 52L230 44" fill="none" strokeWidth="8" />
                <path d="M208 52L230 44" fill="none" stroke="#3b4340" strokeWidth="3" />
                <path d="M228 44L226 28" fill="none" strokeWidth="3" />
                <ellipse cx="226" cy="26" rx="7" ry="4" fill="#9aa39f" strokeWidth="2.5" />
                <circle cx="228" cy="66" r="14" fill="#f4f6f5" />
                <circle cx="231" cy="66" r="7.5" fill="#fff3a8" strokeWidth="2.5" />
              </g>
            </svg>
          </div>

          {/* SVG Animated Mechanic */}
          <div id="gz-mech" className="gz-abs">
            <svg width="150" height="240" viewBox="0 0 150 240" aria-hidden="true" stroke="#0a0a0a" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
              <ellipse cx="66" cy="236" rx="46" ry="5" fill="#000" opacity=".6" stroke="none" />
              <path d="M50 140L42 226H64L70 150Z" fill="#d95a1c" />
              <path d="M66 140L80 226H102L90 140Z" fill="#ff7a2f" />
              <path d="M36 226h28v10H34z" fill="#1b1b1b" />
              <path d="M80 226h30q6 0 6 10H78z" fill="#1b1b1b" />
              <path d="M52 92L46 126" strokeWidth="19" fill="none" />
              <path d="M52 92L46 126" stroke="#d95a1c" strokeWidth="12" fill="none" />
              <circle cx="46" cy="132" r="8" fill="#c98a5b" />
              <path d="M44 80Q70 66 98 84L92 150H48Z" fill="#ff7a2f" />
              <path d="M70 74L82 98L94 82Z" fill="#d95a1c" />
              <rect x="54" y="108" width="16" height="14" rx="3" fill="#ff8a43" />
              <circle cx="62" cy="112" r="2.5" fill="#dfe5e8" strokeWidth="1.5" />
              <path d="M70 98V148" strokeWidth="2.5" fill="none" />
              <rect x="66" y="64" width="12" height="16" rx="5" fill="#b87a50" stroke="none" />
              <circle cx="55" cy="52" r="7" fill="#c98a5b" />
              <circle cx="76" cy="46" r="25" fill="#c98a5b" />
              <path d="M54 56Q58 80 78 78Q98 74 100 56Q90 68 77 66Q64 64 54 56Z" fill="#1a1410" strokeWidth="2.5" />
              <path d="M52 40Q52 18 77 18Q100 18 100 40Q82 32 52 40Z" fill="#161616" />
              <path d="M94 32L116 36Q118 41 112 42L96 42Z" fill="#161616" />
              <path d="M58 24Q76 17 94 24" fill="none" stroke="#00E85D" strokeWidth="3" />
              <circle cx="88" cy="48" r="4" fill="#0a0a0a" stroke="none" />
              <circle cx="89.5" cy="46.5" r="1.4" fill="#fff" stroke="none" />
              <path d="M82 40Q88 37 94 40" fill="none" strokeWidth="2.5" />
              <path d="M78 56Q86 60 96 55" fill="none" stroke="#1a1410" strokeWidth="3.5" />
              <path d="M80 63Q88 69 97 62" fill="none" stroke="#fff" strokeWidth="2.5" />
              <g id="gz-arm">
                <path d="M84 88L98 120" strokeWidth="22" fill="none" />
                <path d="M84 88L98 120" stroke="#ff7a2f" strokeWidth="15" fill="none" />
                <path d="M99 124L116 148" strokeWidth="15" fill="none" />
                <path d="M99 124L116 148" stroke="#c98a5b" strokeWidth="8.5" fill="none" />
                <path d="M92 110L103 128" stroke="#d95a1c" strokeWidth="16" fill="none" strokeLinecap="butt" />
                <circle cx="117" cy="149" r="7.5" fill="#c98a5b" />
                <g id="gz-wr">
                  <path d="M117 149L132 166" strokeWidth="10" fill="none" />
                  <path d="M117 149L132 166" stroke="#dfe5e8" strokeWidth="5" fill="none" />
                  <path d="M129 160A8 8 0 1 1 140 172" fill="none" strokeWidth="9" />
                  <path d="M129 160A8 8 0 1 1 140 172" fill="none" stroke="#dfe5e8" strokeWidth="4.5" />
                </g>
              </g>
            </svg>
          </div>

          {/* Animated Gearzo Brand Wordmark */}
          <div id="gz-brand" className="gz-abs">
            <div id="gz-wm">
              <i className="gz-sg" style={{ left: 0, width: 50.33, backgroundPosition: '0px 0', ['--d' as any]: '1.3s' }} />
              <i className="gz-sg" style={{ left: 50.33, width: 44.67, backgroundPosition: '-50.33px 0', ['--d' as any]: '1.45s' }} />
              <i className="gz-sg" style={{ left: 95.0, width: 34.33, backgroundPosition: '-95.00px 0', ['--d' as any]: '1.57s' }} />
              <i className="gz-sg" style={{ left: 129.33, width: 38.67, backgroundPosition: '-129.33px 0', ['--d' as any]: '1.69s' }} />
              <i className="gz-sg" style={{ left: 168.0, width: 24.67, backgroundPosition: '-168.00px 0', ['--d' as any]: '1.81s' }} />
              <i className="gz-sg" style={{ left: 192.67, width: 31.0, backgroundPosition: '-192.67px 0', ['--d' as any]: '1.93s' }} />
              <i className="gz-sg o" style={{ left: 223.67, width: 36.33, backgroundPosition: '-223.67px 0', ['--d' as any]: '2.05s' }} />
            </div>
            <p id="gz-tg">{tagline}</p>
          </div>

          {/* Login Form Screen (Fades/slides up at 3.0s) */}
          <div id="gz-login" className="gz-abs">
            <div style={{ height: 70 }} />
            {badge && <div className="gz-badge">{badge}</div>}
            <h1 className="gz-title">{title}</h1>
            <p className="gz-sub">{subtitle}</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isButtonEnabled) void handleSubmit();
              }}
            >
              <div className="gz-row">
                <div className="gz-cc">
                  +91 <span aria-hidden="true">▾</span>
                </div>
                <input
                  id="gz-ph"
                  className="gz-num"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Mobile number"
                  aria-label="Mobile number"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  autoComplete="tel-national"
                  autoFocus
                />
              </div>

              <button
                id="gz-go"
                type="submit"
                className={isButtonEnabled ? 'gz-on' : ''}
                disabled={!isButtonEnabled}
              >
                {isLoading ? 'Sending verification code...' : 'Continue'}
              </button>
            </form>

            <p id="gz-note" aria-live="polite">
              {displayError || ''}
            </p>
          </div>

          {/* Footer Terms */}
          <div id="gz-terms" className="gz-abs">
            By continuing you agree to our{' '}
            <a onClick={onTermsPress} role="button">
              Terms of Service
            </a>{' '}
            and{' '}
            <a onClick={onPrivacyPress} role="button">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

