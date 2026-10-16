import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  onResend?: () => void;
  resendCountdownSeconds?: number;
  style?: StyleProp<ViewStyle>;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  onResend,
  resendCountdownSeconds = 30,
  style,
}) => {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [countdown, setCountdown] = useState<number>(resendCountdownSeconds);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleTextChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 1) {
      // Paste detected
      const pasted = cleaned.slice(0, length);
      onChange(pasted);
      const nextFocus = Math.min(pasted.length, length - 1);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const currentDigits = value.split('');
    currentDigits[index] = cleaned;
    const newOtp = currentDigits.join('');
    onChange(newOtp);

    if (cleaned && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendPress = () => {
    if (countdown === 0 && onResend) {
      setCountdown(resendCountdownSeconds);
      onResend();
    }
  };

  return (
    <View style={[{ width: '100%', alignItems: 'center' }, style]}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
        {Array.from({ length }).map((_, index) => {
          const digit = value[index] || '';
          return (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(text) => handleTextChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={index === 0 ? length : 1}
              selectTextOnFocus
              style={{
                width: 46,
                height: 52,
                borderWidth: 1.5,
                borderColor: digit ? '#1B5E20' : '#D1D5DB',
                borderRadius: 8,
                textAlign: 'center',
                fontSize: 22,
                fontWeight: '700',
                color: '#111827',
                backgroundColor: '#FFFFFF',
              }}
              accessibilityLabel={`OTP digit ${index + 1}`}
            />
          );
        })}
      </View>

      {onResend && (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: '#6B7280' }}>Didn't receive code? </Text>
          {countdown > 0 ? (
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1B5E20' }}>
              Resend in {countdown}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendPress} accessibilityRole="button">
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1B5E20' }}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};
