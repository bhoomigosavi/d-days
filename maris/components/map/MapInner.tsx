'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import { OilSpill, Vessel, CoastalZone } from '@/types/maris';
import { SpillLayer } from './SpillLayer';
import { VesselLayer } from './VesselLayer';
import { TrajectoryLayer } from './TrajectoryLayer';
import { SAROverlayLayer } from './SAROverlayLayer';
import { CoastalZoneLayer } from './CoastalZoneLayer';

interface MapInnerProps {
  spills: OilSpill[];
  vessels: Vessel[];
  selectedSpill: OilSpill | null;
  selectedVessel: Vessel | null;
  onSelectSpill: (spill: OilSpill) => void;
  onSelectVessel: (vessel: Vessel) => void;
  onSelectZone?: (zone: CoastalZone) => void;
  onCursorMove: (lat: number, lng: number) => void;
  showSlickPolygons: boolean;
  showVessels: boolean;
  showSARSwaths: boolean;
  showCoastalZones: boolean;
  simulationHour: number;
  focusedCoordinates?: [number, number] | null;
}

// Controller for programmatic panning/zooming & cursor telemetry
const MapController: React.FC<{
  onCursorMove: (lat: number, lng: number) => void;
  focusedCoordinates?: [number, number] | null;
}> = ({ onCursorMove, focusedCoordinates }) => {
  const map = useMap();

  useMapEvents({
    mousemove(e) {
      onCursorMove(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (focusedCoordinates) {
      map.flyTo(focusedCoordinates, Math.max(map.getZoom(), 8), {
        duration: 1.2,
      });
    }
  }, [focusedCoordinates, map]);

  return null;
};

export const MapInner: React.FC<MapInnerProps> = ({
  spills,
  vessels,
  selectedSpill,
  selectedVessel,
  onSelectSpill,
  onSelectVessel,
  onSelectZone,
  onCursorMove,
  showSlickPolygons,
  showVessels,
  showSARSwaths,
  showCoastalZones,
  simulationHour,
  focusedCoordinates,
}) => {
  // Center of Indian maritime territory (Arabian Sea, Bay of Bengal, Indian Ocean)
  const defaultCenter: [number, number] = [17.5, 78.0];
  const defaultZoom = 5;

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        minZoom={4}
        maxZoom={20}
        zoomControl={false}
        attributionControl={true}
        className="w-full h-full z-0"
      >
        {/* 
          CARTO Dark Matter Free Raster XYZ Basemap (No API key required)
          Documentation: https://carto.com/help/building-maps/basemaps/
        */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />

        <MapController
          onCursorMove={onCursorMove}
          focusedCoordinates={focusedCoordinates}
        />

        {/* SAR Satellite Footprint Overlays */}
        <SAROverlayLayer visible={showSARSwaths} />

        {/* Coastal Sensitive & Terminal Zones */}
        <CoastalZoneLayer visible={showCoastalZones} onSelectZone={onSelectZone} />

        {/* 48h Drift Trajectory Vectors */}
        <TrajectoryLayer spills={spills} simulationHour={simulationHour} />

        {/* Oil Spill Slicks & Pulse Markers */}
        <SpillLayer
          spills={spills}
          selectedSpill={selectedSpill}
          onSelectSpill={onSelectSpill}
          showSlickPolygons={showSlickPolygons}
        />

        {/* AIS Vessels & Coast Guard Ships */}
        {showVessels && (
          <VesselLayer
            vessels={vessels}
            selectedVessel={selectedVessel}
            onSelectVessel={onSelectVessel}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapInner;
