"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Vessel, 
  MapLayerState, 
  MapStyleId, 
  MaritimeAlert 
} from '@/types/maritime';
import { 
  INITIAL_MAP_CENTER, 
  INITIAL_MAP_ZOOM, 
  MARITIME_GEOJSON 
} from '@/data/mockMaritimeData';
import { getVesselColor, formatCoordinates } from '@/lib/utils';
import { 
  Compass, 
  Plus, 
  Minus, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Ruler, 
  Layers, 
  Crosshair,
  Radio,
  Eye
} from 'lucide-react';

interface MaritimeMapProps {
  vessels: Vessel[];
  selectedVessel: Vessel | null;
  onSelectVessel: (vessel: Vessel | null) => void;
  layers: MapLayerState;
  currentStyle: MapStyleId;
  onCursorMove: (coords: [number, number]) => void;
  mapboxToken: string;
  focusTarget: [number, number] | null;
  onFocusHandled: () => void;
}

export const MaritimeMap: React.FC<MaritimeMapProps> = ({
  vessels,
  selectedVessel,
  onSelectVessel,
  layers,
  currentStyle,
  onCursorMove,
  mapboxToken,
  focusTarget,
  onFocusHandled
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [id: string]: mapboxgl.Marker }>({});
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [pitch3D, setPitch3D] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measureDistanceNm, setMeasureDistanceNm] = useState<number | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(INITIAL_MAP_ZOOM);

  // Helper to get map style spec
  const getStyleSpec = useCallback((styleId: MapStyleId, token: string) => {
    const hasValidToken = token && token.trim().length > 10;

    if (!hasValidToken) {
      // High-resolution satellite raster fallback with dark ocean styling
      return {
        version: 8 as const,
        sources: {
          'esri-satellite': {
            type: 'raster' as const,
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: 'Esri, Maxar, Earthstar Geographics'
          },
          'carto-dark-labels': {
            type: 'raster' as const,
            tiles: [
              'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_only_labels/{z}/{x}/{y}.png'
            ],
            tileSize: 256
          }
        },
        layers: [
          {
            id: 'satellite-base',
            type: 'raster' as const,
            source: 'esri-satellite',
            paint: {
              'raster-brightness-max': styleId === 'dark-satellite' ? 0.72 : 0.9,
              'raster-contrast': styleId === 'dark-satellite' ? 0.25 : 0.05,
              'raster-saturation': styleId === 'dark-satellite' ? -0.3 : 0.1
            }
          },
          {
            id: 'labels-layer',
            type: 'raster' as const,
            source: 'carto-dark-labels',
            paint: {
              'raster-opacity': 0.85
            }
          }
        ]
      };
    }

    switch (styleId) {
      case 'dark-satellite':
        return 'mapbox://styles/mapbox/satellite-streets-v12';
      case 'satellite-streets':
        return 'mapbox://styles/mapbox/satellite-streets-v12';
      case 'tactical-dark':
        return 'mapbox://styles/mapbox/dark-v11';
      case 'bathymetry':
        return 'mapbox://styles/mapbox/navigation-night-v1';
      default:
        return 'mapbox://styles/mapbox/satellite-streets-v12';
    }
  }, []);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const token = mapboxToken || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
    if (token && token.trim().length > 10) {
      mapboxgl.accessToken = token;
    }

    const styleSpec = getStyleSpec(currentStyle, token);

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: styleSpec,
      center: INITIAL_MAP_CENTER,
      zoom: INITIAL_MAP_ZOOM,
      pitch: 20,
      bearing: -5,
      attributionControl: false,
      maxZoom: 18,
      minZoom: 3,
    });

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      mapRef.current = map;
      setMapLoaded(true);
      addGeoJsonLayers(map);
    });

    map.on('mousemove', (e) => {
      onCursorMove([e.lngLat.lng, e.lngLat.lat]);
    });

    map.on('zoom', () => {
      setCurrentZoom(map.getZoom());
    });

    return () => {
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, [mapboxToken]);

  // Handle style changes dynamically
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const token = mapboxToken || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
    const styleSpec = getStyleSpec(currentStyle, token);
    
    mapRef.current.setStyle(styleSpec);

    mapRef.current.once('style.load', () => {
      if (mapRef.current) {
        addGeoJsonLayers(mapRef.current);
      }
    });
  }, [currentStyle, getStyleSpec, mapboxToken]);

  // Focus on target when requested
  useEffect(() => {
    if (!mapRef.current || !focusTarget) return;

    mapRef.current.flyTo({
      center: focusTarget,
      zoom: Math.max(mapRef.current.getZoom(), 8.5),
      speed: 1.4,
      curve: 1.2,
      essential: true
    });

    onFocusHandled();
  }, [focusTarget, onFocusHandled]);

  // Add Operational GeoJSON layers (Shipping corridors, Oil field, EEZ, High risk zone, Range rings)
  const addGeoJsonLayers = (map: mapboxgl.Map) => {
    // 1. Bombay High Oil Field Polygon
    if (!map.getSource('bombay-high-src')) {
      map.addSource('bombay-high-src', {
        type: 'geojson',
        data: MARITIME_GEOJSON.bombayHighOilField
      });

      map.addLayer({
        id: 'bombay-high-fill',
        type: 'fill',
        source: 'bombay-high-src',
        paint: {
          'fill-color': '#f59e0b',
          'fill-opacity': 0.12
        }
      });

      map.addLayer({
        id: 'bombay-high-line',
        type: 'line',
        source: 'bombay-high-src',
        paint: {
          'line-color': '#f59e0b',
          'line-width': 1.5,
          'line-dasharray': [3, 2]
        }
      });
    }

    // 2. Shipping Corridors (TSS North & South)
    if (!map.getSource('tss-north-src')) {
      map.addSource('tss-north-src', {
        type: 'geojson',
        data: MARITIME_GEOJSON.shippingCorridorNorthbound
      });

      map.addLayer({
        id: 'tss-north-glow',
        type: 'line',
        source: 'tss-north-src',
        paint: {
          'line-color': '#06b6d4',
          'line-width': 4,
          'line-opacity': 0.25,
          'line-blur': 3
        }
      });

      map.addLayer({
        id: 'tss-north-line',
        type: 'line',
        source: 'tss-north-src',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 2,
          'line-dasharray': [4, 3]
        }
      });
    }

    if (!map.getSource('tss-south-src')) {
      map.addSource('tss-south-src', {
        type: 'geojson',
        data: MARITIME_GEOJSON.shippingCorridorSouthbound
      });

      map.addLayer({
        id: 'tss-south-glow',
        type: 'line',
        source: 'tss-south-src',
        paint: {
          'line-color': '#06b6d4',
          'line-width': 4,
          'line-opacity': 0.25,
          'line-blur': 3
        }
      });

      map.addLayer({
        id: 'tss-south-line',
        type: 'line',
        source: 'tss-south-src',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 2,
          'line-dasharray': [4, 3]
        }
      });
    }

    // 3. Indian EEZ Boundary
    if (!map.getSource('eez-src')) {
      map.addSource('eez-src', {
        type: 'geojson',
        data: MARITIME_GEOJSON.indianEezLine
      });

      map.addLayer({
        id: 'eez-line',
        type: 'line',
        source: 'eez-src',
        paint: {
          'line-color': '#6366f1',
          'line-width': 2,
          'line-dasharray': [6, 4]
        }
      });
    }

    // 4. High Risk Surveillance Area
    if (!map.getSource('hra-src')) {
      map.addSource('hra-src', {
        type: 'geojson',
        data: MARITIME_GEOJSON.highRiskArea
      });

      map.addLayer({
        id: 'hra-fill',
        type: 'fill',
        source: 'hra-src',
        paint: {
          'fill-color': '#ef4444',
          'fill-opacity': 0.08
        }
      });

      map.addLayer({
        id: 'hra-line',
        type: 'line',
        source: 'hra-src',
        paint: {
          'line-color': '#ef4444',
          'line-width': 1.8,
          'line-dasharray': [4, 2]
        }
      });
    }

    // 5. Vessel Track Lines (Source for active breadcrumbs)
    if (!map.getSource('vessel-tracks-src')) {
      const tracksGeoJson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: vessels.map(v => ({
          type: 'Feature',
          properties: { id: v.id, name: v.name, type: v.type },
          geometry: {
            type: 'LineString',
            coordinates: v.history
          }
        }))
      };

      map.addSource('vessel-tracks-src', {
        type: 'geojson',
        data: tracksGeoJson
      });

      map.addLayer({
        id: 'vessel-tracks-line',
        type: 'line',
        source: 'vessel-tracks-src',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 1.8,
          'line-dasharray': [2, 2],
          'line-opacity': 0.6
        }
      });
    }
  };

  // Update Layer Visibilities
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    const setVisibility = (layerId: string, visible: boolean) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    };

    setVisibility('bombay-high-fill', layers.oilFields);
    setVisibility('bombay-high-line', layers.oilFields);

    setVisibility('tss-north-glow', layers.shippingLanes);
    setVisibility('tss-north-line', layers.shippingLanes);
    setVisibility('tss-south-glow', layers.shippingLanes);
    setVisibility('tss-south-line', layers.shippingLanes);

    setVisibility('eez-line', layers.eezBoundary);

    setVisibility('hra-fill', layers.highRiskZones);
    setVisibility('hra-line', layers.highRiskZones);

    setVisibility('vessel-tracks-line', layers.tracks);
  }, [layers, mapLoaded]);

  // Render & Synchronize HTML Markers for Vessels
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    // Clear old markers if vessels layer is turned off
    if (!layers.vessels) {
      Object.values(markersRef.current).forEach(m => m.remove());
      markersRef.current = {};
      return;
    }

    const currentVesselIds = new Set(vessels.map(v => v.id));

    // Remove markers no longer in filtered list
    Object.keys(markersRef.current).forEach(id => {
      if (!currentVesselIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Create or update markers
    vessels.forEach(vessel => {
      const isSelected = selectedVessel?.id === vessel.id;
      const isAnomaly = vessel.riskScore > 50;
      const color = getVesselColor(vessel.type);

      let marker = markersRef.current[vessel.id];

      if (!marker) {
        // Create custom tactical vessel marker element
        const el = document.createElement('div');
        el.className = 'tactical-vessel-marker group cursor-pointer';
        el.id = `vessel-marker-${vessel.id}`;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectVessel(vessel);
        });

        marker = new mapboxgl.Marker({
          element: el,
          rotationAlignment: 'map',
          pitchAlignment: 'map',
        })
          .setLngLat(vessel.coordinates)
          .addTo(map);

        markersRef.current[vessel.id] = marker;
      }

      // Update marker coordinates & appearance
      marker.setLngLat(vessel.coordinates);
      const el = marker.getElement();

      el.innerHTML = `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2" style="width: 44px; height: 44px;">
          ${isSelected ? `
            <div class="absolute inset-0 rounded-full border-2 border-sky-400 animate-ping opacity-75"></div>
            <div class="absolute inset-1 rounded-full border border-sky-300 shadow-[0_0_12px_#38bdf8]"></div>
          ` : ''}

          ${isAnomaly ? `
            <div class="absolute inset-1.5 rounded-full border-2 border-rose-500 animate-ping opacity-60"></div>
          ` : ''}

          <!-- Vessel Directional Triangle Icon -->
          <div 
            class="w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300"
            style="
              background-color: rgba(15, 23, 42, 0.95);
              border: 1.5px solid ${color};
              box-shadow: 0 0 10px ${color}80;
            "
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="${color}" 
              stroke="#0f172a" 
              stroke-width="1.5"
              style="transform: rotate(${vessel.heading}deg); transform-origin: center;"
            >
              <path d="M12 2L19 21L12 17L5 21L12 2Z" />
            </svg>
          </div>

          <!-- Mini Target Speed / Name Pill (visible on hover or when selected) -->
          <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-[9px] font-mono text-slate-200 pointer-events-none shadow-md ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity">
            ${vessel.name} (${vessel.sog} kts)
          </div>
        </div>
      `;
    });

  }, [vessels, selectedVessel, layers.vessels, mapLoaded, onSelectVessel]);

  // Interactive controls actions
  const handleZoomIn = () => mapRef.current?.zoomIn({ duration: 300 });
  const handleZoomOut = () => mapRef.current?.zoomOut({ duration: 300 });
  
  const handleToggle3D = () => {
    if (!mapRef.current) return;
    const nextPitch = pitch3D ? 0 : 55;
    mapRef.current.easeTo({ pitch: nextPitch, duration: 600 });
    setPitch3D(!pitch3D);
  };

  const handleResetBearing = () => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({ bearing: 0, pitch: 0, duration: 500 });
    setPitch3D(false);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  return (
    <div className="relative flex-1 h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-slate-950">
      
      {/* Mapbox Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Dynamic Tactical Radar Sweep Simulation Overlay */}
      {layers.radarSweep && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-10 opacity-35">
          <div className="w-[850px] h-[850px] rounded-full border border-emerald-500/30 relative">
            <div className="radar-scanner" />
            <div className="absolute inset-[15%] rounded-full border border-emerald-500/20" />
            <div className="absolute inset-[35%] rounded-full border border-emerald-500/20" />
            <div className="absolute inset-[60%] rounded-full border border-emerald-500/20" />
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-emerald-500/20" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-emerald-500/20" />
          </div>
        </div>
      )}

      {/* Tactical Center Crosshair Reticle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 opacity-40">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-sky-400" />
          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-sky-400" />
          <div className="absolute inset-2 rounded-full border border-sky-400" />
        </div>
      </div>

      {/* Nautical Range Rings Overlay centered on Mumbai High */}
      {layers.rangeRings && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 opacity-40">
          <div className="w-[300px] h-[300px] rounded-full border border-dashed border-sky-400/40 relative flex items-center justify-center">
            <span className="absolute top-1 font-mono text-[9px] text-sky-400/80 bg-slate-950/80 px-1 rounded">50 NM</span>
            <div className="w-[600px] h-[600px] rounded-full border border-dashed border-sky-400/30 relative flex items-center justify-center">
              <span className="absolute top-1 font-mono text-[9px] text-sky-400/80 bg-slate-950/80 px-1 rounded">100 NM</span>
              <div className="w-[900px] h-[900px] rounded-full border border-dashed border-sky-400/20 relative flex items-center justify-center">
                <span className="absolute top-1 font-mono text-[9px] text-sky-400/80 bg-slate-950/80 px-1 rounded">150 NM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Tactical On-Screen Controls */}
      <div className="absolute right-4 top-4 z-20 flex flex-col space-y-2 select-none">
        
        <div className="flex flex-col bg-slate-900/90 border border-slate-700/80 rounded-lg backdrop-blur-md overflow-hidden shadow-xl">
          <button
            onClick={handleZoomIn}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-all border-b border-slate-800"
            title="Zoom In (+)"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleZoomOut}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            title="Zoom Out (-)"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col bg-slate-900/90 border border-slate-700/80 rounded-lg backdrop-blur-md overflow-hidden shadow-xl">
          <button
            onClick={handleToggle3D}
            className={`p-2.5 transition-all border-b border-slate-800 ${
              pitch3D ? 'bg-sky-500/20 text-sky-300' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle 3D Pitch View"
          >
            <span className="font-mono text-xs font-bold block">3D</span>
          </button>

          <button
            onClick={handleResetBearing}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-all border-b border-slate-800"
            title="Reset North Orientation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Floating Tactical HUD Info Overlay (Bottom Left of map) */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center space-x-3 text-[11px] font-mono text-slate-300">
        <div className="bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded backdrop-blur-md shadow-lg flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500">ZOOM:</span>
            <span className="text-sky-400 font-bold">{currentZoom.toFixed(1)}x</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500">PROJECTION:</span>
            <span className="text-slate-200">MERCATOR / WGS84</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500">DATUM:</span>
            <span className="text-emerald-400">ARABIAN SEA 18.5°N 72.5°E</span>
          </div>
        </div>
      </div>

    </div>
  );
};
