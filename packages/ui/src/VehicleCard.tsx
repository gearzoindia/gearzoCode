import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Card } from './Card';
import { Badge } from './Badge';

export interface VehicleCardProps {
  id: string;
  type: 'TWO_WHEELER' | 'FOUR_WHEELER' | 'COMMERCIAL';
  brand: string;
  model: string;
  registrationNumber: string;
  isDefault?: boolean;
  onPress?: () => void;
  onSetDefault?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  id: _id,
  type,
  brand,
  model,
  registrationNumber,
  isDefault = false,
  onPress,
  onSetDefault,
  style,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'TWO_WHEELER':
        return '🛵';
      case 'COMMERCIAL':
        return '🚚';
      case 'FOUR_WHEELER':
      default:
        return '🚗';
    }
  };

  return (
    <Card variant="default" style={style}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${brand} ${model} ${registrationNumber}`}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#DCFCE7',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Text style={{ fontSize: 22 }}>{getIcon()}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
                  {brand} {model}
                </Text>
                {isDefault && <Badge label="Default" variant="success" />}
              </View>
              <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2, letterSpacing: 0.5 }}>
                {registrationNumber}
              </Text>
            </View>
          </View>

          {!isDefault && onSetDefault && (
            <TouchableOpacity
              onPress={onSetDefault}
              accessibilityRole="button"
              accessibilityLabel="Make default vehicle"
              style={{ padding: 6 }}
            >
              <Text style={{ fontSize: 12, color: '#1B5E20', fontWeight: '600' }}>
                Make Default
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );
};
