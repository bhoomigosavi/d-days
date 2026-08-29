"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { DashboardHeader } from '@/components/Header/DashboardHeader';
import { LeftControlSidebar } from '@/components/Sidebar/LeftControlSidebar';
import { RightDetailsPanel } from '@/components/Panel/RightDetailsPanel';
import { TokenModal } from '@/components/Modal/TokenModal';
import { 
  Vessel, 
  VesselType, 
  MapLayerState, 
  MapStyleId, 
  MaritimeAlert 
} from '@/types/maritime';
import { 
  MOCK_VESSELS, 
  MOCK_ALERTS, 
  MOCK_WEATHER, 
  INITIAL_MAP_CENTER 
} from '@/data/mockMaritimeData';

// Dynamically import MaritimeMap to avoid any SSR window issues with Mapbox GL
const MaritimeMap = dynamic(
  () => import('@/components/Map/MaritimeMap').then((mod) => mod.MaritimeMap),
  { ssr: false }
);

export default function MaritimeDashboardPage() {
  const [vessels, setVessels] = useState<Vessel[]>(MOCK_VESSELS);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<VesselType[]>([
    'Tanker', 
    'Cargo', 
    'Military', 
    'Fishing', 
    'Tug', 
    'Special'
  ]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [layers, setLayers] = useState<MapLayerState>({
    vessels: true,
    shippingLanes: true,
    eezBoundary: true,
    oilFields: true,
    weatherRadar: true,
    radarSweep: true,
    rangeRings: true,
    highRiskZones: true,
    tracks: true,
  });

  const [currentStyle, setCurrentStyle] = useState<MapStyleId>('dark-satellite');
  const [cursorCoords, setCursorCoords] = useState<[number, number] | null>(null);
  const [focusTarget, setFocusTarget] = useState<[number, number] | null>(null);
  
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  // Load custom token from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('mapbox_custom_token');
    if (saved) {
      setMapboxToken(saved);
    }
  }, []);

  const handleSaveToken = (token: string) => {
    setMapboxToken(token);
    if (token) {
      localStorage.setItem('mapbox_custom_token', token);
    } else {
      localStorage.removeItem('mapbox_custom_token');
    }
  };

  const handleToggleType = (type: VesselType) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSelectAllTypes = () => {
    const allTypes: VesselType[] = ['Tanker', 'Cargo', 'Military', 'Fishing', 'Tug', 'Special'];
    if (selectedTypes.length === allTypes.length) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes(allTypes);
    }
  };

  const handleToggleLayer = (layerKey: keyof MapLayerState) => {
    setLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  const handleFocusAlert = (alert: MaritimeAlert) => {
    if (alert.coordinates) {
      setFocusTarget(alert.coordinates);
    }
    if (alert.vesselId) {
      const vessel = vessels.find(v => v.id === alert.vesselId);
      if (vessel) {
        setSelectedVessel(vessel);
      }
    }
  };

  const handleFocusVessel = (vessel: Vessel | null) => {
    if (vessel) {
      setFocusTarget(vessel.coordinates);
      setSelectedVessel(vessel);
    } else {
      setSelectedVessel(null);
    }
  };

  const handleCenterArabianSea = () => {
    setFocusTarget(INITIAL_MAP_CENTER);
  };

  const filteredVessels = vessels.filter(v => {
    const matchesType = selectedTypes.includes(v.type);
    const matchesSearch = 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.mmsi.includes(searchQuery) ||
      v.imo.includes(searchQuery) ||
      v.callSign.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const anomaliesCount = vessels.filter(v => v.riskScore > 50).length;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      
      {/* Top Bar Header */}
      <DashboardHeader
        cursorCoords={cursorCoords}
        activeVesselsCount={filteredVessels.length}
        anomaliesCount={anomaliesCount}
        onOpenTokenModal={() => setIsTokenModalOpen(true)}
        hasCustomToken={Boolean(mapboxToken && mapboxToken.length > 10)}
      />

      {/* Main Full-Screen Body */}
      <div className="flex flex-1 h-[calc(100vh-3.5rem)] w-full overflow-hidden relative">
        
        {/* Left Sidebar (300px) */}
        <LeftControlSidebar
          vessels={vessels}
          selectedVessel={selectedVessel}
          onSelectVessel={handleFocusVessel}
          selectedTypes={selectedTypes}
          onToggleType={handleToggleType}
          onSelectAllTypes={handleSelectAllTypes}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          layers={layers}
          onToggleLayer={handleToggleLayer}
          currentStyle={currentStyle}
          onChangeStyle={setCurrentStyle}
          alerts={MOCK_ALERTS}
          onFocusAlert={handleFocusAlert}
          onCenterArabianSea={handleCenterArabianSea}
        />

        {/* Center Full-Screen Map */}
        <div className="flex-1 relative h-full">
          <MaritimeMap
            vessels={filteredVessels}
            selectedVessel={selectedVessel}
            onSelectVessel={setSelectedVessel}
            layers={layers}
            currentStyle={currentStyle}
            onCursorMove={setCursorCoords}
            mapboxToken={mapboxToken}
            focusTarget={focusTarget}
            onFocusHandled={() => setFocusTarget(null)}
          />
        </div>

        {/* Right Details Panel (350px) */}
        <RightDetailsPanel
          selectedVessel={selectedVessel}
          onClose={() => setSelectedVessel(null)}
          onFocusVessel={handleFocusVessel}
          weather={MOCK_WEATHER}
          allVesselsCount={vessels.length}
        />

      </div>

      {/* Token Modal */}
      <TokenModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        currentToken={mapboxToken}
        onSaveToken={handleSaveToken}
      />

    </div>
  );
}
