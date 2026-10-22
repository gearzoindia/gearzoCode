import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useServices, useProducts, useVehicles } from '@gearzo/api-client';
import { useCartStore, CartItem } from '../../../stores/cart-store';

export default function ServicesListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId?: string; vehicleType?: string }>();

  const [vehicleType, setVehicleType] = useState<'TWO_WHEELER' | 'FOUR_WHEELER'>(
    (params.vehicleType as any) === 'FOUR_WHEELER' ? 'FOUR_WHEELER' : 'TWO_WHEELER'
  );

  // 3 tabs: Book a Mechanic, Service Packages, Specific Repair
  const [activeTab, setActiveTab] = useState<'Book a Mechanic' | 'Service Packages' | 'Specific Repair'>(
    'Book a Mechanic'
  );

  const [searchQuery, setSearchQuery] = useState('');

  // Bottom sheets
  const [showAddonSheet, setShowAddonSheet] = useState(false);
  const [showProductRequiredSheet, setShowProductRequiredSheet] = useState(false);
  const [selectedServiceForSheet, setSelectedServiceForSheet] = useState<any>(null);

  // Cart store
  const {
    items: cartItems,
    addItem,
    removeItem,
    getServicesCount,
    getProductsCount,
    getItemsTotalPaise,
    hasOwnProduct,
    setHasOwnProduct,
  } = useCartStore();

  // API hooks
  const { data: services, isLoading: loadingServices, refetch } = useServices(
    activeTab,
    vehicleType
  );
  const { data: products } = useProducts(vehicleType);
  const { data: vehicles } = useVehicles();

  const vehicleList = Array.isArray(vehicles) ? vehicles : [];
  const activeVehicle =
    vehicleList.find((v) => (v.type === vehicleType)) ||
    vehicleList[0] ||
    null;

  // Filter services by search if user types
  const displayedServices = (services || []).filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q));
  });

  const handleServiceSelect = (service: any) => {
    if (service.requiresProduct) {
      setSelectedServiceForSheet(service);
      setShowProductRequiredSheet(true);
    } else if (service.id.includes('book_mechanic')) {
      setSelectedServiceForSheet(service);
      setShowAddonSheet(true);
    } else {
      addItem({
        id: service.id,
        name: service.name,
        pricePaise: service.pricePaise,
        durationMinutes: service.durationMinutes,
        type: 'SERVICE',
        badge: (service as any).badge,
      });
    }
  };

  const handleAddProductToCart = (prod: any) => {
    addItem({
      id: prod.id,
      name: prod.name,
      pricePaise: prod.pricePaise,
      type: 'PRODUCT',
      badge: prod.discountText,
    });
  };

  const handleCheckout = () => {
    setShowAddonSheet(false);
    setShowProductRequiredSheet(false);
    router.push('/booking/checkout');
  };

  const totalPaise = getItemsTotalPaise();
  const servicesCount = getServicesCount();
  const productsCount = getProductsCount();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 1. Header (Screen 3 & Screen 6) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {vehicleType === 'TWO_WHEELER' ? '2-Wheeler' : '4-Wheeler'}
        </Text>
        <TouchableOpacity
          style={styles.vehicleSelectorPill}
          onPress={() => router.push('/vehicles/add')}
        >
          <Text style={{ fontSize: 13, marginRight: 4 }}>
            {vehicleType === 'TWO_WHEELER' ? '🏍️' : '🚗'}
          </Text>
          <Text style={styles.vehicleSelectorText} numberOfLines={1}>
            {activeVehicle?.model || 'Add Vehicle'}
          </Text>
          <Text style={styles.dropdownCaret}>▼</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* 2. Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="What does your vehicle need today?"
            placeholderTextColor="#6B7C72"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {/* 3. Hero Warranty Banner */}
        <View
          style={[
            styles.heroBanner,
            vehicleType === 'TWO_WHEELER'
              ? { backgroundColor: '#0B4A27' }
              : { backgroundColor: '#064E3B' },
          ]}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.warrantyTag}>
              <Text style={styles.warrantyTagText}>
                {vehicleType === 'TWO_WHEELER' ? '7 Days Warranty' : 'Comprehensive Care'}
              </Text>
            </View>
            <Text style={styles.heroBannerTitle}>
              {vehicleType === 'TWO_WHEELER' ? 'General\nService' : 'Periodic\nMaintenance'}
            </Text>
            <TouchableOpacity
              style={styles.buyNowBtn}
              onPress={() => {
                const s = services?.[0];
                if (s) handleServiceSelect(s);
              }}
            >
              <Text style={styles.buyNowText}>Book Now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroGraphic}>
            <Text style={{ fontSize: 50 }}>
              {vehicleType === 'TWO_WHEELER' ? '🏍️' : '🚘'}
            </Text>
          </View>
        </View>

        {/* 4. Segmented Category Tabs (Screen 3, 4, 5) */}
        <View style={styles.tabsContainer}>
          {(['Book a Mechanic', 'Service Packages', 'Specific Repair'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 5. Service Cards List */}
        <View style={styles.serviceListContainer}>
          {loadingServices ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#16A34A" />
              <Text style={{ color: '#6B7C72', marginTop: 10, fontSize: 13 }}>
                Loading catalogue...
              </Text>
            </View>
          ) : displayedServices.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 32 }}>🔍</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F1F16', marginTop: 8 }}>
                No services found
              </Text>
              <Text style={{ color: '#6B7C72', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                Try searching for another service or switch tabs
              </Text>
            </View>
          ) : (
            displayedServices.map((service) => {
              const inCart = cartItems.some((i) => i.id === service.id);
              const badge = (service as any).badge;
              const warranty = (service as any).warranty || '7 Day Guarantee';

              return (
                <View key={service.id} style={styles.serviceCard}>
                  {/* Left Column: Details */}
                  <View style={styles.serviceDetailsCol}>
                    <Text style={styles.serviceTitle}>{service.name}</Text>
                    <View style={styles.durationRow}>
                      <Text style={styles.clockIcon}>⏱️</Text>
                      <Text style={styles.durationText}>{service.durationMinutes} Mins</Text>
                    </View>
                    <Text style={styles.servicePrice}>
                      ₹{Math.round(((service.pricePaise ?? (service as any).basePricePaise ?? 0)) / 100)}
                    </Text>
                    <View style={styles.guaranteeBadge}>
                      <Text style={styles.guaranteeBadgeText}>{warranty}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => router.push(`/services/${service.id}`)}
                      style={styles.viewDetailsLink}
                    >
                      <Text style={styles.viewDetailsText}>View Details ›</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Right Column: Thumbnail + Add CTA */}
                  <View style={styles.serviceThumbnailCol}>
                    <View style={styles.thumbnailPlaceholder}>
                      <Text style={{ fontSize: 36 }}>
                        {service.name.toLowerCase().includes('battery')
                          ? '🔋'
                          : service.name.toLowerCase().includes('oil')
                          ? '🛢️'
                          : service.name.toLowerCase().includes('chain')
                          ? '⛓️'
                          : service.name.toLowerCase().includes('check')
                          ? '📋'
                          : vehicleType === 'TWO_WHEELER'
                          ? '🏍️'
                          : '🚗'}
                      </Text>
                    </View>
                    {badge && (
                      <View style={styles.badgeTopLeft}>
                        <Text style={styles.badgeText}>{badge}</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={[styles.addCircleBtn, inCart && styles.addCircleBtnActive]}
                      onPress={() => {
                        if (inCart) {
                          removeItem(service.id);
                        } else {
                          handleServiceSelect(service);
                        }
                      }}
                    >
                      <Text style={styles.addCircleText}>{inCart ? '✓' : '+'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* 6. Sticky Floating Cart Bar (if items in cart) */}
      {cartItems.length > 0 && (
        <View style={styles.floatingCartBar}>
          <View style={styles.cartBarIconWrap}>
            <Text style={{ fontSize: 20 }}>🔧</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cartBarTitle}>
              {cartItems[0]?.name || 'Items Selected'}
            </Text>
            <Text style={styles.cartBarSub}>
              {servicesCount} Service{servicesCount !== 1 ? 's' : ''} | {productsCount} Part{productsCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.cartCheckoutBtn} onPress={handleCheckout}>
            <Text style={styles.cartCheckoutPrice}>₹ {Math.round(totalPaise / 100)}</Text>
            <Text style={styles.cartCheckoutText}>Checkout ›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 7. Screen 8: Add-on Products Sheet Modal */}
      <Modal visible={showAddonSheet} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalCloseCircle}
            onPress={() => setShowAddonSheet(false)}
          >
            <Text style={{ fontSize: 22, color: '#333' }}>×</Text>
          </TouchableOpacity>
          <View style={styles.bottomSheetContainer}>
            {/* Sheet Title */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderIcon}>
                <Text style={{ fontSize: 20 }}>🔧</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetHeaderTitle}>
                  {selectedServiceForSheet?.name || 'Book A Mechanic'}
                </Text>
                <Text style={styles.sheetHeaderSubtitle}>
                  ⏱️ {selectedServiceForSheet?.durationMinutes || 30} Mins
                </Text>
              </View>
              <Text style={styles.sheetHeaderPrice}>
                ₹{Math.round((selectedServiceForSheet?.pricePaise || 29900) / 100)}
              </Text>
            </View>

            {/* Related Products Carousel */}
            <View style={styles.sheetBody}>
              <View style={styles.sheetSectionRow}>
                <Text style={styles.sheetSectionTitle}>Related Products</Text>
                <Text style={styles.sheetSectionLink}>Recommended ›</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
                {(products || []).map((prod) => {
                  const inCart = cartItems.some((i) => i.id === prod.id);
                  return (
                    <View key={prod.id} style={styles.productCardHorizontal}>
                      {prod.discountText && (
                        <View style={styles.productDiscountBadge}>
                          <Text style={styles.productDiscountText}>{prod.discountText}</Text>
                        </View>
                      )}
                      <View style={styles.productIconWrap}>
                        <Text style={{ fontSize: 30 }}>
                          {prod.name.toLowerCase().includes('battery') ? '🔋' : '🛢️'}
                        </Text>
                      </View>
                      <Text style={styles.productCardName} numberOfLines={2}>
                        {prod.name}
                      </Text>
                      <Text style={styles.productCardPrice}>
                        ₹{Math.round(prod.pricePaise / 100)}{' '}
                        {prod.originalPricePaise && (
                          <Text style={styles.productOriginalPrice}>
                            ₹{Math.round(prod.originalPricePaise / 100)}
                          </Text>
                        )}
                      </Text>
                      <TouchableOpacity
                        style={[styles.productAddToCartBtn, inCart && styles.productAddToCartBtnActive]}
                        onPress={() => {
                          if (inCart) removeItem(prod.id);
                          else handleAddProductToCart(prod);
                        }}
                      >
                        <Text style={[styles.productAddToCartText, inCart && { color: '#fff' }]}>
                          {inCart ? 'Added ✓' : 'Add to Cart'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            </View>

            {/* Sticky Cart Summary in Sheet */}
            <View style={styles.sheetCartBar}>
              <View style={styles.sheetCartIconWrap}>
                <Text style={{ fontSize: 18 }}>🔧</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetCartTitle}>
                  {selectedServiceForSheet?.name || 'Book A Mechanic'}
                </Text>
                <Text style={styles.sheetCartSubtitle}>
                  {servicesCount || 1} Service | {productsCount} Parts
                </Text>
              </View>
              <TouchableOpacity
                style={styles.sheetCheckoutBtn}
                onPress={() => {
                  if (selectedServiceForSheet) {
                    addItem({
                      id: selectedServiceForSheet.id,
                      name: selectedServiceForSheet.name,
                      pricePaise: selectedServiceForSheet.pricePaise,
                      type: 'SERVICE',
                    });
                  }
                  handleCheckout();
                }}
              >
                <Text style={styles.sheetCheckoutPrice}>
                  ₹ {Math.round((totalPaise || selectedServiceForSheet?.pricePaise || 29900) / 100)}
                </Text>
                <Text style={styles.sheetCheckoutText}>Checkout</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sheetRemoveBtn}
              onPress={() => {
                if (selectedServiceForSheet) removeItem(selectedServiceForSheet.id);
                setShowAddonSheet(false);
              }}
            >
              <Text style={styles.sheetRemoveBtnText}>Remove Service</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 8. Screen 9: Product Required Sheet Modal */}
      <Modal visible={showProductRequiredSheet} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalCloseCircle}
            onPress={() => setShowProductRequiredSheet(false)}
          >
            <Text style={{ fontSize: 22, color: '#333' }}>×</Text>
          </TouchableOpacity>
          <View style={styles.bottomSheetContainer}>
            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderIcon}>
                <Text style={{ fontSize: 20 }}>🔋</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetHeaderTitle}>
                  {selectedServiceForSheet?.name || 'Battery Replacement'}
                </Text>
                <Text style={styles.sheetHeaderSubtitle}>
                  ⏱️ {selectedServiceForSheet?.durationMinutes || 30} Mins
                </Text>
              </View>
              <Text style={styles.sheetHeaderPrice}>
                ₹{Math.round((selectedServiceForSheet?.pricePaise || 19900) / 100)}
              </Text>
            </View>

            {/* Alert Message */}
            <View style={styles.sheetBody}>
              <Text style={styles.requiredAlertHeading}>Products must be added.</Text>

              {/* Battery Product Card */}
              {products
                ?.filter((p) => p.category === 'Battery' || p.name.includes('Battery'))
                .map((battery) => {
                  const hasBattery = cartItems.some((i) => i.id === battery.id);
                  return (
                    <View key={battery.id} style={styles.requiredProductRow}>
                      <View style={styles.requiredProductIcon}>
                        <Text style={{ fontSize: 22 }}>🔋</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.requiredProductName}>{battery.name}</Text>
                        <Text style={styles.requiredProductPrice}>
                          ₹{Math.round(battery.pricePaise / 100)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.addRequiredProductBtn, hasBattery && styles.addRequiredProductBtnActive]}
                        onPress={() => {
                          if (hasBattery) removeItem(battery.id);
                          else {
                            handleAddProductToCart(battery);
                            setHasOwnProduct(false);
                          }
                        }}
                      >
                        <Text style={[styles.addRequiredProductText, hasBattery && { color: '#fff' }]}>
                          {hasBattery ? 'Added ✓' : '+ Add'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}

              {/* "I have my product" toggle */}
              <TouchableOpacity
                style={styles.haveMyProductRow}
                onPress={() => {
                  setHasOwnProduct(!hasOwnProduct);
                }}
              >
                <Text style={styles.haveMyProductText}>I have my own product</Text>
                <View
                  style={[
                    styles.radioCircle,
                    hasOwnProduct && styles.radioCircleActive,
                  ]}
                >
                  {hasOwnProduct && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            </View>

            {/* Cart bar */}
            <View style={styles.sheetCartBar}>
              <View style={styles.sheetCartIconWrap}>
                <Text style={{ fontSize: 18 }}>🔋</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetCartTitle}>
                  {selectedServiceForSheet?.name || 'Battery Replacement'}
                </Text>
                <Text style={styles.sheetCartSubtitle}>
                  1 Service | {hasOwnProduct ? 'Customer Product' : '1 Product'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.sheetCheckoutBtn}
                onPress={() => {
                  if (selectedServiceForSheet) {
                    addItem({
                      id: selectedServiceForSheet.id,
                      name: selectedServiceForSheet.name,
                      pricePaise: selectedServiceForSheet.pricePaise,
                      type: 'SERVICE',
                      requiresProduct: true,
                    });
                  }
                  handleCheckout();
                }}
              >
                <Text style={styles.sheetCheckoutPrice}>
                  ₹ {Math.round(totalPaise / 100)}
                </Text>
                <Text style={styles.sheetCheckoutText}>Checkout</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sheetRemoveBtn}
              onPress={() => {
                if (selectedServiceForSheet) removeItem(selectedServiceForSheet.id);
                setShowProductRequiredSheet(false);
              }}
            >
              <Text style={styles.sheetRemoveBtnText}>Remove Service</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  backBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F1F16',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F1F16',
    flex: 1,
  },
  vehicleSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: 140,
  },
  vehicleSelectorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F1F16',
  },
  dropdownCaret: {
    fontSize: 10,
    color: '#6B7C72',
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E3EAE5',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F1F16',
    padding: 0,
  },
  heroBanner: {
    marginHorizontal: 14,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 120,
  },
  warrantyTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  warrantyTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  heroBannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 10,
  },
  buyNowBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  buyNowText: {
    color: '#0B4A27',
    fontWeight: '800',
    fontSize: 11,
  },
  heroGraphic: {
    paddingLeft: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E3EAE5',
    marginHorizontal: 14,
    marginTop: 14,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2.5,
    borderBottomColor: '#16A34A',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7C72',
  },
  tabButtonTextActive: {
    color: '#16A34A',
    fontWeight: '800',
  },
  serviceListContainer: {
    paddingHorizontal: 14,
    paddingTop: 12,
    gap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E3EAE5',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#0B4A27',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  serviceDetailsCol: {
    flex: 1,
    paddingRight: 10,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F1F16',
    marginBottom: 4,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  clockIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  durationText: {
    fontSize: 11,
    color: '#6B7C72',
    fontWeight: '500',
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F1F16',
    marginBottom: 4,
  },
  guaranteeBadge: {
    backgroundColor: '#E3F6EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  guaranteeBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0B4A27',
  },
  viewDetailsLink: {
    paddingVertical: 2,
  },
  viewDetailsText: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '700',
  },
  serviceThumbnailCol: {
    width: 90,
    height: 84,
    position: 'relative',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#16A34A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  addCircleBtn: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  addCircleBtnActive: {
    backgroundColor: '#0B4A27',
  },
  addCircleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 20,
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 16,
    left: 14,
    right: 14,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  cartBarIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cartBarTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cartBarSub: {
    color: '#9CA3AF',
    fontSize: 10,
  },
  cartCheckoutBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  cartCheckoutPrice: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  cartCheckoutText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // Modal & Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCloseCircle: {
    alignSelf: 'center',
    marginBottom: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheetContainer: {
    backgroundColor: '#FAFBFA',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingBottom: 24,
    maxHeight: '85%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sheetHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E3F6EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sheetHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F1F16',
  },
  sheetHeaderSubtitle: {
    fontSize: 10.5,
    color: '#6B7C72',
  },
  sheetHeaderPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F1F16',
  },
  sheetBody: {
    padding: 14,
  },
  sheetSectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sheetSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F1F16',
  },
  sheetSectionLink: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '700',
  },
  productCardHorizontal: {
    width: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E3EAE5',
    position: 'relative',
  },
  productDiscountBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#22C55E',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 6,
  },
  productDiscountText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  productIconWrap: {
    height: 60,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    marginTop: 4,
  },
  productCardName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F1F16',
    height: 30,
  },
  productCardPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F1F16',
    marginTop: 2,
  },
  productOriginalPrice: {
    fontSize: 9.5,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  productAddToCartBtn: {
    borderWidth: 1.5,
    borderColor: '#E3EAE5',
    borderRadius: 8,
    paddingVertical: 4,
    alignItems: 'center',
    marginTop: 6,
  },
  productAddToCartBtnActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  productAddToCartText: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: '800',
  },
  sheetCartBar: {
    marginHorizontal: 14,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetCartIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sheetCartTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sheetCartSubtitle: {
    color: '#9CA3AF',
    fontSize: 9.5,
  },
  sheetCheckoutBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  sheetCheckoutPrice: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  sheetCheckoutText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  sheetRemoveBtn: {
    marginHorizontal: 14,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#E3EAE5',
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  sheetRemoveBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '800',
  },
  requiredAlertHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F1F16',
    marginBottom: 10,
  },
  requiredProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E3EAE5',
    marginBottom: 10,
  },
  requiredProductIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  requiredProductName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F1F16',
  },
  requiredProductPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F1F16',
  },
  addRequiredProductBtn: {
    borderWidth: 1.5,
    borderColor: '#E3EAE5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addRequiredProductBtnActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  addRequiredProductText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '800',
  },
  haveMyProductRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E3EAE5',
    marginTop: 6,
    marginBottom: 14,
  },
  haveMyProductText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F1F16',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C7D3CB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#16A34A',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
  },
});
