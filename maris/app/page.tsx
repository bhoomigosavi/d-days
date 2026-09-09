'use client';

import React, { useState, useCallback } from 'react';
import { InteractiveMap } from '@/components/map/MapContainer';
import { Header } from '@/components/panels/Header';
import { Sidebar } from '@/components/panels/Sidebar';
import { SARUploadModal } from '@/components/panels/SARUploadModal';
import { IncidentModal } from '@/components/panels/IncidentModal';
import { TelemetryBar } from '@/components/hud/TelemetryBar';

import { INITIAL_SPILLS } from '@/data/indiaSpills';
import { INITIAL_VESSELS } from '@/data/indiaVessels';
import { OilSpill, Vessel, TelemetryState } from '@/types/maris';

export default function MarisDashboard() {
  const [spills, setSpills] = useState<OilSpill[]>(INITIAL_SPILLS);
  const [vessels, setVessels] = useState<Vessel[]>(INITIAL_VESSELS);
  const [selectedSpill, setSelectedSpill] = useState<OilSpill | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);

  // Modals
  const [isSARModalOpen, setIsSARModalOpen] = useState<boolean>(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState<boolean>(false);

  // Programmatic map centering
  const [focusedCoordinates, setFocusedCoordinates] = useState<[number, number] | null>(null);

  // Telemetry HUD state
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    cursorLat: 19.4205,
    cursorLng: 71.3421,
    scaleKm: 10,
    bearingDeg: 45,
    activeSpillsCount: INITIAL_SPILLS.length,
    activeVesselsCount: INITIAL_VESSELS.length,
    containmentRatePercent: 40,
    sarSatelliteOnline: true,
  });

  const handleCursorMove = useCallback((lat: number, lng: number) => {
    setTelemetry((prev) => ({
      ...prev,
      cursorLat: lat,
      cursorLng: lng,
    }));
  }, []);

  const handleSelectSpill = (spill: OilSpill) => {
    setSelectedSpill(spill);
    setSelectedVessel(null);
    setFocusedCoordinates([spill.lat, spill.lng]);
    setIsIncidentModalOpen(true);
  };

  const handleSelectVessel = (vessel: Vessel) => {
    setSelectedVessel(vessel);
    setSelectedSpill(null);
    setFocusedCoordinates([vessel.lat, vessel.lng]);
    setIsIncidentModalOpen(true);
  };

  const handleAddNewSpill = (newSpill: OilSpill) => {
    setSpills((prev) => [newSpill, ...prev]);
    handleSelectSpill(newSpill);
  };

  const handleUpdateSpillStatus = (spillId: string, newStatus: OilSpill['containmentStatus']) => {
    setSpills((prev) =>
      prev.map((s) => (s.id === spillId ? { ...s, containmentStatus: newStatus } : s))
    );
    if (selectedSpill && selectedSpill.id === spillId) {
      setSelectedSpill((prev) => (prev ? { ...prev, containmentStatus: newStatus } : null));
    }
  };

  return (
    <div className="bg-background text-on-surface h-screen w-full overflow-hidden flex flex-col font-sans antialiased relative">
      {/* 
        LAYER 0 & 1: FULL-SCREEN INTERACTIVE MAP BACKGROUND
        Centered on India & surrounding maritime waters
      */}
      <InteractiveMap
        spills={spills}
        vessels={vessels}
        selectedSpill={selectedSpill}
        selectedVessel={selectedVessel}
        onSelectSpill={handleSelectSpill}
        onSelectVessel={handleSelectVessel}
        onCursorMove={handleCursorMove}
        showSlickPolygons={true}
        showVessels={true}
        showSARSwaths={true}
        showCoastalZones={true}
        simulationHour={0}
        focusedCoordinates={focusedCoordinates}
      />

      {/* 
        LAYER 10: STITCH TOPNAVBAR (Fixed header)
      */}
      <Header />

      {/* 
        LAYER 10: STITCH SIDENAVBAR (Upload action)
      */}
      <Sidebar onOpenUpload={() => setIsSARModalOpen(true)} />

      {/* 
        LAYER 10: STITCH DESKTOP & MOBILE TELEMETRY BAR
      */}
      <TelemetryBar telemetry={telemetry} />

      {/* 
        LAYER 50: INTERACTIVE INCIDENT & SAR AI MODALS
      */}
      {isIncidentModalOpen && (
        <div className="relative z-50">
          <IncidentModal
            spill={selectedSpill}
            vessel={selectedVessel}
            onClose={() => setIsIncidentModalOpen(false)}
            onUpdateSpillStatus={handleUpdateSpillStatus}
          />
        </div>
      )}

      {isSARModalOpen && (
        <div className="relative z-50">
          <SARUploadModal
            isOpen={isSARModalOpen}
            onClose={() => setIsSARModalOpen(false)}
            onAddNewSpill={handleAddNewSpill}
          />
        </div>
      )}
    </div>
  );
}
