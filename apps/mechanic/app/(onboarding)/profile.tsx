import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card } from '@gearzo/ui';
import { useSaveMechanicProfile } from '@gearzo/api-client';

const LANGUAGES = ['Hindi', 'English', 'Kannada', 'Tamil', 'Telugu', 'Marathi'];

export default function OnboardingProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mechanicType?: string }>();
  const isShop = params.mechanicType === 'SHOP';

  const [fullName, setFullName] = useState('');
  const [shopName, setShopName] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [dob, setDob] = useState('1994-05-15');
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['Hindi', 'English']);
  const [photoAdded, setPhotoAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const saveProfileMutation = useSaveMechanicProfile();

  const toggleLanguage = (lang: string) => {
    if (selectedLangs.includes(lang)) {
      setSelectedLangs(selectedLangs.filter((l) => l !== lang));
    } else {
      setSelectedLangs([...selectedLangs, lang]);
    }
  };

  const handleContinue = async () => {
    setErrorMsg(null);
    if (!fullName.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (isShop && !shopName.trim()) {
      setErrorMsg('Garage / Workshop name is required.');
      return;
    }

    try {
      await saveProfileMutation.mutateAsync({
        fullName: fullName.trim(),
        shopName: isShop ? shopName.trim() : undefined,
        experienceYears: parseInt(experienceYears, 10) || 1,
      });
    } catch {
      // Proceed
    }

    router.push('/(onboarding)/skills');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header Progress */}
      <View style={styles.header}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: '32%' }]} />
        </View>
        <Text style={styles.stepCount}>Step 2 of 6: Profile & Experience</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1, justifyContent: 'space-between' }}>
        <View>
          <Text style={styles.title}>Basic Profile Information</Text>
          <Text style={styles.subtitle}>
            Tell us about your background and automotive repair expertise.
          </Text>

          {/* Photo Picker Simulator */}
          <TouchableOpacity
            style={styles.photoPicker}
            onPress={() => setPhotoAdded(!photoAdded)}
            accessibilityRole="button"
          >
            <View style={styles.avatarCircle}>
              <Text style={{ fontSize: 32 }}>{photoAdded ? '👨‍🔧' : '📷'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.photoTitle}>
                {photoAdded ? 'Profile Photo Added ✓' : 'Upload Profile Photo'}
              </Text>
              <Text style={styles.photoSub}>A clear headshot builds high trust with customers</Text>
            </View>
          </TouchableOpacity>

          <View style={{ marginTop: 20 }}>
            <Input
              label="Full Legal Name *"
              placeholder="e.g. Ramesh Kumar"
              value={fullName}
              onChangeText={setFullName}
            />

            {isShop && (
              <Input
                label="Garage / Workshop Name *"
                placeholder="e.g. Shiva Auto Garage & Spares"
                value={shopName}
                onChangeText={setShopName}
              />
            )}

            <Input
              label="Years of Experience *"
              placeholder="5"
              keyboardType="number-pad"
              value={experienceYears}
              onChangeText={setExperienceYears}
            />

            <Input
              label="Date of Birth (YYYY-MM-DD)"
              placeholder="1994-05-15"
              value={dob}
              onChangeText={setDob}
            />

            <Text style={styles.label}>Languages Spoken</Text>
            <View style={styles.langRow}>
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLangs.includes(lang);
                return (
                  <TouchableOpacity
                    key={lang}
                    style={[styles.langChip, isSelected && styles.langChipActive]}
                    onPress={() => toggleLanguage(lang)}
                  >
                    <Text style={[styles.langText, isSelected && styles.langTextActive]}>
                      {lang}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        </View>

        <View style={{ paddingTop: 24 }}>
          <Button
            title="Continue to Skills →"
            variant="primary"
            size="lg"
            loading={saveProfileMutation.isPending}
            onPress={handleContinue}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1B5E20',
  },
  stepCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  photoPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 14,
    padding: 14,
    marginTop: 18,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  photoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  photoSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  langChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  langChipActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#1B5E20',
  },
  langText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  langTextActive: {
    color: '#1B5E20',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 10,
  },
});
