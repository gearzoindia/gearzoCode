import React, { forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  isPhoneInput?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      containerStyle,
      inputStyle,
      isPhoneInput = false,
      style,
      placeholderTextColor = '#9CA3AF',
      ...rest
    },
    ref
  ) => {
    return (
      <View style={[{ width: '100%', marginBottom: 16 }, containerStyle]}>
        {label && (
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 }}>
            {label}
          </Text>
        )}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: error ? '#DC2626' : '#D1D5DB',
            borderRadius: 8,
            minHeight: 48,
            paddingHorizontal: 12,
          }}
        >
          {isPhoneInput && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingRight: 8,
                marginRight: 8,
                borderRightWidth: 1,
                borderRightColor: '#E5E7EB',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>+91</Text>
            </View>
          )}

          {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}

          <TextInput
            ref={ref}
            placeholderTextColor={placeholderTextColor}
            style={[
              {
                flex: 1,
                fontSize: 16,
                color: '#111827',
                paddingVertical: 10,
              },
              inputStyle,
              style,
            ]}
            keyboardType={isPhoneInput ? 'phone-pad' : rest.keyboardType}
            maxLength={isPhoneInput ? 10 : rest.maxLength}
            {...rest}
          />

          {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
        </View>

        {error ? (
          <Text style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{error}</Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = 'Input';
