'use client';

import React from 'react';
import { TelemetryState } from '@/types/maris';

interface TelemetryBarProps {
  telemetry: TelemetryState;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({ telemetry }) => {
  const coordString = telemetry.cursorLat
    ? `${Math.abs(telemetry.cursorLat).toFixed(4)}° ${telemetry.cursorLat >= 0 ? 'N' : 'S'}, ${Math.abs(telemetry.cursorLng).toFixed(4)}° ${telemetry.cursorLng >= 0 ? 'E' : 'W'}`
    : '19.4205° N, 71.3421° E';

  return (
    <>
      {/* Mobile BottomNavBar matching Stitch */}
      <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-6 py-2 h-16 glass-panel md:hidden border-t-0 shadow-[0_-4px_30px_rgba(0,0,0,0.1)] select-none">
        <div className="flex flex-col items-center justify-center text-primary w-1/4 cursor-pointer">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: '"FILL" 0' }}>
            location_on
          </span>
          <span className="text-[10px] mt-1 leading-none uppercase font-mono">Coords</span>
        </div>
        <div className="flex flex-col items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors w-1/4 cursor-pointer">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: '"FILL" 0' }}>
            straighten
          </span>
          <span className="text-[10px] mt-1 leading-none uppercase font-mono">Scale</span>
        </div>
        <div className="flex flex-col items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors w-1/4 cursor-pointer">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: '"FILL" 0' }}>
            explore
          </span>
          <span className="text-[10px] mt-1 leading-none uppercase font-mono">Compass</span>
        </div>
        <div className="flex flex-col items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors w-1/4 cursor-pointer">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: '"FILL" 0' }}>
            sensors
          </span>
          <span className="text-[10px] mt-1 leading-none uppercase font-mono">Status</span>
        </div>
      </footer>

      {/* Desktop Telemetry Bar matching Stitch */}
      <div className="fixed bottom-6 right-6 z-50 glass-panel border border-outline-variant/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-lg px-4 py-2 hidden md:flex items-center gap-6 select-none font-mono">
        <div className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors cursor-default">
          <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
          <span className="text-xs tracking-wider text-on-surface font-medium">{coordString}</span>
        </div>
        <div className="w-px h-4 bg-outline-variant/30"></div>
        <div className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors cursor-default">
          <span className="material-symbols-outlined text-[16px]">straighten</span>
          <span className="text-xs tracking-wider">Scale: {telemetry.scaleKm}km</span>
        </div>
        <div className="w-px h-4 bg-outline-variant/30"></div>
        <div className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors cursor-default">
          <span className="material-symbols-outlined text-[16px]">explore</span>
          <span className="text-xs tracking-wider">N {telemetry.bearingDeg}° E</span>
        </div>
      </div>
    </>
  );
};

export default TelemetryBar;
