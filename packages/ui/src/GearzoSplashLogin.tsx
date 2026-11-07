import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Image,
  useWindowDimensions,
} from 'react-native';
import { GEARZO_LOGO_BASE64 } from './assets/gearzo-logo-base64';
import {
  BikeSvg,
  MechanicSvg,
  CeilingLampSvg,
  GreenGlowSvg,
  GearzoLogoSvg,
} from './assets/GearzoSvgs';

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

const WALL_STRIPES = Array.from({ length: 10 }, (_, i) => i);

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
  const { width: winW, height: winH } = useWindowDimensions();
  const scale = Math.min(winW / 390, winH / 844);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [showBeam, setShowBeam] = useState(false);
  const [showTrail, setShowTrail] = useState(false);

  // Stage animation values matching Gearzo splash to login concept.html (0s -> 3.4s)
  const bgOpacity = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.6)).current;
  const roadOpacity = useRef(new Animated.Value(0)).current;

  // Mechanic (#mech)
  const mechX = useRef(new Animated.Value(0)).current;
  const mechOpacity = useRef(new Animated.Value(1)).current;
  const mechRotate = useRef(new Animated.Value(0)).current;

  // Bike (#bikeW)
  const bikeX = useRef(new Animated.Value(0)).current;
  const bikeY = useRef(new Animated.Value(0)).current;
  const bikeScale = useRef(new Animated.Value(1)).current;
  const bikeRotate = useRef(new Animated.Value(0)).current;

  // Brand wordmark + tagline (#brand)
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandScale = useRef(new Animated.Value(0.85)).current;
  const brandX = useRef(new Animated.Value(0)).current;
  const brandY = useRef(new Animated.Value(16)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(8)).current;

  // Login Form (#login) & Terms (#terms)
  const loginOpacity = useRef(new Animated.Value(0)).current;
  const loginY = useRef(new Animated.Value(14)).current;
  const termsOpacity = useRef(new Animated.Value(0)).current;

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const playAnimation = () => {
    clearTimers();

    // Reset all values to initial 0.0s state
    setShowBeam(false);
    setShowTrail(false);
    bgOpacity.setValue(1);
    glowOpacity.setValue(0);
    glowScale.setValue(0.6);
    roadOpacity.setValue(0);

    mechX.setValue(0);
    mechOpacity.setValue(1);
    mechRotate.setValue(0);

    bikeX.setValue(0);
    bikeY.setValue(0);
    bikeScale.setValue(1);
    bikeRotate.setValue(0);

    brandOpacity.setValue(0);
    brandScale.setValue(0.85);
    brandX.setValue(0);
    brandY.setValue(16);
    taglineOpacity.setValue(0);
    taglineY.setValue(8);

    loginOpacity.setValue(0);
    loginY.setValue(14);
    termsOpacity.setValue(0);

    // 1. Mechanic wrenching oscillation (0.0s - 0.85s) + exit left at 0.9s
    Animated.sequence([
      Animated.timing(mechRotate, { toValue: -1, duration: 220, useNativeDriver: true }),
      Animated.timing(mechRotate, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(mechRotate, { toValue: -1, duration: 220, useNativeDriver: true }),
      Animated.timing(mechRotate, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(mechX, {
          toValue: -190,
          duration: 500,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(mechOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 2. Green energy pulse (#glow at 0.8s)
    Animated.sequence([
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(glowOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(glowScale, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(glowOpacity, { toValue: 0, duration: 650, useNativeDriver: true }),
        Animated.timing(glowScale, { toValue: 1.15, duration: 650, useNativeDriver: true }),
      ]),
    ]).start();

    // Turn on headlight beam & trail at 1.2s
    timersRef.current.push(
      setTimeout(() => {
        setShowBeam(true);
        setShowTrail(true);
      }, 1200)
    );
    timersRef.current.push(
      setTimeout(() => {
        setShowTrail(false);
      }, 3100)
    );

    // 3. Bike ride off right (1.2s - 2.2s), teleport top-left, roll onto road line (2.3s - 3.2s)
    Animated.sequence([
      Animated.delay(1200),
      Animated.timing(bikeX, {
        toValue: 420,
        duration: 1000,
        easing: Easing.bezier(0.6, 0, 0.95, 0.55),
        useNativeDriver: true,
      }),
      // Instant reposition to top-left (-190, -570) at 2.2s
      Animated.parallel([
        Animated.timing(bikeX, { toValue: -190, duration: 1, useNativeDriver: true }),
        Animated.timing(bikeY, { toValue: -550, duration: 1, useNativeDriver: true }),
        Animated.timing(bikeScale, { toValue: 0.75, duration: 1, useNativeDriver: true }),
        Animated.timing(bikeRotate, { toValue: 1, duration: 1, useNativeDriver: true }),
      ]),
      Animated.delay(90),
      // Roll in onto login screen road line (2.3s - 3.2s)
      Animated.parallel([
        Animated.timing(bikeX, {
          toValue: 40,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(bikeY, {
          toValue: -236,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(bikeRotate, {
          toValue: 0,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 4. Brand wordmark pop (1.35s) + Tagline rise (2.25s) + Move up to login header (2.55s)
    Animated.sequence([
      Animated.delay(1350),
      Animated.parallel([
        Animated.timing(brandOpacity, { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.spring(brandScale, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.timing(brandY, { toValue: 0, duration: 550, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(2250),
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(taglineY, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
      // Move #brand up-left to login header at 2.55s
      Animated.parallel([
        Animated.timing(brandX, {
          toValue: -79,
          duration: 600,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(brandY, {
          toValue: -315,
          duration: 600,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(brandScale, {
          toValue: 0.677,
          duration: 600,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 5. Garage background dims to 0.18 (2.2s - 3.2s) & green #road fades in (2.6s - 3.2s)
    Animated.sequence([
      Animated.delay(2200),
      Animated.timing(bgOpacity, {
        toValue: 0.18,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(2600),
      Animated.timing(roadOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // 6. Login form & Footer terms fade in (3.0s - 3.5s)
    Animated.sequence([
      Animated.delay(3000),
      Animated.parallel([
        Animated.timing(loginOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(loginY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(termsOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  useEffect(() => {
    playAnimation();
    return () => clearTimers();
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
      // Handled by caller
    }
  };

  const displayError = errorMessage || localError;
  const isButtonEnabled = phoneNumber.length === 10 && !isLoading;

  const mechRotateDeg = mechRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-2.5deg', '0deg', '2.5deg'],
  });

  const bikeRotateDeg = bikeRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '12deg'],
  });

  return (
    <View style={styles.outerRoot}>
      {/* Floating Replay Button */}
      <TouchableOpacity
        style={styles.replayBtn}
        onPress={playAnimation}
        activeOpacity={0.8}
      >
        <Text style={styles.replayText}>↺ Replay</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.centerWrap}
      >
        {/* 390 x 844 Responsive Stage matching GearzoSplashLogin.web.tsx */}
        <View
          style={[
            styles.stage,
            {
              transform: [{ scale }],
            },
          ]}
        >
          {/* Dimming Garage Background (#wall, #lamp, #strip, #floor) */}
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, { opacity: bgOpacity }]}
          >
            {/* #wall repeating vertical garage panels */}
            <View style={styles.wall}>
              {WALL_STRIPES.map((i) => (
                <View key={i} style={styles.wallPanel}>
                  <View style={styles.wallSeam} />
                </View>
              ))}
            </View>

            {/* #lamp ceiling spotlight */}
            <View style={styles.lamp}>
              <CeilingLampSvg width={200} height={420} />
            </View>

            {/* #strip neon horizontal tube */}
            <View style={styles.strip} />

            {/* #floor dark garage floor */}
            <View style={styles.floor} />
          </Animated.View>

          {/* #glow green energy pulse */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glow,
              {
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              },
            ]}
          >
            <GreenGlowSvg width={130} height={120} />
          </Animated.View>

          {/* #road glowing green horizontal road line at top: 215 */}
          <Animated.View
            pointerEvents="none"
            style={[styles.road, { opacity: roadOpacity }]}
          />

          {/* #bikeW Animated Motorcycle SVG */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.bikeW,
              {
                transform: [
                  { translateX: bikeX },
                  { translateY: bikeY },
                  { scale: bikeScale },
                  { rotate: bikeRotateDeg },
                ],
              },
            ]}
          >
            <BikeSvg
              width={300}
              height={154}
              showBeam={showBeam}
              showTrail={showTrail}
            />
          </Animated.View>

          {/* #mech Animated Mechanic SVG */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.mech,
              {
                opacity: mechOpacity,
                transform: [
                  { translateX: mechX },
                  { rotate: mechRotateDeg },
                ],
              },
            ]}
          >
            <MechanicSvg width={150} height={240} />
          </Animated.View>

          {/* #brand Animated Gearzo Wordmark + Tagline */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.brand,
              {
                opacity: brandOpacity,
                transform: [
                  { translateX: brandX },
                  { translateY: brandY },
                  { scale: brandScale },
                ],
              },
            ]}
          >
            {!imageFailed ? (
              <Image
                source={{ uri: GEARZO_LOGO_BASE64 }}
                style={styles.brandLogoImg}
                resizeMode="contain"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <GearzoLogoSvg width={260} height={58} />
            )}
            <Animated.Text
              style={[
                styles.tagline,
                {
                  opacity: taglineOpacity,
                  transform: [{ translateY: taglineY }],
                },
              ]}
              numberOfLines={1}
            >
              {tagline}
            </Animated.Text>
          </Animated.View>

          {/* #login Form Container */}
          <Animated.View
            style={[
              styles.loginBox,
              {
                opacity: loginOpacity,
                transform: [{ translateY: loginY }],
              },
            ]}
          >
            <View style={{ height: 70 }} />
            {badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ) : null}

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.sub}>{subtitle}</Text>

            <View style={styles.inputRow}>
              <View style={styles.ccBox}>
                <Text style={styles.ccText}>+91 ▾</Text>
              </View>
              <TextInput
                style={styles.numInput}
                placeholder="Mobile number"
                placeholderTextColor="#8D948F"
                keyboardType="phone-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                selectionColor="#00E85D"
              />
            </View>

            <TouchableOpacity
              style={[styles.goBtn, isButtonEnabled && styles.goBtnOn]}
              disabled={!isButtonEnabled}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#050505" size="small" />
              ) : (
                <Text style={styles.goBtnText}>Continue</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.noteText}>{displayError || ''}</Text>
          </Animated.View>

          {/* #terms Footer */}
          <Animated.View style={[styles.termsWrap, { opacity: termsOpacity }]}>
            <Text style={styles.termsText}>
              By continuing you agree to our{' '}
              <Text style={styles.termsLink} onPress={onTermsPress}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text style={styles.termsLink} onPress={onPrivacyPress}>
                Privacy Policy
              </Text>
            </Text>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerRoot: {
    flex: 1,
    backgroundColor: '#050505',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  centerWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  replayBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 38,
    right: 16,
    zIndex: 99,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#2A2F2C',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  replayText: {
    color: '#CFD4D1',
    fontSize: 12,
    fontWeight: '600',
  },
  stage: {
    width: 390,
    height: 844,
    backgroundColor: '#050505',
    position: 'relative',
    overflow: 'hidden',
  },
  wall: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 470,
    backgroundColor: '#0D100E',
    flexDirection: 'row',
  },
  wallPanel: {
    width: 40,
    height: '100%',
    backgroundColor: '#0D100E',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  wallSeam: {
    width: 2,
    height: '100%',
    backgroundColor: '#090B0A',
  },
  lamp: {
    position: 'absolute',
    left: 95,
    top: -10,
    width: 200,
    height: 420,
  },
  strip: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 250,
    height: 3,
    backgroundColor: '#00E85D',
    opacity: 0.55,
    shadowColor: '#00E85D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 12,
    elevation: 6,
  },
  floor: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 470,
    bottom: 0,
    backgroundColor: '#0E1210',
    borderTopWidth: 1,
    borderTopColor: '#222925',
  },
  glow: {
    position: 'absolute',
    left: 138,
    top: 357,
    width: 130,
    height: 120,
  },
  road: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: 215,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#00E85D',
    shadowColor: '#00E85D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 5,
  },
  bikeW: {
    position: 'absolute',
    left: 45,
    top: 322,
    width: 300,
    height: 154,
  },
  mech: {
    position: 'absolute',
    left: 85,
    top: 250,
    width: 150,
    height: 240,
  },
  brand: {
    position: 'absolute',
    left: 65,
    top: 540,
    width: 260,
    height: 95,
  },
  brandLogoImg: {
    width: 260,
    height: 58.3,
  },
  tagline: {
    marginTop: 14,
    fontSize: 19,
    lineHeight: 24,
    color: '#00E85D',
    fontWeight: '600',
  },
  loginBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 240,
    paddingHorizontal: 28,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 232, 93, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 232, 93, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: {
    color: '#00E85D',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: 44,
    marginBottom: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sub: {
    marginBottom: 24,
    color: '#8D948F',
    fontSize: 14,
    lineHeight: 21,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ccBox: {
    width: 86,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: '#0D0F0E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ccText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  numInput: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: '#0D0F0E',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    letterSpacing: 0.9,
  },
  goBtn: {
    marginTop: 16,
    width: '100%',
    height: 54,
    borderRadius: 14,
    backgroundColor: '#00E85D',
    opacity: 0.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goBtnOn: {
    opacity: 1,
  },
  goBtnText: {
    color: '#050505',
    fontSize: 16,
    fontWeight: '700',
  },
  noteText: {
    minHeight: 18,
    marginTop: 10,
    marginLeft: 2,
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  termsWrap: {
    position: 'absolute',
    left: 28,
    right: 28,
    bottom: 32,
    alignItems: 'center',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16.5,
    color: '#6F7671',
  },
  termsLink: {
    color: '#B5BBB7',
    textDecorationLine: 'underline',
  },
});
