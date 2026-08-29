"use client";

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Compass, 
  Navigation, 
  Anchor, 
  Wind, 
  Waves, 
  Thermometer, 
  Eye, 
  FileText, 
  Radio, 
  Crosshair, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X,
  Share2,
  Lock,
  BarChart3,
  Globe
} from 'lucide-react';
import { Vessel, WeatherMetrics } from '@/types/maritime';
import { formatCoordinates, getVesselColor } from '@/lib/utils';

interface RightPanelProps {
  selectedVessel: Vessel | null;
  onClose: () => void;
  onFocusVessel: (vessel: Vessel) => void;
  weather: WeatherMetrics;
  allVesselsCount: number;
}

export const RightDetailsPanel: React.FC<RightPanelProps> = ({
  selectedVessel,
  onClose,
  onFocusVessel,
  weather,
  allVesselsCount
}) => {
  const [sitrepGenerated, setSitrepGenerated] = useState(false);

  const handleGenerateSitrep = () => {
    setSitrepGenerated(true);
    setTimeout(() => setSitrepGenerated(false), 4000);
  };

  return (
    <aside className="w-[350px] min-w-[350px] max-w-[350px] h-[calc(100vh-3.5rem)] bg-slate-950/95 border-l border-slate-800/80 flex flex-col z-20 select-none overflow-hidden backdrop-blur-md">
      
      {/* Panel Top Header */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
            {selectedVessel ? 'TARGET INTELLIGENCE DOSSIER' : 'SECTOR SITUATIONAL AWARENESS'}
          </span>
        </div>

        {selectedVessel && (
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
            title="Close target dossier"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        
        {selectedVessel ? (
          /* TARGET SELECTED VIEW */
          <div className="space-y-4">
            
            {/* Target Identity Banner */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-700/80 shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getVesselColor(selectedVessel.type) }}
                    />
                    <h2 className="font-bold text-sm text-slate-100 font-mono tracking-tight">
                      {selectedVessel.name}
                    </h2>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    TYPE: <span className="text-slate-200">{selectedVessel.type.toUpperCase()}</span> • FLAG: <span className="text-sky-300 font-semibold">{selectedVessel.flag}</span>
                  </p>
                </div>

                <button
                  onClick={() => onFocusVessel(selectedVessel)}
                  className="p-1.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 transition-all"
                  title="Center map on vessel"
                >
                  <Crosshair className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-800 font-mono text-[10px]">
                <div>
                  <span className="text-slate-500 block">MMSI</span>
                  <span className="text-slate-200 font-bold">{selectedVessel.mmsi}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">IMO</span>
                  <span className="text-slate-200 font-bold">{selectedVessel.imo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">CALLSIGN</span>
                  <span className="text-slate-200 font-bold">{selectedVessel.callSign}</span>
                </div>
              </div>
            </div>

            {/* Risk & Anomaly Assessment */}
            <div className={`p-3 rounded-lg border ${
              selectedVessel.riskScore > 50 
                ? 'bg-rose-950/30 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                : selectedVessel.riskScore > 20
                ? 'bg-amber-950/30 border-amber-500/50'
                : 'bg-emerald-950/20 border-emerald-500/40'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className={`w-3.5 h-3.5 ${
                    selectedVessel.riskScore > 50 ? 'text-rose-400' : selectedVessel.riskScore > 20 ? 'text-amber-400' : 'text-emerald-400'
                  }`} />
                  Threat & Compliance Score
                </span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                  selectedVessel.riskScore > 50 
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                    : selectedVessel.riskScore > 20
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                }`}>
                  {selectedVessel.riskScore} / 100
                </span>
              </div>

              <div className="w-full bg-slate-900 rounded-full h-1.5 mb-2.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    selectedVessel.riskScore > 50 ? 'bg-rose-500' : selectedVessel.riskScore > 20 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${selectedVessel.riskScore}%` }}
                />
              </div>

              <ul className="space-y-1 text-[10px] text-slate-300">
                {selectedVessel.riskFactors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-slate-500 mt-0.5">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Navigation & Telemetry Grid */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Navigation className="w-3 h-3 text-sky-400" />
                Live AIS Telemetry
              </span>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">SPEED (SOG)</span>
                  <span className="text-sm font-bold text-sky-300">{selectedVessel.sog} kts</span>
                </div>

                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">COURSE (COG)</span>
                  <span className="text-sm font-bold text-sky-300">{selectedVessel.cog}°</span>
                </div>

                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">HEADING</span>
                  <span className="text-sm font-bold text-slate-200">{selectedVessel.heading}° True</span>
                </div>

                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">CURRENT DRAUGHT</span>
                  <span className="text-sm font-bold text-slate-200">{selectedVessel.draught} m</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">POSITION:</span>
                  <span className="text-slate-200 font-bold">
                    {formatCoordinates(selectedVessel.coordinates[0], selectedVessel.coordinates[1])}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">STATUS:</span>
                  <span className="text-amber-300 font-bold">{selectedVessel.status}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">DESTINATION:</span>
                  <span className="text-sky-300 font-bold">{selectedVessel.destination}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">ESTIMATED ETA:</span>
                  <span className="text-slate-200">{selectedVessel.eta}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">DIMENSIONS:</span>
                  <span className="text-slate-200">{selectedVessel.length}m (L) x {selectedVessel.beam}m (B)</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">LAST TELEMETRY:</span>
                  <span className="text-emerald-400">{selectedVessel.lastReported}</span>
                </div>
              </div>
            </div>

            {/* Tactical Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleGenerateSitrep}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-sky-950/70 hover:bg-sky-900 border border-sky-500/50 rounded text-sky-200 text-xs font-mono transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>{sitrepGenerated ? '✓ SITREP DISPATCHED TO COMMAND' : 'GENERATE MARITIME SITREP'}</span>
              </button>

              <button
                onClick={() => onFocusVessel(selectedVessel)}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-300 text-xs font-mono transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>LOCK RADAR CAMERA TRACK</span>
              </button>
            </div>

          </div>
        ) : (
          /* NO TARGET SELECTED - SECTOR METRICS */
          <div className="space-y-4">
            
            {/* Sector Overview Card */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  Arabian Sea Maritime Domain
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Centralized sensor fusion for Maharashtra coastal corridors, Mumbai High Offshore Petroleum Basin, and JNPT port approach channels.
              </p>
            </div>

            {/* Oceanographic & Atmospheric Conditions */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
                <Waves className="w-3 h-3 text-sky-400" />
                Live Meteorological Telemetry
              </span>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[10px]">WIND VECTOR</span>
                    <Wind className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <div className="font-bold text-slate-100">{weather.windSpeed} kts</div>
                  <div className="text-[9px] text-slate-400">{weather.windDirection}° WSW Breeze</div>
                </div>

                <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[10px]">SEA SWELL</span>
                    <Waves className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <div className="font-bold text-slate-100">{weather.waveHeight} m</div>
                  <div className="text-[9px] text-emerald-400">Moderate Sea State 4</div>
                </div>

                <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[10px]">SEA SURFACE TEMP</span>
                    <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="font-bold text-slate-100">{weather.seaTemp} °C</div>
                  <div className="text-[9px] text-slate-400">Normal thermal shelf</div>
                </div>

                <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[10px]">VISIBILITY</span>
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <div className="font-bold text-slate-100">{weather.visibility} NM</div>
                  <div className="text-[9px] text-slate-400">Baro: {weather.barometer} hPa</div>
                </div>
              </div>
            </div>

            {/* Domain Asset Breakdown */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
                <BarChart3 className="w-3 h-3 text-sky-400" />
                Sector Density Distribution
              </span>

              <div className="p-3 rounded bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Commercial Shipping</span>
                  <span className="font-mono font-bold text-emerald-400">58%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[58%]" />
                </div>

                <div className="flex justify-between text-[11px] pt-1">
                  <span className="text-slate-400">Hydrocarbon / Tankers</span>
                  <span className="font-mono font-bold text-orange-400">25%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-orange-500 h-full w-[25%]" />
                </div>

                <div className="flex justify-between text-[11px] pt-1">
                  <span className="text-slate-400">Naval & Coastal Patrols</span>
                  <span className="font-mono font-bold text-sky-400">17%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-sky-500 h-full w-[17%]" />
                </div>
              </div>
            </div>

            {/* Instruction Card */}
            <div className="p-3 rounded-lg border border-dashed border-slate-700/80 bg-slate-900/30 text-center">
              <Crosshair className="w-5 h-5 text-sky-400 mx-auto mb-1.5 opacity-80" />
              <div className="font-semibold text-xs text-slate-300">Select Any Vessel on Map</div>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Click any vessel marker or select from the left sidebar to isolate its telemetry track, AIS transponder history, and security profile.
              </p>
            </div>

          </div>
        )}

      </div>

      {/* Panel Bottom Footer */}
      <div className="p-2.5 border-t border-slate-800/80 bg-slate-950 text-[10px] font-mono text-slate-400 flex items-center justify-between">
        <span className="text-slate-500">AREA: ARABIAN SEA / IN-W</span>
        <span className="text-sky-400">LAT 18.50° LON 72.50°</span>
      </div>

    </aside>
  );
};
