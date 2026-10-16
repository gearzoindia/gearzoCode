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
import { useAuth, useHome, useVehicles } from '@gearzo/api-client';
import { Card, Badge, VehicleCard, ServiceCard, LoadingScreen, ErrorScreen } from '@gearzo/ui';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: homeData, isLoading, isError, refetch, isRefetching } = useHome();
  const { data: vehicles } = useVehicles();

  const vehicleList = Array.isArray(vehicles) ? vehicles : [];
  const primaryVehicle = vehicleList.find((v) => v.isDefault) || vehicleList[0];
  const userName = user?.name ? user.name.split(' ')[0] : 'Driver';

  if (isLoading) {
    return <LoadingScreen message="Loading GearZo services..." />;
  }

  if (isError) {
    return <ErrorScreen message="Failed to load dashboard." onRetry={refetch} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1B5E20" />
        }
      >
        {/* Dark Green Header */}
        <View style={styles.header}>
          <SafeAreaView edges={['top', 'left', 'right']}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>Hey, {userName} 👋</Text>
                <TouchableOpacity
                  style={styles.locationContainer}
                  onPress={() => router.push('/addresses')}
                  accessibilityRole="button"
                  accessibilityLabel="Change location"
                >
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.locationText} numberOfLines={1}>
                    {user?.city || 'Bengaluru, India'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.bellButton}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                onPress={() => router.push('/profile/upcoming')}
              >
                <Text style={{ fontSize: 20 }}>🔔</Text>
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Search Bar (Overlapping Header) */}
        <View style={styles.searchOverlapContainer}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => router.push('/search')}
            activeOpacity={0.9}
            accessibilityRole="search"
            accessibilityLabel="Search vehicle services and repairs"
          >
            <Text style={{ fontSize: 18, marginRight: 8 }}>🔍</Text>
            <Text style={styles.searchPlaceholder}>
              Search "Brake pads", "Oil change", "Periodic service"
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bodyPadding}>
          {/* Selected Vehicle or Add Vehicle Prompt */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Vehicle</Text>
            {primaryVehicle && (
              <TouchableOpacity onPress={() => router.push('/vehicles/add')}>
                <Text style={styles.linkText}>+ Add another</Text>
              </TouchableOpacity>
            )}
          </View>

          {primaryVehicle ? (
            <VehicleCard
              id={primaryVehicle.id}
              type={primaryVehicle.type || primaryVehicle.vehicleTypeId || 'FOUR_WHEELER'}
              brand={primaryVehicle.brand || primaryVehicle.brandName || 'Vehicle'}
              model={primaryVehicle.model || primaryVehicle.modelName || ''}
              registrationNumber={primaryVehicle.registrationNumber || primaryVehicle.regNumber || ''}
              isDefault={primaryVehicle.isDefault}
              onPress={() => router.push(`/vehicles/${primaryVehicle.id}`)}
            />
          ) : (
            <Card variant="outlined" style={styles.addVehiclePromptCard}>
              <View style={styles.promptContent}>
                <View style={styles.promptIconWrap}>
                  <Text style={{ fontSize: 28 }}>🚗</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.promptTitle}>No Vehicle Added</Text>
                  <Text style={styles.promptDesc}>
                    Add your vehicle for instant quote matching and scheduled maintenance
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.promptButton}
                onPress={() => router.push('/vehicles/add')}
                accessibilityRole="button"
              >
                <Text style={styles.promptButtonText}>+ Add Vehicle Now</Text>
              </TouchableOpacity>
            </Card>
          )}

          {/* Promo Banner Carousel */}
          <View style={styles.promoBanner}>
            <View style={{ flex: 1 }}>
              <Badge label="LIMITED OFFER" variant="warning" />
              <Text style={styles.promoTitle}>Monsoon Health Checkup</Text>
              <Text style={styles.promoSubtitle}>Flat 20% OFF on all 30-point inspections</Text>
              <TouchableOpacity
                style={styles.promoCta}
                onPress={() => router.push('/services')}
              >
                <Text style={styles.promoCtaText}>Book Now →</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 44, marginLeft: 12 }}>🌧️</Text>
          </View>

          {/* 2x2 Grid Categories */}
          <Text style={styles.sectionTitle}>Explore Categories</Text>
          <View style={styles.categoryGrid}>
            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => router.push({ pathname: '/services', params: { vehicleType: 'TWO_WHEELER' } })}
              accessibilityRole="button"
            >
              <Text style={styles.gridIcon}>🛵</Text>
              <Text style={styles.gridTitle}>2-Wheeler Service</Text>
              <Text style={styles.gridSub}>Bikes & Scooters</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => router.push({ pathname: '/services', params: { vehicleType: 'FOUR_WHEELER' } })}
              accessibilityRole="button"
            >
              <Text style={styles.gridIcon}>🚗</Text>
              <Text style={styles.gridTitle}>4-Wheeler Service</Text>
              <Text style={styles.gridSub}>Cars & SUVs</Text>
            </TouchableOpacity>

            <View style={[styles.gridCard, styles.gridCardDisabled]}>
              <View style={styles.badgeTopRight}>
                <Badge label="Soon" variant="neutral" />
              </View>
              <Text style={styles.gridIcon}>🚿</Text>
              <Text style={styles.gridTitle}>Eco Wash & Detailing</Text>
              <Text style={styles.gridSub}>Doorstep waterless</Text>
            </View>

            <View style={[styles.gridCard, styles.gridCardDisabled]}>
              <View style={styles.badgeTopRight}>
                <Badge label="Soon" variant="neutral" />
              </View>
              <Text style={styles.gridIcon}>🛒</Text>
              <Text style={styles.gridTitle}>Shop Parts & Tyres</Text>
              <Text style={styles.gridSub}>Genuine spares</Text>
            </View>
          </View>

          {/* Quick Services Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Doorstep Services</Text>
            <TouchableOpacity onPress={() => router.push('/services')}>
              <Text style={styles.linkText}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 12, marginBottom: 24 }}>
            {homeData?.quickServices?.slice(0, 3).map((item) => (
              <ServiceCard
                key={item.id}
                name={item.name}
                durationMinutes={item.durationMinutes}
                pricePaise={item.basePricePaise}
                description={item.description}
                onSelect={() => router.push(`/services/${item.id}`)}
              />
            )) || (
              <>
                <ServiceCard
                  name="Periodic General Service"
                  durationMinutes={90}
                  pricePaise={149900}
                  originalPricePaise={199900}
                  badge="Popular"
                  description="Engine oil flush, spark plug clean, air filter inspection, chain lube & wash"
                  onSelect={() => router.push('/services')}
                />
                <ServiceCard
                  name="Brake Pad Replacement & Bleed"
                  durationMinutes={45}
                  pricePaise={69900}
                  description="Front and rear brake inspection, shoe/pad change and hydraulic bleeding"
                  onSelect={() => router.push('/services')}
                />
              </>
            )}
          </View>

          {/* Service Packages, Specific Repair, Book a Mechanic cards */}
          <Text style={styles.sectionTitle}>Tailored For You</Text>
          <View style={{ gap: 12, marginBottom: 24 }}>
            <Card variant="elevated">
              <TouchableOpacity
                onPress={() => router.push('/services')}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <View style={[styles.tileIconWrap, { backgroundColor: '#E8F5E9' }]}>
                  <Text style={{ fontSize: 24 }}>📦</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tileTitle}>Comprehensive Packages</Text>
                  <Text style={styles.tileSub}>Silver, Gold & Platinum routine service bundles</Text>
                </View>
                <Text style={{ fontSize: 20, color: '#9CA3AF' }}>›</Text>
              </TouchableOpacity>
            </Card>

            <Card variant="elevated">
              <TouchableOpacity
                onPress={() => router.push('/services')}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <View style={[styles.tileIconWrap, { backgroundColor: '#E0F2FE' }]}>
                  <Text style={{ fontSize: 24 }}>🔧</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tileTitle}>Specific Repair & Diagnostics</Text>
                  <Text style={styles.tileSub}>Starting issues, overheating, battery jump start</Text>
                </View>
                <Text style={{ fontSize: 20, color: '#9CA3AF' }}>›</Text>
              </TouchableOpacity>
            </Card>

            <Card variant="elevated">
              <TouchableOpacity
                onPress={() => router.push('/services')}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <View style={[styles.tileIconWrap, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={{ fontSize: 24 }}>⚡</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tileTitle}>Book an Instant Mechanic</Text>
                  <Text style={styles.tileSub}>Nearest verified technician arrives within 30 mins</Text>
                </View>
                <Text style={{ fontSize: 20, color: '#9CA3AF' }}>›</Text>
              </TouchableOpacity>
            </Card>
          </View>

          {/* Car Service CTA Banner */}
          <View style={styles.carBanner}>
            <Text style={styles.carBannerTitle}>Premium Car Care at Home</Text>
            <Text style={styles.carBannerDesc}>
              Certified technicians equipped with OBD-II diagnostic tools and OEM fluids.
            </Text>
            <TouchableOpacity
              style={styles.carBannerBtn}
              onPress={() => router.push({ pathname: '/services', params: { vehicleType: 'FOUR_WHEELER' } })}
            >
              <Text style={styles.carBannerBtnText}>Schedule Car Service</Text>
            </TouchableOpacity>
          </View>

          {/* GearZo Promise Section */}
          <Text style={styles.sectionTitle}>The GearZo Promise</Text>
          <View style={styles.promiseGrid}>
            <View style={styles.promiseItem}>
              <Text style={styles.promiseIcon}>🛡️</Text>
              <Text style={styles.promiseTitle}>1000 km Warranty</Text>
              <Text style={styles.promiseSub}>Service backed by 30-day warranty</Text>
            </View>
            <View style={styles.promiseItem}>
              <Text style={styles.promiseIcon}>💰</Text>
              <Text style={styles.promiseTitle}>Upfront Pricing</Text>
              <Text style={styles.promiseSub}>Zero hidden charges or surprises</Text>
            </View>
            <View style={styles.promiseItem}>
              <Text style={styles.promiseIcon}>✅</Text>
              <Text style={styles.promiseTitle}>Verified Mechanics</Text>
              <Text style={styles.promiseSub}>Background & skill checked pros</Text>
            </View>
            <View style={styles.promiseItem}>
              <Text style={styles.promiseIcon}>📍</Text>
              <Text style={styles.promiseTitle}>Live Tracking</Text>
              <Text style={styles.promiseSub}>GPS arrival & service status updates</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Support Button */}
      <TouchableOpacity
        style={styles.floatingHelp}
        onPress={() => router.push('/profile/help')}
        accessibilityRole="button"
        accessibilityLabel="Customer support chat"
      >
        <Text style={{ fontSize: 20, marginRight: 6 }}>💬</Text>
        <Text style={styles.floatingHelpText}>Support</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#E8F5E9',
    fontWeight: '500',
    maxWidth: 200,
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#C8E6C9',
    marginLeft: 6,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5722',
    position: 'absolute',
    top: 10,
    right: 12,
  },
  searchOverlapContainer: {
    paddingHorizontal: 20,
    marginTop: -22,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
  },
  bodyPadding: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  linkText: {
    fontSize: 14,
    color: '#1B5E20',
    fontWeight: '600',
  },
  addVehiclePromptCard: {
    marginBottom: 20,
    padding: 16,
  },
  promptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  promptIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  promptDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  promptButton: {
    backgroundColor: '#1B5E20',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  promptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  promoBanner: {
    backgroundColor: '#0D3811',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  promoTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 6,
  },
  promoSubtitle: {
    fontSize: 12,
    color: '#A5D6A7',
    marginTop: 2,
    marginBottom: 10,
  },
  promoCta: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  promoCtaText: {
    color: '#1B5E20',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  gridCardDisabled: {
    opacity: 0.75,
    backgroundColor: '#F9FAFB',
  },
  badgeTopRight: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  gridIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  gridSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  tileIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tileTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  tileSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  carBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  carBannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  carBannerDesc: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 14,
  },
  carBannerBtn: {
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  carBannerBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  promiseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  promiseItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  promiseIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  promiseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  promiseSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  floatingHelp: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B5E20',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingHelpText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
