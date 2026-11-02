import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import MapView, { Marker, Circle, Polyline, Region } from 'react-native-maps';

export const DEFAULT_GOOGLE_MAPS_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || 'AIzaSyBuAtqTFqh8QMc0hIbAI7MozwGanxKdhQA';

export interface GearzoMapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  color?: string;
  badgeText?: string;
  iconText?: string;
}

export interface GearzoMapProps {
  latitude: number;
  longitude: number;
  zoomDelta?: number;
  markers?: GearzoMapMarker[];
  routeCoordinates?: Array<{ latitude: number; longitude: number }>;
  radiusMeters?: number;
  onLocationSelect?: (coord: { latitude: number; longitude: number }) => void;
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export interface ReverseGeocodeResult {
  formattedAddress: string;
  area: string;
  city: string;
  pincode: string;
}

export async function reverseGeocodeGoogle(
  latitude: number,
  longitude: number,
  apiKey: string = DEFAULT_GOOGLE_MAPS_KEY
): Promise<ReverseGeocodeResult | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const first = data.results[0];
      const comps: any[] = first.address_components || [];
      const getComp = (types: string[]) =>
        comps.find((c) => types.some((t) => c.types?.includes(t)))?.long_name || '';

      const sublocality =
        getComp(['sublocality_level_1', 'sublocality', 'neighborhood', 'route']) ||
        first.formatted_address?.split(',')[0] ||
        '';
      const city =
        getComp(['locality', 'administrative_area_level_2']) || 'Hyderabad';
      const pincode = getComp(['postal_code']) || '';

      return {
        formattedAddress: first.formatted_address || '',
        area: sublocality,
        city,
        pincode,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export const GearzoMap: React.FC<GearzoMapProps> = ({
  latitude,
  longitude,
  zoomDelta = 0.025,
  markers = [],
  routeCoordinates = [],
  radiusMeters,
  onLocationSelect,
  interactive = true,
  style,
  children,
}) => {
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (mapRef.current && latitude && longitude) {
      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: zoomDelta,
          longitudeDelta: zoomDelta,
        },
        450
      );
    }
  }, [latitude, longitude, zoomDelta]);

  const initialRegion: Region = {
    latitude: latitude || 17.4485,
    longitude: longitude || 78.3756,
    latitudeDelta: zoomDelta,
    longitudeDelta: zoomDelta,
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={interactive}
        pitchEnabled={interactive}
        showsUserLocation={true}
        showsMyLocationButton={interactive}
        onPress={(e) => {
          if (onLocationSelect && e.nativeEvent.coordinate) {
            onLocationSelect(e.nativeEvent.coordinate);
          }
        }}
      >
        {radiusMeters && radiusMeters > 0 ? (
          <Circle
            center={{ latitude, longitude }}
            radius={radiusMeters}
            strokeWidth={2}
            strokeColor="#1B5E20"
            fillColor="rgba(22, 163, 74, 0.16)"
          />
        ) : null}

        {routeCoordinates.length >= 2 ? (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#16A34A"
            strokeWidth={4}
            lineDashPattern={[6, 4]}
          />
        ) : null}

        {markers.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            title={m.title}
            description={m.description}
            draggable={Boolean(onLocationSelect && m.id === 'selected')}
            onDragEnd={(e) => {
              if (onLocationSelect && e.nativeEvent.coordinate) {
                onLocationSelect(e.nativeEvent.coordinate);
              }
            }}
          >
            {m.badgeText || m.iconText ? (
              <View style={styles.customMarkerWrap}>
                {m.badgeText ? (
                  <View
                    style={[
                      styles.markerBadge,
                      { backgroundColor: m.color || '#1B5E20' },
                    ]}
                  >
                    <Text style={styles.markerBadgeText}>{m.badgeText}</Text>
                  </View>
                ) : null}
                <View
                  style={[
                    styles.markerPinCircle,
                    { borderColor: m.color || '#16A34A' },
                  ]}
                >
                  <Text style={styles.markerIconText}>{m.iconText || '📍'}</Text>
                </View>
              </View>
            ) : undefined}
          </Marker>
        ))}
      </MapView>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E8F5E9',
  },
  customMarkerWrap: {
    alignItems: 'center',
  },
  markerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 3,
  },
  markerBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  markerPinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  markerIconText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B4A27',
  },
});

