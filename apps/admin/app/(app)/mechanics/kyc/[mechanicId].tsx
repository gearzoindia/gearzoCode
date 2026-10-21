import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, Input, LoadingScreen, EmptyState } from '@gearzo/ui';
import { useAdminMechanicDetail, useAdminReviewKyc } from '@gearzo/api-client';

export default function AdminKycReviewDetailScreen() {
  const router = useRouter();
  const { mechanicId } = useLocalSearchParams<{ mechanicId: string }>();

  const [notes, setNotes] = useState('');
  const { data: mechanic, isLoading, error } = useAdminMechanicDetail(mechanicId || '');
  const reviewMutation = useAdminReviewKyc();

  if (isLoading) {
    return <LoadingScreen message="Loading KYC submission..." />;
  }

  if (error || !mechanic) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>KYC Verification</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <EmptyState
            title="Submission Not Found"
            description="The requested partner KYC record could not be retrieved from the database."
            buttonTitle="Return to KYC Queue"
            onAction={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const displayName = mechanic.name || mechanic.phone || 'Mechanic Partner';

  const handleApprove = async () => {
    try {
      await reviewMutation.mutateAsync({
        mechanicId: mechanic.id,
        status: 'VERIFIED',
        notes: notes || 'All identity proofs verified successfully',
      });
      Alert.alert('Partner Approved', `${displayName} is now certified and eligible for job dispatch.`);
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Approval action failed.');
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      Alert.alert('Reason Required', 'Please enter rejection reason in the audit notes field.');
      return;
    }
    try {
      await reviewMutation.mutateAsync({
        mechanicId: mechanic.id,
        status: 'REJECTED',
        notes: notes.trim(),
      });
      Alert.alert('Rejected', 'Partner notified with correction requirements.');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Rejection action failed.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Audit: {displayName}</Text>
        <Badge
          label={mechanic.status || 'SUBMITTED'}
          variant={mechanic.status === 'VERIFIED' ? 'success' : 'warning'}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
        {/* Applicant Overview */}
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.cardHeader}>Applicant Overview</Text>
          <Text style={styles.applicantName}>{displayName}</Text>
          <Text style={styles.sub}>
            {mechanic.phone} • {mechanic.registrationType || 'INDIVIDUAL'}
            {mechanic.profile?.experienceYears ? ` • ${mechanic.profile.experienceYears} yrs experience` : ''}
          </Text>
          {mechanic.profile?.shopName && (
            <Text style={[styles.sub, { marginTop: 4 }]}>Workshop: {mechanic.profile.shopName}</Text>
          )}
        </Card>

        {/* Submitted Documents Section */}
        <Text style={styles.sectionHeader}>Submitted Identification Documents</Text>

        <View style={styles.docGrid}>
          {mechanic.documents && mechanic.documents.length > 0 ? (
            mechanic.documents.map((doc: any, i: number) => (
              <Card key={doc.id || i} variant="default" style={styles.docCard}>
                <View style={styles.docHeader}>
                  <Text style={styles.docTitle}>{doc.type || 'ID Document'}</Text>
                  <Badge label={doc.status || 'SUBMITTED'} variant="warning" />
                </View>
                <Text style={styles.docNumber}>Document #{doc.documentNumber || doc.id.slice(0, 8)}</Text>
                <View style={styles.docImagePlaceholder}>
                  <Text style={{ fontSize: 32 }}>🪪</Text>
                  <Text style={styles.docImageLabel}>Document File Uploaded</Text>
                </View>
              </Card>
            ))
          ) : (
            <Card variant="default" style={[styles.docCard, { width: '100%' }]}>
              <View style={{ alignItems: 'center', padding: 20 }}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>📄</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>
                  No External ID Files Attached
                </Text>
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4, textAlign: 'center' }}>
                  Partner profile registered via OTP phone verification.
                </Text>
              </View>
            </Card>
          )}

          {/* Bank Account Details */}
          {mechanic.bankAccount && (
            <Card variant="default" style={styles.docCard}>
              <View style={styles.docHeader}>
                <Text style={styles.docTitle}>Payout Bank Account</Text>
                <Badge label="RECORDED" variant="success" />
              </View>
              <Text style={styles.docNumber}>
                {mechanic.bankAccount.bankName || 'Bank'} (A/C: {mechanic.bankAccount.accountNumber})
              </Text>
              <Text style={styles.docSub}>IFSC: {mechanic.bankAccount.ifscCode}</Text>
            </Card>
          )}
        </View>

        {/* Verification Auditor Notes */}
        <Text style={styles.sectionHeader}>Auditor Review Notes</Text>
        <Input
          placeholder="Enter audit comments or rejection reasons if document is blurred..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={2}
        />
      </ScrollView>

      {/* Decision Bar */}
      <View style={styles.bottomBar}>
        <Button
          title="Reject Submission"
          variant="danger"
          size="lg"
          style={{ flex: 1 }}
          disabled={reviewMutation.isPending}
          onPress={handleReject}
        />
        <Button
          title="Approve & Certify ✓"
          variant="primary"
          size="lg"
          style={{ flex: 1 }}
          disabled={reviewMutation.isPending}
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
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
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
    color: '#475569',
    fontWeight: '500',
  },
  docSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  docImagePlaceholder: {
    height: 100,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  docImageLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
});
