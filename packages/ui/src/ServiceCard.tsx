import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';

export interface ServiceCardProps {
  name: string;
  durationMinutes: number;
  pricePaise: number;
  originalPricePaise?: number;
  description?: string;
  badge?: string;
  onSelect?: () => void;
  onPressDetails?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  name,
  durationMinutes,
  pricePaise,
  originalPricePaise,
  description,
  badge,
  onSelect,
  onPressDetails,
  style,
}) => {
  const formattedPrice = `₹${(pricePaise / 100).toLocaleString('en-IN')}`;
  const formattedOriginalPrice = originalPricePaise
    ? `₹${(originalPricePaise / 100).toLocaleString('en-IN')}`
    : null;

  return (
    <Card variant="default" style={style}>
      <TouchableOpacity
        onPress={onPressDetails || onSelect}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${name}`}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>{name}</Text>
              {badge && <Badge label={badge} variant="warning" />}
            </View>
            <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 6 }}>
              ⏱ Takes ~{durationMinutes} mins
            </Text>
            {description && (
              <Text
                style={{ fontSize: 13, color: '#4B5563', lineHeight: 18 }}
                numberOfLines={2}
              >
                {description}
              </Text>
            )}
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 14,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1B5E20' }}>
              {formattedPrice}
            </Text>
            {formattedOriginalPrice && (
              <Text
                style={{
                  fontSize: 13,
                  color: '#9CA3AF',
                  textDecorationLine: 'line-through',
                }}
              >
                {formattedOriginalPrice}
              </Text>
            )}
          </View>

          {onSelect && (
            <Button
              title="Book Now"
              size="sm"
              variant="primary"
              onPress={onSelect}
              accessibilityLabel={`Book ${name}`}
            />
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );
};
