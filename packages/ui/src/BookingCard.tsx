import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Card } from './Card';
import { StatusChip } from './StatusChip';

export interface BookingCardProps {
  id: string;
  serviceName: string;
  vehicleSummary: string;
  scheduledAt: string;
  status: string;
  totalAmountPaise: number;
  onPress?: () => void;
  actionTitle?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  id,
  serviceName,
  vehicleSummary,
  scheduledAt,
  status,
  totalAmountPaise,
  onPress,
  actionTitle,
  onAction,
  style,
}) => {
  const formattedDate = new Date(scheduledAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedAmount = `₹${(totalAmountPaise / 100).toLocaleString('en-IN')}`;

  return (
    <Card variant="elevated" style={style}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Booking for ${serviceName}`}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '500' }}>
            ID: #{id.slice(0, 8)}
          </Text>
          <StatusChip status={status} />
        </View>

        <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 }}>
          {serviceName}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ fontSize: 14, color: '#4B5563' }}>🚗 {vehicleSummary}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 13, color: '#6B7280' }}>📅 {formattedDate}</Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#1B5E20' }}>
            {formattedAmount}
          </Text>

          {actionTitle && onAction && (
            <TouchableOpacity
              onPress={onAction}
              accessibilityRole="button"
              accessibilityLabel={actionTitle}
              style={{
                backgroundColor: '#1B5E20',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>
                {actionTitle}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );
};
