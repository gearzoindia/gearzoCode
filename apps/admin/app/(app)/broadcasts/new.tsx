import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Input } from '@gearzo/ui';

const AUDIENCES = ['ALL_CUSTOMERS', 'ALL_MECHANICS', 'ONLINE_MECHANICS_ONLY', 'REGISTERED_INACTIVE_USERS'];

export default function NewBroadcastScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState(AUDIENCES[0]);

  const handleSend = () => {
    if (!title || !message) {
      Alert.alert('Required', 'Please enter notification title and message.');
      return;
    }
    Alert.alert('Broadcast Dispatched', `Push notification broadcasted to ${audience.replace('_', ' ')}.`);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Push Broadcast</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.label}>Target Audience Segment *</Text>
          <View style={styles.audienceGrid}>
            {AUDIENCES.map((a) => {
              const isSelected = audience === a;
              return (
                <TouchableOpacity
                  key={a}
                  style={[styles.audChip, isSelected && styles.audChipActive]}
                  onPress={() => setAudience(a)}
                >
                  <Text style={[styles.audText, isSelected && styles.audTextActive]}>
                    {a.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ marginTop: 16 }}>
            <Input
              label="Notification Headline *"
              placeholder="e.g. Free 30-Point Vehicle Checkup This Weekend"
              value={title}
              onChangeText={setTitle}
            />

            <Input
              label="Message Body *"
              placeholder="e.g. Book your doorstep service and get flat 20% off on all spare parts."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={3}
            />

            <Button
              title="Broadcast Notification Now 📢"
              variant="primary"
              size="lg"
              onPress={handleSend}
              style={{ marginTop: 14 }}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  card: {
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  audienceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  audChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  audChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  audText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  audTextActive: {
    color: '#FFFFFF',
  },
});
