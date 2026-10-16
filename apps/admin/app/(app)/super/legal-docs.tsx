import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, Input } from '@gearzo/ui';

export type LegalDocType =
  | 'TERMS_OF_SERVICE'
  | 'PARTNER_AGREEMENT'
  | 'PRIVACY_POLICY'
  | 'REFUND_POLICY';

export interface LegalDocumentVersion {
  id: string;
  docType: LegalDocType;
  title: string;
  version: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  effectiveDate: string;
  publishedBy: string;
  changeSummary: string;
  markdownContent: string;
}

const INITIAL_DOCS: LegalDocumentVersion[] = [
  {
    id: 'doc-tos-v2.1',
    docType: 'TERMS_OF_SERVICE',
    title: 'Customer Terms of Service & Warranty',
    version: 'v2.1',
    status: 'PUBLISHED',
    effectiveDate: '2026-10-01T00:00:00Z',
    publishedBy: 'Chief Legal Officer',
    changeSummary:
      'Incorporated 90-day / 1,000 km replacement part guarantee coverage and digital job start 4-digit OTP verification protocol.',
    markdownContent: `# GearZo Customer Terms of Service (v2.1)

1. Scope of Vehicle Services
GearZo operates an on-demand vehicle service marketplace connecting vehicle owners ("Customers") with certified independent automobile mechanics and workshops ("Partners").

2. Pre-Service Checklist & Start OTP Verification
Before any inspection or disassembly begins, Customer must provide the 4-digit Job Start OTP displayed in the Customer App. Service work conducted without verified OTP is strictly unauthorized.

3. Replacement Parts & Warranty
All genuine OEM / OES parts fitted by GearZo certified mechanics carry a mandatory 90-day or 1,000 km warranty against manufacturing defects.

4. Limitation of Liability
GearZo conducts background checks, skill assessments, and Aadhaar/PAN KYC on all partners. Platform liability is capped at the total booking value.`,
  },
  {
    id: 'doc-tos-v2.2-draft',
    docType: 'TERMS_OF_SERVICE',
    title: 'Customer Terms of Service & Warranty',
    version: 'v2.2',
    status: 'DRAFT',
    effectiveDate: '2026-11-01T00:00:00Z',
    publishedBy: 'Compliance Lead',
    changeSummary:
      'Added clause on EV battery health diagnostics and high-voltage safety disclaimers.',
    markdownContent: `# GearZo Customer Terms of Service (v2.2 Draft)

1. Electric Vehicle (EV) Special Provisions
For hybrid and battery electric vehicles (BEVs), high-voltage isolation checks must precede suspension and brake services.

2. Emergency SOS Response Times
Estimated arrival times under roadside assistance are algorithmic projections subject to traffic and weather conditions.`,
  },
  {
    id: 'doc-partner-v1.8',
    docType: 'PARTNER_AGREEMENT',
    title: 'Mechanic Partner Code of Conduct & Commission Structure',
    version: 'v1.8',
    status: 'PUBLISHED',
    effectiveDate: '2026-09-15T00:00:00Z',
    publishedBy: 'Partner Operations Lead',
    changeSummary:
      'Updated platform commission schedule: 12% on labour, 5% on OEM parts, and mandatory tool safety gear compliance.',
    markdownContent: `# GearZo Mechanic Partner Code of Conduct (v1.8)

1. Independent Contractor Relationship
The Partner acts as an independent service provider and not an employee of GearZo Technologies Pvt. Ltd.

2. Performance Score & Radar Dispatch Allocation
Partners maintaining a 4.5+ star rating and lower than 5% rejection rate receive priority dispatch within a 4.5 km radius.

3. Instant IMPS Payout Rules
Earnings accrue to the mechanic ledger instantly upon customer payment completion. Withdrawals are processed 24x7 via IMPS.`,
  },
  {
    id: 'doc-priv-v3.0',
    docType: 'PRIVACY_POLICY',
    title: 'Privacy Policy & India DPDP Act 2023 Compliance',
    version: 'v3.0',
    status: 'PUBLISHED',
    effectiveDate: '2026-08-01T00:00:00Z',
    publishedBy: 'Data Protection Officer',
    changeSummary:
      'Comprehensive overhaul aligning with Digital Personal Data Protection Act 2023, data fiduciary notice, and right to erasure.',
    markdownContent: `# GearZo Privacy Notice (DPDP Act 2023)

1. Data Collection & GPS Tracking
Real-time GPS telemetry is recorded during active booking transit to calculate arrival times and route navigation.

2. Consent & Data Retention
You retain the statutory right to request erasure of your vehicle registration and phone records subject to tax invoice retention laws (7 years).`,
  },
  {
    id: 'doc-ref-v2.0',
    docType: 'REFUND_POLICY',
    title: 'Cancellation, Dispute & Instant Refund Policy',
    version: 'v2.0',
    status: 'PUBLISHED',
    effectiveDate: '2026-09-01T00:00:00Z',
    publishedBy: 'Finance Operations Lead',
    changeSummary:
      'Introduced zero-penalty cancellation if mechanic arrives later than 15 minutes past promised ETA.',
    markdownContent: `# GearZo Cancellation & Refund Policy (v2.0)

1. Pre-Dispatch Cancellation
Free cancellation if cancelled before mechanic accepts dispatch offer.

2. Mechanic En-Route Cancellation
A nominal convenience fee of ₹99 is applicable if cancelled after mechanic has commenced travel towards the location.

3. Refund Timelines
UPI refunds are credited within 15 minutes. Debit/Credit card refunds reflect in 3-5 banking days.`,
  },
];

