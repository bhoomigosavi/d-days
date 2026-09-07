'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { OilSpill, Vessel, CoastalZone } from '@/types/maris';
import { Loader2 } from 'lucide-react';

const DynamicMap = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#050f1e] text-primary gap-4">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-primary/20 animate-ping absolute" />
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
      <div className="text-xs font-mono tracking-widest uppercase text-on-surface-variant">
        Initializing MARIS Ocean Cartography...
      </div>
    </div>
  ),
});

interface InteractiveMapProps {
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

export const InteractiveMap: React.FC<InteractiveMapProps> = (props) => {
  return (
    <div className="fixed inset-0 w-screen h-screen z-0 overflow-hidden bg-[#050f1e]">
      {/* Dynamic Leaflet Map Component (Full Viewport 100vw x 100vh) */}
      <DynamicMap {...props} />

      {/* Layer 1: Dark Transparent Vignette Overlay for Tactical Command Center Contrast */}
      <div className="fixed inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,15,30,0.35)_60%,rgba(2,8,18,0.8)_100%)]" />

      {/* Layer 1: Subtle Tactical Radar Grid Pattern */}
      <div className="fixed inset-0 z-[1] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDMsIDE0NCwgMTUxLCAwLjA0KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60" />
    </div>
  );
};

export default InteractiveMap;
