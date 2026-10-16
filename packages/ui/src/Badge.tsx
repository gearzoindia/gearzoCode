import React from 'react';
import { View, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'coming-soon' | 'neutral';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'info',
  style,
  textStyle,
}) => {
  const badgeConfig: Record<BadgeVariant, { bg: string; text: string; border?: string }> = {
    success: { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' },
    warning: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
    error: { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' },
    info: { bg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE' },
    'coming-soon': { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
    neutral: { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' },
  };

  const config = badgeConfig[variant];

  return (
    <View
      style={[
        {
          backgroundColor: config.bg,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 9999,
          alignSelf: 'flex-start',
          borderWidth: config.border ? 1 : 0,
          borderColor: config.border,
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            color: config.text,
            fontSize: 12,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};
