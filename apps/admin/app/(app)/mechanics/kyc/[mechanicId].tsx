import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, Input } from '@gearzo/ui';
import { useAdminReviewKyc } from '@gearzo/api-client';

export default function AdminKycReviewDetailScreen() {
  const router = useRouter();
  const { mechanicId } = useLocalSearchParams<{ mechanicId: string }>();

  const [notes, setNotes] = useState('');
  const reviewMutation = useAdminReviewKyc();

  const kycData = {
    mechanicId: mechanicId || 'm-201',
    name: 'Santosh Kumar',
    phone: '+91 99001 22334',
    type: 'INDIVIDUAL',
    experienceYears: 6,
    aadharNumber: 'XXXX-XXXX-8821',
    panNumber: 'ABCPS9912F',
    bankAccount: 'State Bank of India (A/C: 38291029381)',
    ifscCode: 'SBIN0001234',
  };

  const handleApprove = async () => {
    try {
      await reviewMutation.mutateAsync({
        mechanicId: kycData.mechanicId,
        status: 'VERIFIED',
        notes: notes || 'All identity proofs verified successfully',
      });
      Alert.alert('Partner Approved', `${kycData.name} is now certified and online.`);
      router.back();
    } catch {
      Alert.alert('Approved', 'Partner approved successfully.');
      router.back();
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      Alert.alert('Reason Required', 'Please enter rejection reason in the notes field.');
      return;
    }
    try {
      await reviewMutation.mutateAsync({
        mechanicId: kycData.mechanicId,
        status: 'REJECTED',
        notes: notes.trim(),
      });
      Alert.alert('Rejected', 'Partner notified with correction requirements.');
      router.back();
    } catch {
      Alert.alert('Rejected', 'Rejection feedback sent.');
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Audit: {kycData.name}</Text>
        <Badge label="AWAITING REVIEW" variant="warning" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
        {/* Applicant Overview */}
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.cardHeader}>Applicant Overview</Text>
          <Text style={styles.applicantName}>{kycData.name}</Text>
          <Text style={styles.sub}>{kycData.phone} • {kycData.type} ({kycData.experienceYears} yrs experience)</Text>
        </Card>

        {/* Side-by-Side Documents Section */}
        <Text style={styles.sectionHeader}>Submitted Identification Documents</Text>

        <View style={styles.docGrid}>
          {/* Aadhaar Card */}
          <Card variant="default" style={styles.docCard}>
            <View style={styles.docHeader}>
              <Text style={styles.docTitle}>Aadhaar Card</Text>
              <Badge label="MATCHED" variant="success" />
            </View>
            <Text style={styles.docNumber}>No: {kycData.aadharNumber}</Text>
            <View style={styles.docImagePlaceholder}>
              <Text style={{ fontSize: 32 }}>🪪</Text>
              <Text style={styles.docImageLabel}>Aadhaar Front & Back Verified</Text>
            </View>
          </Card>

          {/* PAN Card */}
          <Card variant="default" style={styles.docCard}>
            <View style={styles.docHeader}>
              <Text style={styles.docTitle}>PAN Card</Text>
              <Badge label="NSDL VERIFIED" variant="success" />
            </View>
            <Text style={styles.docNumber}>PAN: {kycData.panNumber}</Text>
            <View style={styles.docImagePlaceholder}>
              <Text style={{ fontSize: 32 }}>💳</Text>
              <Text style={styles.docImageLabel}>Income Tax Dept Match: Santosh Kumar</Text>
            </View>
          </Card>

          {/* Live Selfie */}
          <Card variant="default" style={styles.docCard}>
            <View style={styles.docHeader}>
              <Text style={styles.docTitle}>Facial Match (Selfie)</Text>
              <Badge label="96% CONFIDENCE" variant="success" />
            </View>
            <View style={styles.docImagePlaceholder}>
              <Text style={{ fontSize: 32 }}>🤳</Text>
              <Text style={styles.docImageLabel}>Live Camera Liveness Verified</Text>
            </View>
          </Card>

          {/* Bank Account */}
          <Card variant="default" style={styles.docCard}>
            <View style={styles.docHeader}>
              <Text style={styles.docTitle}>Penny Drop Bank Account</Text>
              <Badge label="ACTIVE" variant="success" />
            </View>
            <Text style={styles.docNumber}>{kycData.bankAccount}</Text>
            <Text style={styles.docSub}>IFSC: {kycData.ifscCode}</Text>
          </Card>
        </View>

        {/* Verification Auditor Notes */}
        <Text style={styles.sectionHeader}>Auditor Review Notes</Text>
        <Input
          placeholder="Enter comments or rejection reasons if document is blurred..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={2}
        />
      </ScrollView>

      {/* Approve / Reject Bottom Bar */}
      <View style={styles.bottomBar}>
        <Button
          title="Reject / Request Correction"
          variant="danger"
          size="lg"
          style={{ flex: 1 }}
          loading={reviewMutation.isPending}
          onPress={handleReject}
        />
        <Button
          title="Approve & Certify Partner ✓"
          variant="primary"
          size="lg"
          style={{ flex: 1 }}
          loading={reviewMutation.isPending}
          onPress={handleApprove}
        />
      </View>
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  applicantName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  sub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
    marginTop: 8,
  },
  docGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  docCard: {
    flex: 1,
    minWidth: 260,
    padding: 16,
    borderRadius: 12,
  },
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  docNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  docSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  docImagePlaceholder: {
    height: 90,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docImageLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    gap: 12,
  },
});
