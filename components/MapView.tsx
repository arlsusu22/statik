import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  mapUrl?: string;
  activityType?: string;
  height?: string;
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({ mapUrl, activityType = 'run', height = '300px', className = '' }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map centered on a default location
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([51.505, -0.09], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);
    }

    // If mapUrl is provided (from Strava), display it as an overlay
    if (mapUrl) {
      // Strava provides static map images - we can overlay them or use the coordinates
      // For now, we'll display a placeholder with the map image as background
      if (mapContainer.current) {
        mapContainer.current.style.backgroundImage = `url('${mapUrl}')`;
        mapContainer.current.style.backgroundSize = 'cover';
        mapContainer.current.style.backgroundPosition = 'center';
      }
    }

    // Resize map on container resize
    const handleResize = () => {
      if (map.current) {
        map.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mapUrl]);

  return (
    <div
      ref={mapContainer}
      className={`rounded-lg overflow-hidden border border-white/10 shadow-lg bg-slate-800 ${className}`}
      style={{ height, position: 'relative' }}
    />
  );
};
