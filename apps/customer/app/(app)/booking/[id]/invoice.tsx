import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Avatar, Badge } from '@gearzo/ui';

export default function BookingInvoiceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['On Time', 'Clean Work']);
  const [hasSubmittedRating, setHasSubmittedRating] = useState(false);

  const feedbackTags = ['On Time', 'Polite & Friendly', 'Clean Work', 'Expert Mechanic', 'Quick Service'];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRatingSubmit = () => {
    setHasSubmittedRating(true);
    Alert.alert('Thank You!', 'Your rating & feedback have been recorded.');
  };

  const handleDownloadInvoice = () => {
    Alert.alert('Invoice Downloaded', 'Tax invoice PDF has been saved to your downloads.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(app)/(tabs)/bookings')} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Invoice & Rating</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Success Tag */}
        <View style={styles.successTag}>
          <Text style={{ fontSize: 28, marginRight: 8 }}>✅</Text>
          <View>
            <Text style={styles.successTitle}>Service Completed Successfully</Text>
            <Text style={styles.successSub}>Thank you for choosing GearZo</Text>
          </View>
        </View>

        {/* Invoice Card */}
        <Card variant="elevated" style={styles.invoiceCard}>
          <View style={styles.invoiceHeader}>
            <View>
              <Text style={styles.invoiceBrand}>GEARZO TAX INVOICE</Text>
              <Text style={styles.invoiceNumber}>INV-{(id || '88392').slice(0, 8).toUpperCase()}</Text>
            </View>
            <Badge label="PAID" variant="success" />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.itemTitle}>Standard Periodic Service</Text>
            <Text style={styles.itemPrice}>₹999.00</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.itemTitle}>Approved Extra: Clutch Cable</Text>
            <Text style={styles.itemPrice}>₹380.00</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.itemTitle}>Convenience & Safety Fee</Text>
            <Text style={styles.itemPrice}>₹49.00</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.itemTitle}>GST (18% on Labor & Parts)</Text>
            <Text style={styles.itemPrice}>₹257.00</Text>
          </View>

          <View style={styles.divider} />

          <View style={[styles.row, { marginTop: 4 }]}>
            <Text style={styles.totalTitle}>Total Amount Paid</Text>
            <Text style={styles.totalPrice}>₹1,685.00</Text>
          </View>

          <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadInvoice}>
            <Text style={styles.downloadText}>📥 Download PDF Tax Invoice</Text>
          </TouchableOpacity>
        </Card>

        {/* Mechanic Rating & Review */}
        <Text style={styles.sectionHeader}>Rate your Mechanic</Text>
        <Card variant="default" style={styles.ratingCard}>
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <Avatar name="Ramesh Kumar" size="lg" />
            <Text style={styles.mechanicName}>Ramesh Kumar</Text>
            <Text style={styles.mechanicSub}>Master Technician</Text>

            {/* 5-Star Row */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text style={[styles.starText, star <= rating && styles.starActive]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Feedback Tags */}
          <Text style={styles.tagPrompt}>What did you like about the service?</Text>
          <View style={styles.tagsRow}>
            {feedbackTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tag, isSelected && styles.tagSelected]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title={hasSubmittedRating ? 'Feedback Recorded ✓' : 'Submit Review'}
            variant={hasSubmittedRating ? 'outline' : 'primary'}
            size="md"
            disabled={hasSubmittedRating}
            onPress={handleRatingSubmit}
            style={{ marginTop: 16 }}
          />
        </Card>

        {/* Back to Home CTA */}
        <View style={{ marginTop: 24 }}>
          <Button
            title="Back to Home"
            variant="ghost"
            size="lg"
            onPress={() => router.replace('/(app)/(tabs)')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  successTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#166534',
  },
  successSub: {
    fontSize: 12,
    color: '#15803D',
    marginTop: 2,
  },
  invoiceCard: {
    padding: 20,
    borderRadius: 14,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceBrand: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 1,
  },
  invoiceNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 13,
    color: '#4B5563',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  totalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B5E20',
  },
  downloadBtn: {
    marginTop: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  downloadText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B5E20',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  ratingCard: {
    padding: 20,
    borderRadius: 14,
  },
  mechanicName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  mechanicSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  starText: {
    fontSize: 32,
    color: '#D1D5DB',
  },
  starActive: {
    color: '#F59E0B',
  },
  tagPrompt: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#1B5E20',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  tagTextSelected: {
    color: '#1B5E20',
  },
});
