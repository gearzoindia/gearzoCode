import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useHome, useVehicles, useServices } from '@gearzo/api-client';
import { LoadingScreen, ErrorScreen } from '@gearzo/ui';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: homeData, isLoading, isError, refetch, isRefetching } = useHome();
  const { data: vehicles } = useVehicles();
  const { data: quickServices } = useServices('cat_book_mechanic', 'TWO_WHEELER');

  const vehicleList = Array.isArray(vehicles) ? vehicles : [];
  const primaryVehicle =
    vehicleList.find((v) => v.isDefault) ||
    vehicleList[0] ||
    null;

  const userName = user?.name ? user.name.split(' ')[0] : (user?.phone || 'Customer');
  const userCity = user?.city || 'Select Location';

  if (isLoading && !isRefetching) {
    return <LoadingScreen message="Loading GearZo services..." />;
  }

  if (isError) {
    return <ErrorScreen message="Failed to load dashboard." onRetry={refetch} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#16A34A" />
        }
      >
        {/* 1. Header (Screen 1): Greeting, Address with Dropdown, Bell Icon */}
        <View style={styles.hh}>
          <View>
            <Text style={styles.greetingTitle}>Hey, {userName} 👋</Text>
            <TouchableOpacity
              style={styles.locationRow}
              onPress={() => router.push('/addresses')}
              activeOpacity={0.8}
            >
              <Text style={styles.pinIcon}>📍</Text>
              <Text style={styles.locationText} numberOfLines={1}>
                {userCity}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => router.push('/profile/upcoming')}
          >
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Search Bar: "Search service, repair or mechanic…" */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/search')}
          activeOpacity={0.9}
        >
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <Text style={styles.searchPlaceholder}>
            Search service, repair or mechanic…
          </Text>
        </TouchableOpacity>

        {/* 3. Selected Vehicle Card (Screen 1) */}
        {primaryVehicle ? (
          <TouchableOpacity
            style={styles.vehicleCard}
            onPress={() =>
              router.push({
                pathname: '/services',
                params: { vehicleType: primaryVehicle.type, vehicleId: primaryVehicle.id },
              })
            }
            activeOpacity={0.9}
          >
            <View style={styles.vehicleIconBox}>
              <Text style={{ fontSize: 20 }}>
                {primaryVehicle.type === 'FOUR_WHEELER' ? '🚗' : '🏍️'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleTitle}>
                {primaryVehicle.brand ? `${primaryVehicle.brand} ` : ''}{primaryVehicle.model}{' '}
                {primaryVehicle.registrationNumber ? (
                  <Text style={styles.vehicleReg}>
                    ({primaryVehicle.registrationNumber})
                  </Text>
                ) : null}
              </Text>
              <View style={styles.chipsRow}>
                <View style={styles.statusChip}>
                  <Text style={styles.statusChipText}>✓ Verified</Text>
                </View>
              </View>
            </View>
            <Text style={styles.vehicleDropdownArrow}>→</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.vehicleCard}
            onPress={() => router.push('/vehicles/add')}
            activeOpacity={0.9}
          >
            <View style={styles.vehicleIconBox}>
              <Text style={{ fontSize: 20 }}>🛵</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleTitle}>No vehicle registered yet</Text>
              <Text style={[styles.vehicleReg, { color: '#16A34A', fontWeight: '600' }]}>
                + Tap to add your 2W or 4W
              </Text>
            </View>
            <Text style={styles.vehicleDropdownArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Other saved vehicles: tap to see services for that vehicle */}
        {primaryVehicle ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 4 }}
          >
            {vehicleList
              .filter((v) => v.id !== primaryVehicle.id)
              .map((v) => (
                <TouchableOpacity
                  key={v.id}
                  style={styles.vehicleChip}
                  onPress={() =>
                    router.push({
                      pathname: '/services',
                      params: { vehicleType: v.type, vehicleId: v.id },
                    })
                  }
                >
                  <Text style={styles.vehicleChipText}>
                    {v.type === 'FOUR_WHEELER' ? '🚗' : '🏍️'} {v.brand ? `${v.brand} ` : ''}{v.model}
                  </Text>
                </TouchableOpacity>
              ))}
            <TouchableOpacity
              style={[styles.vehicleChip, styles.vehicleChipAdd]}
              onPress={() => router.push('/vehicles/add')}
            >
              <Text style={[styles.vehicleChipText, { color: '#16A34A' }]}>+ Add Vehicle</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : null}

        {/* 4. First Booking Promo Card (Screen 1) */}
        <View style={styles.bodyWrap}>
          <TouchableOpacity
            style={styles.firstBookingPromo}
            onPress={() => router.push({ pathname: '/services', params: { vehicleType: 'TWO_WHEELER' } })}
            activeOpacity={0.9}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.promoBigOffer}>₹150 OFF</Text>
              <Text style={styles.promoSub}>on 1st booking</Text>
              <View style={styles.featureTagsRow}>
                <View style={styles.featureTag}>
                  <Text style={styles.featureTagText}>Quick{'\n'}Service</Text>
                </View>
                <View style={styles.featureTag}>
                  <Text style={styles.featureTagText}>Trusted{'\n'}Mechanics</Text>
                </View>
                <View style={styles.featureTag}>
                  <Text style={styles.featureTagText}>Premium{'\n'}Care</Text>
                </View>
              </View>
            </View>
            <View style={styles.promoGraphicWrap}>
              <Text style={{ fontSize: 44 }}>⚡</Text>
            </View>
          </TouchableOpacity>

          {/* 5. 2x2 Category Grid (Screen 1) */}
          <View style={styles.categoryGrid}>
            {/* 2-WHEELER */}
            <TouchableOpacity
              style={styles.gridTile}
              onPress={() =>
                router.push({
                  pathname: '/services',
                  params: { vehicleType: 'TWO_WHEELER' },
                })
              }
            >
              <Text style={styles.tileHeading}>2-WHEELER</Text>
              <Text style={styles.tileSub}>Service</Text>
              <Text style={styles.tileIcon}>🏍️</Text>
            </TouchableOpacity>

            {/* 4-WHEELER */}
            <TouchableOpacity
              style={styles.gridTile}
              onPress={() =>
                router.push({
                  pathname: '/services',
                  params: { vehicleType: 'FOUR_WHEELER' },
                })
              }
            >
              <Text style={styles.tileHeading}>4-WHEELER</Text>
              <Text style={styles.tileSub}>Service</Text>
              <Text style={styles.tileIcon}>🚗</Text>
            </TouchableOpacity>

            {/* WASHING & Detailing (Coming Soon) */}
            <View style={styles.gridTile}>
              <Text style={styles.tileHeading}>WASHING</Text>
              <Text style={styles.tileSub}>& Detailing</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
              <Text style={styles.tileIcon}>🚿</Text>
            </View>

            {/* SHOP NOW Spares & Acc. (Coming Soon) */}
            <View style={styles.gridTile}>
              <Text style={styles.tileHeading}>SHOP NOW</Text>
              <Text style={styles.tileSub}>Spares & Acc.</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
              <Text style={styles.tileIcon}>🛒</Text>
            </View>
          </View>

          {/* 6. Gearzo Care+ Banner (Screen 1) */}
          <TouchableOpacity
            style={styles.gearzoCareBanner}
            onPress={() => router.push('/(app)/(tabs)/subscription')}
            activeOpacity={0.9}
          >
            <Text style={styles.careBannerTitle}>Gearzo care+</Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>Save up to ₹3000</Text>
            </View>
          </TouchableOpacity>

          {/* 7. Quick Doorstep Services Live List */}
          <View style={styles.quickServicesHeader}>
            <Text style={styles.quickServicesTitle}>Popular Services</Text>
            <TouchableOpacity onPress={() => router.push('/services')}>
              <Text style={styles.viewAllText}>View All ›</Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 10 }}>
            {(quickServices || []).slice(0, 3).map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.popularServiceRow}
                onPress={() => router.push(`/services/${s.id}`)}
              >
                <View style={styles.popularIconWrap}>
                  <Text style={{ fontSize: 22 }}>
                    {s.name.includes('Check') ? '📋' : s.name.includes('Call') ? '📞' : '🔧'}
                  </Text>
                </View>
                <View style={{ flex: 1, paddingHorizontal: 10 }}>
                  <Text style={styles.popularServiceName}>{s.name}</Text>
                  <Text style={styles.popularServiceSub}>
                    ⏱️ {s.durationMinutes} mins • {s.description?.slice(0, 45)}...
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.popularServicePrice}>
                    ₹{Math.round(((s.pricePaise ?? (s as any).basePricePaise ?? 0)) / 100)}
                  </Text>
                  <Text style={styles.bookNowSmall}>Book ›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  vehicleChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3EAE5',
  },
  vehicleChipAdd: {
    borderStyle: 'dashed',
    borderColor: '#16A34A',
  },
  vehicleChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F1F16',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  hh: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F1F16',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  pinIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7C72',
    maxWidth: 180,
  },
  dropdownIcon: {
    fontSize: 9,
    color: '#6B7C72',
    marginLeft: 4,
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F4F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    marginHorizontal: 14,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E3EAE5',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0B4A27',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  searchPlaceholder: {
    fontSize: 12,
    color: '#6B7C72',
  },
  vehicleCard: {
    marginHorizontal: 14,
    marginTop: 10,
    backgroundColor: '#F2F4F3',
    borderRadius: 16,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vehicleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E3F6EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F1F16',
  },
  vehicleReg: {
    fontStyle: 'normal',
    fontWeight: '500',
    color: '#6B7C72',
    fontSize: 11.5,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 5,
  },
  statusChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0B4A27',
  },
  vehicleDropdownArrow: {
    fontSize: 10,
    color: '#6B7C72',
    paddingRight: 4,
  },
  bodyWrap: {
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  firstBookingPromo: {
    backgroundColor: '#EAF7EE',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D5EFDE',
  },
  promoBigOffer: {
    fontSize: 28,
    fontWeight: '800',
    color: '#16A34A',
    lineHeight: 32,
  },
  promoSub: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F1F16',
    marginTop: 2,
  },
  featureTagsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  featureTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featureTagText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#6B7C72',
    lineHeight: 11,
    textAlign: 'center',
  },
  promoGraphicWrap: {
    paddingLeft: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  gridTile: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E3EAE5',
    borderRadius: 16,
    padding: 12,
    height: 100,
    position: 'relative',
    shadowColor: '#0B4A27',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  tileHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F1F16',
  },
  tileSub: {
    color: '#6B7C72',
    fontSize: 11,
    marginTop: 2,
  },
  tileIcon: {
    position: 'absolute',
    right: 12,
    bottom: 10,
    fontSize: 24,
  },
  comingSoonBadge: {
    position: 'absolute',
    left: 0,
    bottom: 12,
    backgroundColor: '#FACC15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  comingSoonText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#0B2A18',
  },
  gearzoCareBanner: {
    marginTop: 12,
    backgroundColor: '#0B2A18',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  careBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  saveBadge: {
    backgroundColor: '#FACC15',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  saveBadgeText: {
    color: '#0B2A18',
    fontWeight: '800',
    fontSize: 10,
  },
  quickServicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  quickServicesTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F1F16',
  },
  viewAllText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  popularServiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E3EAE5',
    borderRadius: 14,
    padding: 10,
    shadowColor: '#0B4A27',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  popularIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E3F6EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularServiceName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F1F16',
  },
  popularServiceSub: {
    fontSize: 10,
    color: '#6B7C72',
    marginTop: 2,
  },
  popularServicePrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F1F16',
  },
  bookNowSmall: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 2,
  },
});
