import React from 'react';
import { View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'flat';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  onPress,
  accessibilityLabel,
}) => {
  const variantStyles: Record<CardVariant, ViewStyle> = {
    default: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      padding: 16,
    },
    outlined: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: '#D1D5DB',
      padding: 16,
    },
    elevated: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    flat: {
      backgroundColor: '#F3F4F6',
      borderRadius: 12,
      padding: 16,
    },
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={[variantStyles[variant], style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[variantStyles[variant], style]}>{children}</View>;
};
