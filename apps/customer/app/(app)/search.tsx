import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSearchServices } from '@gearzo/api-client';
import { ServiceCard } from '@gearzo/ui';

const SUGGESTED_SEARCHES = [
  'General Service',
  'Oil Change',
  'Brake Pads',
  'Chain Clean & Lube',
  'Battery Jump Start',
  'Clutch Cable Replacement',
  'Water Wash',
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const { data: results, isLoading } = useSearchServices(query);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <Text style={{ fontSize: 16, marginRight: 6 }}>🔍</Text>
          <TextInput
            style={styles.input}
            placeholder="Search services, repairs, packages..."
            value={query}
            onChangeText={setQuery}
            autoFocus
            clearButtonMode="while-editing"
            accessibilityLabel="Search service input"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={{ fontSize: 16, color: '#9CA3AF' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Suggested / Recent (When query is empty) */}
      {query.trim().length === 0 ? (
        <View style={styles.contentPadding}>
          <Text style={styles.sectionTitle}>Popular Searches</Text>
          <View style={styles.tagsContainer}>
            {SUGGESTED_SEARCHES.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.tag}
                onPress={() => setQuery(item)}
                accessibilityRole="button"
              >
                <Text style={styles.tagText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={results || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <ServiceCard
              name={item.name}
              durationMinutes={item.durationMinutes}
              pricePaise={item.basePricePaise}
              description={item.description}
              onSelect={() => router.push(`/services/${item.id}`)}
              style={{ marginBottom: 12 }}
            />
          )}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
                <Text style={styles.emptyTitle}>No services found</Text>
                <Text style={styles.emptyDesc}>
                  We couldn't find matching services for "{query}". Try checking your spelling or search another keyword.
                </Text>
              </View>
            ) : null
          }
        />
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  contentPadding: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
