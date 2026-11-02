import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';

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

let googleMapsScriptPromise: Promise<boolean> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if ((window as any).google && (window as any).google.maps) {
    return Promise.resolve(true);
  }
  if (googleMapsScriptPromise) return googleMapsScriptPromise;

  googleMapsScriptPromise = new Promise((resolve) => {
    const existing = document.getElementById('gearzo-google-maps-js');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.id = 'gearzo-google-maps-js';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
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
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const [useFallbackEmbed, setUseFallbackEmbed] = useState(false);

  const zoom = zoomDelta <= 0.01 ? 16 : zoomDelta <= 0.03 ? 14 : zoomDelta <= 0.08 ? 12 : 11;

  useEffect(() => {
    let mounted = true;

    (window as any).gm_authFailure = () => {
      if (mounted) setUseFallbackEmbed(true);
    };

    loadGoogleMapsScript(DEFAULT_GOOGLE_MAPS_KEY).then((loaded) => {
      if (!mounted) return;
      if (!loaded || !(window as any).google?.maps || !mapDivRef.current) {
        setUseFallbackEmbed(true);
        return;
      }

      try {
        const gmaps = (window as any).google.maps;
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new gmaps.Map(mapDivRef.current, {
            center: { lat: latitude || 17.4485, lng: longitude || 78.3756 },
            zoom,
            disableDefaultUI: !interactive,
            gestureHandling: interactive ? 'greedy' : 'none',
            mapTypeControl: false,
            streetViewControl: false,
          });

          mapInstanceRef.current.addListener('click', (e: any) => {
            if (onLocationSelect && e.latLng) {
              onLocationSelect({
                latitude: e.latLng.lat(),
                longitude: e.latLng.lng(),
              });
            }
          });
        } else {
          mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude });
          mapInstanceRef.current.setZoom(zoom);
        }

        overlaysRef.current.forEach((o) => o.setMap(null));
        overlaysRef.current = [];

        if (radiusMeters && radiusMeters > 0) {
          const circle = new gmaps.Circle({
            strokeColor: '#1B5E20',
            strokeOpacity: 0.85,
            strokeWeight: 2,
            fillColor: '#16A34A',
            fillOpacity: 0.18,
            map: mapInstanceRef.current,
            center: { lat: latitude, lng: longitude },
            radius: radiusMeters,
          });
          overlaysRef.current.push(circle);
        }

        if (routeCoordinates.length >= 2) {
          const line = new gmaps.Polyline({
            path: routeCoordinates.map((c) => ({ lat: c.latitude, lng: c.longitude })),
            geodesic: true,
            strokeColor: '#16A34A',
            strokeOpacity: 0.9,
            strokeWeight: 4,
            map: mapInstanceRef.current,
          });
          overlaysRef.current.push(line);
        }

        markers.forEach((m) => {
          const marker = new gmaps.Marker({
            position: { lat: m.latitude, lng: m.longitude },
            map: mapInstanceRef.current,
            title: m.title || m.badgeText || '',
            label: m.iconText && m.iconText.length <= 2 ? m.iconText : undefined,
            draggable: Boolean(onLocationSelect && m.id === 'selected'),
          });

          if (onLocationSelect && m.id === 'selected') {
            marker.addListener('dragend', (e: any) => {
              if (e.latLng) {
                onLocationSelect({
                  latitude: e.latLng.lat(),
                  longitude: e.latLng.lng(),
                });
              }
            });
          }

          overlaysRef.current.push(marker);
        });
      } catch {
        setUseFallbackEmbed(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, [latitude, longitude, zoom, interactive, radiusMeters, JSON.stringify(markers), JSON.stringify(routeCoordinates)]);

  const embedUrl = `https://maps.google.com/maps?q=${latitude || 17.4485},${longitude || 78.3756}&z=${zoom}&output=embed`;

  return (
    <View style={[styles.container, style]}>
      {useFallbackEmbed ? (
        <iframe
          title="GearZo Google Map"
          src={embedUrl}
          style={{
            border: 0,
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div
          ref={mapDivRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      )}
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
});

