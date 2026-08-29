"use client";

import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  ShieldAlert, 
  Compass, 
  Clock, 
  Key, 
  Crosshair, 
  Anchor, 
  Activity, 
  Layers
} from 'lucide-react';
import { formatCoordinates } from '@/lib/utils';

interface HeaderProps {
  cursorCoords: [number, number] | null;
  activeVesselsCount: number;
  anomaliesCount: number;
  onOpenTokenModal: () => void;
  hasCustomToken: boolean;
}

export const DashboardHeader: React.FC<HeaderProps> = ({
  cursorCoords,
  activeVesselsCount,
  anomaliesCount,
  onOpenTokenModal,
  hasCustomToken
}) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 bg-slate-950/90 border-b border-slate-800/80 px-4 flex items-center justify-between text-xs z-30 select-none backdrop-blur-md">
      {/* Brand & System Status */}
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-sky-950/80 border border-sky-500/40 text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.25)]">
          <Anchor className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-100 tracking-wider text-sm">POSEIDON // MDA-7</span>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
              Arabian Sea Sector
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            LIVE AIS FEED • 18.5°N 72.5°E REGION
          </p>
        </div>
      </div>

      {/* Center Tactical Telemetry */}
      <div className="hidden lg:flex items-center space-x-6 text-slate-300 font-mono">
        <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-slate-400">TRACKED TARGETS:</span>
          <span className="font-bold text-emerald-400">{activeVesselsCount}</span>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded border border-slate-800">
          <ShieldAlert className={`w-3.5 h-3.5 ${anomaliesCount > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
          <span className="text-slate-400">ANOMALIES:</span>
          <span className={`font-bold ${anomaliesCount > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
            {anomaliesCount} ACTIVE
          </span>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded border border-slate-800">
          <Crosshair className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400">RETICLE:</span>
          <span className="font-bold text-sky-300">
            {cursorCoords ? formatCoordinates(cursorCoords[0], cursorCoords[1]) : '18.5000° N, 72.5000° E'}
          </span>
        </div>
      </div>

      {/* Right Controls & UTC Clock */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 bg-slate-900/80 px-2.5 py-1.5 rounded border border-slate-800 text-slate-300 font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>{utcTime || 'SYNCING UTC...'}</span>
        </div>

        <button
          onClick={onOpenTokenModal}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded border transition-all text-xs ${
            hasCustomToken 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50' 
              : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-sky-500 hover:text-sky-300'
          }`}
          title="Configure Mapbox Access Token"
        >
          <Key className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{hasCustomToken ? 'Token Active' : 'Mapbox Key'}</span>
        </button>
      </div>
    </header>
  );
};
