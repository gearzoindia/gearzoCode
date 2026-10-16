import React from 'react';
import { View, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';

export type BookingStatusType =
  | 'DRAFT'
  | 'SEARCHING'
  | 'ASSIGNED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface StatusChipProps {
  status: BookingStatusType | string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, style, textStyle }) => {
  const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
    DRAFT: { bg: '#F3F4F6', text: '#4B5563', label: 'Draft' },
    SEARCHING: { bg: '#FEF3C7', text: '#B45309', label: 'Finding Mechanic' },
    ASSIGNED: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Mechanic Assigned' },
    ON_THE_WAY: { bg: '#E0E7FF', text: '#4338CA', label: 'On The Way' },
    ARRIVED: { bg: '#EDE9FE', text: '#6D28D9', label: 'Mechanic Arrived' },
    IN_PROGRESS: { bg: '#FEF9C3', text: '#854D0E', label: 'In Progress' },
    COMPLETED: { bg: '#DCFCE7', text: '#15803D', label: 'Completed' },
    CANCELLED: { bg: '#FEE2E2', text: '#B91C1C', label: 'Cancelled' },
  };

  const config = statusStyles[status] || {
    bg: '#F3F4F6',
    text: '#4B5563',
    label: status.replace(/_/g, ' '),
  };

  return (
    <View
      style={[
        {
          backgroundColor: config.bg,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 12,
          alignSelf: 'flex-start',
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
          },
          textStyle,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};