const DOC_TABS: { type: LegalDocType; label: string; icon: string }[] = [
  { type: 'TERMS_OF_SERVICE', label: 'Terms of Service', icon: '📜' },
  { type: 'PARTNER_AGREEMENT', label: 'Mechanic Agreement', icon: '🤝' },
  { type: 'PRIVACY_POLICY', label: 'Privacy & DPDP', icon: '🔒' },
  { type: 'REFUND_POLICY', label: 'Refund & Disputes', icon: '↩️' },
];

export default function LegalDocsScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<LegalDocType>('TERMS_OF_SERVICE');
  const [documents, setDocuments] = useState<LegalDocumentVersion[]>(INITIAL_DOCS);
  const [selectedDoc, setSelectedDoc] = useState<LegalDocumentVersion | null>(INITIAL_DOCS[0]);
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [editorSummary, setEditorSummary] = useState('');
  const [editorVersion, setEditorVersion] = useState('');

  const currentTabDocs = documents.filter((d) => d.docType === activeTab);

  const handleSelectTab = (tab: LegalDocType) => {
    setActiveTab(tab);
    const first = documents.find((d) => d.docType === tab);
    setSelectedDoc(first || null);
  };

  const handleOpenDraftEditor = () => {
    const activePublished = currentTabDocs.find((d) => d.status === 'PUBLISHED') || currentTabDocs[0];
    const prevVer = activePublished?.version.replace('v', '') || '1.0';
    const nextVer = `v${(parseFloat(prevVer) + 0.1).toFixed(1)}`;

    setEditorVersion(nextVer);
    setEditorSummary('');
    setEditorContent(activePublished?.markdownContent || '');
    setIsEditorVisible(true);
  };

  const handlePublishVersion = () => {
    if (!editorSummary.trim() || !editorContent.trim() || !editorVersion.trim()) {
      Alert.alert('Validation Error', 'Version number, change summary, and markdown content are required.');
      return;
    }

    // Archive previous published version of the same docType
    const updated = documents.map((d) =>
      d.docType === activeTab && d.status === 'PUBLISHED'
        ? { ...d, status: 'ARCHIVED' as const }
        : d
    );

    const newDoc: LegalDocumentVersion = {
      id: `doc-${activeTab.toLowerCase()}-${editorVersion}-${Date.now()}`,
      docType: activeTab,
      title: DOC_TABS.find((t) => t.type === activeTab)?.label || 'Legal Document',
      version: editorVersion.startsWith('v') ? editorVersion : `v${editorVersion}`,
      status: 'PUBLISHED',
      effectiveDate: new Date().toISOString(),
      publishedBy: 'Super Admin',
      changeSummary: editorSummary.trim(),
      markdownContent: editorContent.trim(),
    };

    setDocuments([newDoc, ...updated]);
    setSelectedDoc(newDoc);
    setIsEditorVisible(false);
    Alert.alert('Published', `New legal version ${newDoc.version} is now active and in effect.`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header bar */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Legal Documents & Compliance Versions</Text>
          <Text style={styles.headerSub}>
            Customer terms, mechanic partner bylaws, DPDP Act 2023 disclosures, and refund policies
          </Text>
        </View>

        <Button
          title="+ Publish New Revision"
          variant="primary"
          size="sm"
          onPress={handleOpenDraftEditor}
        />
      </View>

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        {DOC_TABS.map((tab) => {
          const isActive = activeTab === tab.type;
          return (
            <TouchableOpacity
              key={tab.type}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              onPress={() => handleSelectTab(tab.type)}
            >
              <Text style={{ fontSize: 16 }}>{tab.icon}</Text>
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main Split Layout: Left is versions list, Right is content preview */}
      <View style={styles.splitLayout}>
        {/* Left Column: Version History List */}
        <View style={styles.leftCol}>
          <Text style={styles.colHeader}>VERSION REVISIONS ({currentTabDocs.length})</Text>
          <FlatList
            data={currentTabDocs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedDoc?.id === item.id;
              return (
                <TouchableOpacity
                  style={[styles.verCard, isSelected && styles.verCardSelected]}
                  onPress={() => setSelectedDoc(item)}
                >
                  <View style={styles.verCardTop}>
                    <Text style={styles.verNumber}>{item.version}</Text>
                    <Badge
                      label={item.status}
                      variant={
                        item.status === 'PUBLISHED'
                          ? 'success'
                          : item.status === 'DRAFT'
                          ? 'warning'
                          : 'neutral'
                      }
                    />
                  </View>
                  <Text style={styles.verDate}>
                    Effective: {new Date(item.effectiveDate).toLocaleDateString()}
                  </Text>
                  <Text style={styles.verSummary} numberOfLines={2}>
                    {item.changeSummary}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Right Column: Markdown Document Viewer */}
        <View style={styles.rightCol}>
          {selectedDoc ? (
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <View style={styles.docHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docTitle}>{selectedDoc.title}</Text>
                  <Text style={styles.docMeta}>
                    Version {selectedDoc.version} • Published by {selectedDoc.publishedBy} •{' '}
                    {new Date(selectedDoc.effectiveDate).toLocaleString()}
                  </Text>
                </View>

                <Badge
                  label={selectedDoc.status}
                  variant={selectedDoc.status === 'PUBLISHED' ? 'success' : 'neutral'}
                />
              </View>

              <Card variant="default" style={styles.changeLogCard}>
                <Text style={styles.changeLogTitle}>Revision Summary / Changelog</Text>
                <Text style={styles.changeLogBody}>{selectedDoc.changeSummary}</Text>
              </Card>

              <View style={styles.markdownBox}>
                <Text style={styles.markdownContent}>{selectedDoc.markdownContent}</Text>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyCol}>
              <Text style={{ fontSize: 14, color: '#64748B' }}>Select a version to inspect.</Text>
            </View>
          )}
        </View>
      </View>

      {/* Editor Modal */}
      {isEditorVisible && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Publish New Document Revision</Text>
              <Text style={styles.modalSub}>
                {DOC_TABS.find((t) => t.type === activeTab)?.label}
              </Text>

              <ScrollView style={{ maxHeight: 460 }}>
                <Input
                  label="Version Tag (Semver)"
                  value={editorVersion}
                  onChangeText={setEditorVersion}
                  placeholder="e.g. v2.3"
                />

                <Input
                  label="Changelog / Summary of Legal Revisions"
                  value={editorSummary}
                  onChangeText={setEditorSummary}
                  placeholder="Summarize amendments, compliance references, or liability changes"
                  multiline={true}
                  numberOfLines={2}
                />

                <View style={{ marginBottom: 14 }}>
                  <Text style={styles.fieldLabel}>Markdown Text Content</Text>
                  <TextInput
                    style={styles.markdownInput}
                    multiline={true}
                    value={editorContent}
                    onChangeText={setEditorContent}
                    placeholder="Enter full markdown clauses here..."
                    placeholderTextColor="#94A3B8"
                    textAlignVertical="top"
                  />
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setIsEditorVisible(false)}
                />
                <Button
                  title="Publish & Activate Revision ⚖️"
                  variant="primary"
                  onPress={handlePublishVersion}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
    flexWrap: 'wrap',
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    gap: 8,
  },
  tabBtnActive: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  splitLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  leftCol: {
    width: 320,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  verCard: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  verCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  verCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  verNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  verDate: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
  },
  verSummary: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  rightCol: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  emptyCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  docTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  docMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  changeLogCard: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  changeLogTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  changeLogBody: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 18,
  },
  markdownBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
  },
  markdownContent: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 680,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  markdownInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#0F172A',
    minHeight: 180,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
});
