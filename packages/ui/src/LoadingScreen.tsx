import React from 'react';
import { View, ActivityIndicator, Text, StyleProp, ViewStyle } from 'react-native';

export interface LoadingScreenProps {
  message?: string;
  style?: StyleProp<ViewStyle>;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  style,
}) => {
  return (
    <View
      style={[
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FAFAFA',
          padding: 24,
        },
        style,
      ]}
    >
      <ActivityIndicator size="large" color="#1B5E20" />
      {message ? (
        <Text
          style={{
            marginTop: 16,
            fontSize: 15,
            color: '#4B5563',
            fontWeight: '500',
            textAlign: 'center',
          }}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
};
