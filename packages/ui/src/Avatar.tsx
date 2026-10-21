import React from 'react';
import { View, Text, Image, StyleProp, ViewStyle } from 'react-native';

export interface AvatarProps {
  name?: string;
  source?: { uri: string };
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  style?: StyleProp<ViewStyle>;
}

export const Avatar: React.FC<AvatarProps> = ({
  name = 'User',
  source,
  size: sizeProp = 44,
  style,
}) => {
  const sizeMap: Record<string, number> = { sm: 32, md: 44, lg: 56, xl: 72 };
  const size = typeof sizeProp === 'number' ? sizeProp : (sizeMap[sizeProp] || 44);

  const safeName = (name && name.trim()) || 'User';
  const initials = safeName
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (source?.uri) {
    return (
      <Image
        source={source}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#E5E7EB',
          },
          style as any,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#1B5E20',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: Math.floor(size * 0.4),
          fontWeight: '700',
        }}
      >
        {initials || 'G'}
      </Text>
    </View>
  );
};
