import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionTitle,
  onAction,
  style,
}) => {
  return (
    <View
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          backgroundColor: '#FAFAFA',
        },
        style,
      ]}
    >
      {icon && <View style={{ marginBottom: 16 }}>{icon}</View>}
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: '#111827',
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: '#6B7280',
          textAlign: 'center',
          lineHeight: 20,
          marginBottom: actionTitle && onAction ? 24 : 0,
        }}
      >
        {message}
      </Text>
      {actionTitle && onAction && (
        <Button title={actionTitle} onPress={onAction} variant="primary" size="md" />
      )}
    </View>
  );
};
