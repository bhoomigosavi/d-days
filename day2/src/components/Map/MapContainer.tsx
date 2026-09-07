import React, { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { SpillLayer } from '../SpillLayer/SpillLayer';
import { SpillPanel } from '../SpillPanel/SpillPanel';
import { 
  MOCK_PRIMARY_SPILL, 
  MOCK_SECONDARY_SPILL, 
  MOCK_MULTIPOLYGON_SPILL, 
  MOCK_SPILL_COLLECTION 
} from '../../data/mockSpillData';
import { SpillFeature, SpillGeoJSONInput } from '../../types/spill';
import { normalizeSpillGeoJSON } from '../../utils/geoUtils';
import { Layers, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Button } from '../ui/button';

interface MapContainerProps {
  mapboxToken?: string;
  initialData?: SpillGeoJSONInput;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  mapboxToken = '',
  initialData = MOCK_PRIMARY_SPILL
}) => {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [selectedSpillKey, setSelectedSpillKey] = useState<'primary' | 'secondary' | 'multi' | 'all'>('primary');
  
  // Customization controls
  const [fillOpacity, setFillOpacity] = useState<number>(0.35);
  const [borderWidth, setBorderWidth] = useState<number>(2.5);
  const [showPulsingDot, setShowPulsingDot] = useState<boolean>(true);
  const [layerVisible, setLayerVisible] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [panelTheme, setPanelTheme] = useState<'light' | 'dark'>('dark');

  // Currently selected feature for SpillPanel
  const [selectedFeature, setSelectedFeature] = useState<SpillFeature | null>(MOCK_PRIMARY_SPILL);

  // Determine current active GeoJSON
  const currentSpillData: SpillGeoJSONInput = useMemo(() => {
    switch (selectedSpillKey) {
      case 'primary':
        return MOCK_PRIMARY_SPILL;
      case 'secondary':
        return MOCK_SECONDARY_SPILL;
      case 'multi':
        return MOCK_MULTIPOLYGON_SPILL;
      case 'all':
        return MOCK_SPILL_COLLECTION;
      default:
        return initialData;
    }
  }, [selectedSpillKey, initialData]);

  // Synchronize selected feature when preset scenario changes
  useEffect(() => {
    const collection = normalizeSpillGeoJSON(currentSpillData);
    if (collection.features.length > 0) {
      setSelectedFeature(collection.features[0]);
    }
  }, [currentSpillData]);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapDivRef.current) return;

    let envToken = '';
    try {
      if (typeof process !== 'undefined' && process.env) {
        envToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
      }
    } catch {
      // Ignored in strict browser sandboxes
    }

    const token = mapboxToken || envToken;
    const hasValidToken = Boolean(token && token.trim().length > 10);

    if (hasValidToken) {
      mapboxgl.accessToken = token;
    }

    const styleSpec = hasValidToken
      ? 'mapbox://styles/mapbox/satellite-streets-v12'
      : {
          version: 8 as const,
          sources: {
            'satellite-tiles': {
              type: 'raster' as const,
              tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
              ],
              tileSize: 256,
              attribution: 'Esri, Maxar, Earthstar Geographics'
            },
            'dark-labels': {
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
              source: 'satellite-tiles',
              paint: {
                'raster-brightness-max': 0.85,
                'raster-contrast': 0.15,
                'raster-saturation': -0.1
              }
            },
            {
              id: 'labels-top',
              type: 'raster' as const,
              source: 'dark-labels',
              paint: {
                'raster-opacity': 0.8
              }
            }
          ]
        };

    const map = new mapboxgl.Map({
      container: mapDivRef.current,
      style: styleSpec,
      center: [72.32, 18.65], // Bombay High / Arabian Sea
      zoom: 9,
      pitch: 28,
      bearing: -10,
      attributionControl: false
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-left');
    map.addControl(new mapboxgl.ScaleControl({ unit: 'nautical' }), 'bottom-left');

    map.on('load', () => {
      setMapInstance(map);
    });

    return () => {
      map.remove();
      setMapInstance(null);
    };
  }, [mapboxToken]);

  // Handle polygon click from SpillLayer
  const handleSpillClick = (
    _e: mapboxgl.MapLayerMouseEvent | MouseEvent, 
    feature: SpillFeature, 
    _centroid: [number, number]
  ) => {
    setSelectedFeature(feature);
    setIsSidebarOpen(true);
  };

  // Focus map on centroid
  const handleFocusOnMap = (centroid: [number, number], zoom = 10) => {
    if (!mapInstance) return;
    mapInstance.flyTo({
      center: centroid,
      zoom,
      speed: 1.2,
      curve: 1.4,
      essential: true
    });
  };

  return (
    <div className="relative flex w-full h-screen bg-zinc-950 overflow-hidden select-none">
      
      {/* Main Mapbox Canvas Container */}
      <div className="relative flex-1 h-full w-full">
        <div ref={mapDivRef} className="w-full h-full" />

        {/* SpillLayer Mapbox Component */}
        {mapInstance && (
          <SpillLayer
            map={mapInstance}
            data={currentSpillData}
            id="active-oil-spill"
            fillColor="#ef4444"
            fillOpacity={fillOpacity}
            borderColor="#dc2626"
            borderWidth={borderWidth}
            showPulsingDot={showPulsingDot}
            pulseColor="#ef4444"
            pulseSize={36}
            visible={layerVisible}
            interactive={true}
            onSpillClick={handleSpillClick}
          />
        )}

        {/* Top Floating Mini Controller for Testing Scenarios */}
        <div className="absolute top-4 left-14 z-20 flex items-center space-x-2 bg-zinc-900/90 text-zinc-100 p-1.5 rounded-lg border border-zinc-800 backdrop-blur-md shadow-xl text-xs font-medium">
          <div className="flex items-center space-x-1 px-2 border-r border-zinc-800">
            <Layers className="w-3.5 h-3.5 text-rose-500" />
            <span className="font-semibold text-zinc-300">Scenario:</span>
          </div>

          {[
            { id: 'primary', label: 'Bombay High' },
            { id: 'secondary', label: 'Harbour Sheen' },
            { id: 'multi', label: 'Multi-Polygon' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedSpillKey(item.id as any)}
              className={`px-2.5 py-1 rounded transition-colors ${
                selectedSpillKey === item.id 
                  ? 'bg-rose-600 text-white font-bold' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Toggle Sidebar Floating Trigger (if sidebar is closed) */}
        {!isSidebarOpen && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 right-4 z-20 gap-1.5 bg-zinc-900/90 text-zinc-100 border-zinc-800 backdrop-blur-md shadow-xl text-xs font-semibold"
          >
            <PanelRightOpen className="w-4 h-4 text-rose-500" />
            <span>Show Spill Panel</span>
          </Button>
        )}
      </div>

      {/* SpillPanel Sidebar Component */}
      {isSidebarOpen && (
        <SpillPanel
          feature={selectedFeature}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onFocusOnMap={handleFocusOnMap}
          theme={panelTheme}
          onToggleTheme={() => setPanelTheme(prev => prev === 'dark' ? 'light' : 'dark')}
          onDispatchAlert={(feat) => {
            alert(`🚨 Containment Alert Dispatched for ${feat.properties?.name || 'Spill Incident'}!`);
          }}
          className="w-80 sm:w-96 flex-shrink-0"
        />
      )}

    </div>
  );
};

export default MapContainer;
