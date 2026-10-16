import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { Button } from './Button';

export interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error loading this information. Please try again.',
  onRetry,
  style,
}) => {
  return (
    <View
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          backgroundColor: '#FAFAFA',
        },
        style,
      ]}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#FEE2E2',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 28, color: '#DC2626' }}>!</Text>
      </View>
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
          marginBottom: 24,
        }}
      >
        {message}
      </Text>
      {onRetry && <Button title="Try Again" onPress={onRetry} variant="primary" />}
    </View>
  );
};
