import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Button, Tag, Radio, message, Tooltip } from 'antd';
import {
  AimOutlined,
  EnvironmentOutlined,
  FlagOutlined,
  CompassOutlined,
  SyncOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

interface LeafletCoordinatePickerProps {
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  onChangePickup: (lat: number, lng: number, address?: string, city?: string) => void;
  onChangeDropoff: (lat: number, lng: number, address?: string, city?: string) => void;
  distanceKm?: number;
}

// Custom Leaflet DivIcons for Pickup and Dropoff pins
const createCustomIcon = (type: 'pickup' | 'dropoff') => {
  const isPickup = type === 'pickup';
  const bgColor = isPickup ? '#E8590C' : '#2F6FED'; // Orange for pickup, Blue for dropoff
  const label = isPickup ? '📍 PICKUP' : '🏁 DROPOFF';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          background-color: ${bgColor};
          color: white;
          font-weight: 800;
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          white-space: nowrap;
          border: 2px solid white;
          letter-spacing: 0.5px;
        ">
          ${label}
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${bgColor};
          margin-top: -1px;
        "></div>
      </div>
    `,
    iconSize: [80, 40],
    iconAnchor: [40, 40],
  });
};

export const LeafletCoordinatePicker: React.FC<LeafletCoordinatePickerProps> = ({
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  onChangePickup,
  onChangeDropoff,
  distanceKm,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropoffMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  const [activePinTarget, setActivePinTarget] = useState<'pickup' | 'dropoff'>('dropoff');
  const [geocoding, setGeocoding] = useState(false);

  // Initial center: Lagos (or pickup location if available)
  const defaultCenterLat = pickupLat || 6.5244;
  const defaultCenterLng = pickupLng || 3.3792;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const map = L.map(mapContainerRef.current, {
      center: [defaultCenterLat, defaultCenterLng],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Fix map render size issue in container
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Reverse Geocoding Helper
  const reverseGeocode = async (lat: number, lng: number): Promise<{ address?: string; city?: string }> => {
    try {
      setGeocoding(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        { headers: { 'User-Agent': 'HamzaRMB-Logistics/1.0' } }
      );
      if (!res.ok) return {};
      const data = await res.json();
      if (data && data.address) {
        const city = data.address.city || data.address.town || data.address.state || data.address.county || 'Lagos';
        const address = data.display_name ? data.display_name.split(',').slice(0, 3).join(',') : undefined;
        return { address, city };
      }
    } catch {
      // Ignore geocode network failure silently
    } finally {
      setGeocoding(false);
    }
    return {};
  };

  // Map Click Listener to Place Pin
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const roundedLat = Math.round(lat * 100000) / 100000;
      const roundedLng = Math.round(lng * 100000) / 100000;

      const geo = await reverseGeocode(roundedLat, roundedLng);

      if (activePinTarget === 'pickup') {
        onChangePickup(roundedLat, roundedLng, geo.address, geo.city);
        message.success(`Pickup pin placed at [${roundedLat}, ${roundedLng}]`);
      } else {
        onChangeDropoff(roundedLat, roundedLng, geo.address, geo.city);
        message.success(`Dropoff pin placed at [${roundedLat}, ${roundedLng}]`);
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [activePinTarget, onChangePickup, onChangeDropoff]);

  // Update Pickup Marker on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pickupLat != null && pickupLng != null) {
      if (!pickupMarkerRef.current) {
        const marker = L.marker([pickupLat, pickupLng], {
          icon: createCustomIcon('pickup'),
          draggable: true,
        }).addTo(map);

        marker.on('dragend', async () => {
          const pos = marker.getLatLng();
          const rLat = Math.round(pos.lat * 100000) / 100000;
          const rLng = Math.round(pos.lng * 100000) / 100000;
          const geo = await reverseGeocode(rLat, rLng);
          onChangePickup(rLat, rLng, geo.address, geo.city);
        });

        pickupMarkerRef.current = marker;
      } else {
        pickupMarkerRef.current.setLatLng([pickupLat, pickupLng]);
      }
    } else if (pickupMarkerRef.current) {
      map.removeLayer(pickupMarkerRef.current);
      pickupMarkerRef.current = null;
    }
  }, [pickupLat, pickupLng, onChangePickup]);

  // Update Dropoff Marker on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (dropoffLat != null && dropoffLng != null) {
      if (!dropoffMarkerRef.current) {
        const marker = L.marker([dropoffLat, dropoffLng], {
          icon: createCustomIcon('dropoff'),
          draggable: true,
        }).addTo(map);

        marker.on('dragend', async () => {
          const pos = marker.getLatLng();
          const rLat = Math.round(pos.lat * 100000) / 100000;
          const rLng = Math.round(pos.lng * 100000) / 100000;
          const geo = await reverseGeocode(rLat, rLng);
          onChangeDropoff(rLat, rLng, geo.address, geo.city);
        });

        dropoffMarkerRef.current = marker;
      } else {
        dropoffMarkerRef.current.setLatLng([dropoffLat, dropoffLng]);
      }
    } else if (dropoffMarkerRef.current) {
      map.removeLayer(dropoffMarkerRef.current);
      dropoffMarkerRef.current = null;
    }
  }, [dropoffLat, dropoffLng, onChangeDropoff]);

  // Draw Route Polyline & Fit Bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pickupLat != null && pickupLng != null && dropoffLat != null && dropoffLng != null) {
      const latlngs: L.LatLngExpression[] = [
        [pickupLat, pickupLng],
        [dropoffLat, dropoffLng],
      ];

      if (!polylineRef.current) {
        polylineRef.current = L.polyline(latlngs, {
          color: '#E8590C',
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.8,
        }).addTo(map);
      } else {
        polylineRef.current.setLatLngs(latlngs);
      }

      // Fit map bounds to show both pins
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng]);

  // Geolocation Handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      message.error('Geolocation is not supported by your browser.');
      return;
    }
    message.loading({ content: 'Locating current GPS position...', key: 'geo' });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const rLat = Math.round(pos.coords.latitude * 100000) / 100000;
        const rLng = Math.round(pos.coords.longitude * 100000) / 100000;

        const geo = await reverseGeocode(rLat, rLng);

        if (activePinTarget === 'pickup') {
          onChangePickup(rLat, rLng, geo.address, geo.city);
        } else {
          onChangeDropoff(rLat, rLng, geo.address, geo.city);
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([rLat, rLng], 14);
        }

        message.success({ content: `Located GPS: [${rLat}, ${rLng}]`, key: 'geo' });
      },
      (err) => {
        message.error({ content: `Geolocation error: ${err.message}`, key: 'geo' });
      }
    );
  };

  // Quick City Jumps
  const handleJumpToCity = (lat: number, lng: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 13);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Map Control Header */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <CompassOutlined className="text-brand-orange text-xl" />
          <div>
            <h3 className="text-sm font-bold text-white m-0">Interactive Leaflet GPS Map Picker</h3>
            <p className="text-[11px] text-slate-400 m-0">
              Click anywhere on the map to place pins or drag markers to refine coordinates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Radio.Group
            value={activePinTarget}
            onChange={(e) => setActivePinTarget(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="small"
          >
            <Radio.Button value="pickup" className={activePinTarget === 'pickup' ? '!bg-brand-orange !border-brand-orange' : ''}>
              📍 Set Pickup Pin
            </Radio.Button>
            <Radio.Button value="dropoff" className={activePinTarget === 'dropoff' ? '!bg-blue-600 !border-blue-600' : ''}>
              🏁 Set Dropoff Pin
            </Radio.Button>
          </Radio.Group>

          <Button
            size="small"
            icon={<AimOutlined />}
            className="bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700 font-bold"
            onClick={handleUseCurrentLocation}
          >
            My GPS Position
          </Button>
        </div>
      </div>

      {/* Map Leaflet Container */}
      <div className="relative w-full h-[360px] bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Quick City Jump Chips */}
        <div className="absolute top-3 right-3 z-[400] flex flex-wrap gap-1 max-w-[320px] bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase px-2 flex items-center">City Jump:</span>
          {[
            { name: 'Lagos', lat: 6.5244, lng: 3.3792 },
            { name: 'Abuja', lat: 9.0579, lng: 7.4951 },
            { name: 'Kano', lat: 12.0022, lng: 8.5920 },
            { name: 'Port Harcourt', lat: 4.8156, lng: 7.0498 },
            { name: 'Ibadan', lat: 7.3775, lng: 3.9470 },
          ].map((c) => (
            <Tag
              key={c.name}
              className="cursor-pointer font-bold text-[10px] hover:border-brand-orange hover:text-brand-orange m-0"
              onClick={() => handleJumpToCity(c.lat, c.lng)}
            >
              {c.name}
            </Tag>
          ))}
        </div>

        {/* Loading overlay for geocoding */}
        {geocoding && (
          <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-lg shadow flex items-center gap-2">
            <SyncOutlined spin className="text-amber-400" />
            <span>Fetching reverse address from GPS...</span>
          </div>
        )}
      </div>

      {/* Map Coordinates Summary Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-orange inline-block"></span>
            <span className="font-bold text-slate-700">Pickup GPS:</span>
            {pickupLat != null && pickupLng != null ? (
              <span className="font-mono font-bold text-slate-900">{pickupLat}, {pickupLng}</span>
            ) : (
              <span className="text-slate-400 italic">Not set (Click map)</span>
            )}
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
            <span className="font-bold text-slate-700">Dropoff GPS:</span>
            {dropoffLat != null && dropoffLng != null ? (
              <span className="font-mono font-bold text-slate-900">{dropoffLat}, {dropoffLng}</span>
            ) : (
              <span className="text-slate-400 italic">Not set (Click map)</span>
            )}
          </div>
        </div>

        {distanceKm != null && (
          <Tag color="orange" className="font-extrabold text-xs px-3 py-1 rounded-lg border-none">
            📏 Route Distance: {distanceKm} KM
          </Tag>
        )}
      </div>
    </div>
  );
};
