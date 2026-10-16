import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
  leftIcon,
  rightIcon,
}) => {
  const isDisabled = disabled || loading;

  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: size === 'sm' ? 12 : size === 'lg' ? 24 : 16,
    paddingVertical: size === 'sm' ? 8 : size === 'lg' ? 14 : 12,
  };

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: '#1B5E20',
    },
    secondary: {
      backgroundColor: '#2E7D32',
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: '#1B5E20',
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: '#DC2626',
    },
  };

  const disabledStyles: ViewStyle = isDisabled
    ? {
        opacity: 0.5,
      }
    : {};

  const variantTextColors: Record<ButtonVariant, string> = {
    primary: '#FFFFFF',
    secondary: '#FFFFFF',
    outline: '#1B5E20',
    ghost: '#1B5E20',
    danger: '#FFFFFF',
  };

  const textSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[baseStyle, variantStyles[variant], disabledStyles, style]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? '#1B5E20' : '#FFFFFF'}
          size="small"
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            style={[
              {
                color: variantTextColors[variant],
                fontSize: textSize,
                fontWeight: '600',
                marginHorizontal: leftIcon || rightIcon ? 8 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};
