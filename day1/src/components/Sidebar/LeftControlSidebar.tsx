"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Sliders, 
  Layers, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Compass, 
  Navigation, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Radar, 
  Map as MapIcon, 
  Anchor, 
  Crosshair, 
  Filter,
  X
} from 'lucide-react';
import { Vessel, VesselType, MapLayerState, MapStyleId, MaritimeAlert } from '@/types/maritime';
import { getVesselColor } from '@/lib/utils';

interface LeftSidebarProps {
  vessels: Vessel[];
  selectedVessel: Vessel | null;
  onSelectVessel: (vessel: Vessel | null) => void;
  selectedTypes: VesselType[];
  onToggleType: (type: VesselType) => void;
  onSelectAllTypes: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  layers: MapLayerState;
  onToggleLayer: (layerKey: keyof MapLayerState) => void;
  currentStyle: MapStyleId;
  onChangeStyle: (style: MapStyleId) => void;
  alerts: MaritimeAlert[];
  onFocusAlert: (alert: MaritimeAlert) => void;
  onCenterArabianSea: () => void;
}

export const LeftControlSidebar: React.FC<LeftSidebarProps> = ({
  vessels,
  selectedVessel,
  onSelectVessel,
  selectedTypes,
  onToggleType,
  onSelectAllTypes,
  searchQuery,
  onSearchChange,
  layers,
  onToggleLayer,
  currentStyle,
  onChangeStyle,
  alerts,
  onFocusAlert,
  onCenterArabianSea,
}) => {
  const [activeTab, setActiveTab] = useState<'filters' | 'layers' | 'alerts'>('filters');

  const vesselTypes: { type: VesselType; label: string; count: number }[] = [
    { type: 'Tanker', label: 'Tankers (Crude/LNG)', count: vessels.filter(v => v.type === 'Tanker').length },
    { type: 'Cargo', label: 'Cargo & Containers', count: vessels.filter(v => v.type === 'Cargo').length },
    { type: 'Military', label: 'Naval & Coast Guard', count: vessels.filter(v => v.type === 'Military').length },
    { type: 'Fishing', label: 'Fishing Vessels', count: vessels.filter(v => v.type === 'Fishing').length },
    { type: 'Tug', label: 'Tug & Offshore Supply', count: vessels.filter(v => v.type === 'Tug').length },
    { type: 'Special', label: 'Special / Unverified', count: vessels.filter(v => v.type === 'Special').length },
  ];

  const filteredVessels = vessels.filter(v => {
    const matchesType = selectedTypes.includes(v.type);
    const matchesSearch = 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.mmsi.includes(searchQuery) ||
      v.imo.includes(searchQuery) ||
      v.callSign.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <aside className="w-[300px] min-w-[300px] max-w-[300px] h-[calc(100vh-3.5rem)] bg-slate-950/95 border-r border-slate-800/80 flex flex-col z-20 select-none overflow-hidden backdrop-blur-md">
      
      {/* Top Search Bar */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/40">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Name, MMSI, IMO..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 bg-slate-900 border border-slate-700/80 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-mono"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="grid grid-cols-3 border-b border-slate-800/80 text-[11px] font-semibold tracking-wider uppercase text-slate-400 bg-slate-950">
        <button
          onClick={() => setActiveTab('filters')}
          className={`py-2 flex items-center justify-center space-x-1 border-b-2 transition-all ${
            activeTab === 'filters'
              ? 'border-sky-400 text-sky-400 bg-sky-950/20'
              : 'border-transparent hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>Vessels</span>
        </button>

        <button
          onClick={() => setActiveTab('layers')}
          className={`py-2 flex items-center justify-center space-x-1 border-b-2 transition-all ${
            activeTab === 'layers'
              ? 'border-sky-400 text-sky-400 bg-sky-950/20'
              : 'border-transparent hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>Layers</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`py-2 flex items-center justify-center space-x-1 border-b-2 transition-all relative ${
            activeTab === 'alerts'
              ? 'border-sky-400 text-sky-400 bg-sky-950/20'
              : 'border-transparent hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <ShieldAlert className="w-3 h-3 text-amber-400" />
          <span>Alerts</span>
          {alerts.length > 0 && (
            <span className="ml-1 px-1 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-mono border border-amber-500/40">
              {alerts.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs font-sans">
        
        {/* TAB 1: FILTERS & VESSEL LIST */}
        {activeTab === 'filters' && (
          <div className="space-y-4">
            
            {/* Quick Filter Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3 h-3 text-sky-400" />
                  Vessel Classification
                </span>
                <button
                  onClick={onSelectAllTypes}
                  className="text-[10px] text-sky-400 hover:text-sky-300 font-mono"
                >
                  {selectedTypes.length === vesselTypes.length ? 'DESELECT ALL' : 'SELECT ALL'}
                </button>
              </div>

              <div className="space-y-1.5">
                {vesselTypes.map(({ type, label, count }) => {
                  const isSelected = selectedTypes.includes(type);
                  const color = getVesselColor(type);
                  return (
                    <button
                      key={type}
                      onClick={() => onToggleType(type)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-all border ${
                        isSelected 
                          ? 'bg-slate-900/90 border-slate-700/80 text-slate-200' 
                          : 'bg-slate-950/40 border-slate-800/40 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: color, boxShadow: isSelected ? `0 0 8px ${color}80` : 'none' }}
                        />
                        <span className="text-xs">{label}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Sector Recenter */}
            <div className="pt-1">
              <button
                onClick={onCenterArabianSea}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-sky-950/50 hover:bg-sky-900/60 border border-sky-500/40 rounded text-sky-300 font-mono text-xs transition-all shadow-[0_0_10px_rgba(56,189,248,0.15)]"
              >
                <Crosshair className="w-3.5 h-3.5 text-sky-400" />
                <span>RECENTER ARABIAN SEA (18.5°N, 72.5°E)</span>
              </button>
            </div>

            {/* Targets in Current View */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Anchor className="w-3 h-3 text-sky-400" />
                  Active Targets ({filteredVessels.length})
                </span>
                <span className="text-[10px] text-slate-500 font-mono">LIVE AIS</span>
              </div>

              <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                {filteredVessels.map(v => {
                  const isSelected = selectedVessel?.id === v.id;
                  const color = getVesselColor(v.type);
                  return (
                    <div
                      key={v.id}
                      onClick={() => onSelectVessel(v)}
                      className={`p-2 rounded border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-sky-950/60 border-sky-400/80 text-white shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                          : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 truncate">
                          <span 
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-semibold text-xs truncate">{v.name}</span>
                        </div>
                        {v.riskScore > 50 && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                            RISK {v.riskScore}%
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-slate-400">
                        <span>{v.type} • {v.flagCode}</span>
                        <span>{v.sog} kts | {v.heading}°</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: TACTICAL LAYERS & MAP STYLES */}
        {activeTab === 'layers' && (
          <div className="space-y-5">
            
            {/* Map Style Selector */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
                <MapIcon className="w-3 h-3 text-sky-400" />
                Base Imagery Style
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onChangeStyle('dark-satellite')}
                  className={`p-2 rounded border text-left text-xs transition-all ${
                    currentStyle === 'dark-satellite'
                      ? 'bg-sky-950/60 border-sky-400 text-sky-200 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-[11px]">Dark Satellite</div>
                  <div className="text-[9px] text-slate-400">High-contrast night imagery</div>
                </button>

                <button
                  onClick={() => onChangeStyle('satellite-streets')}
                  className={`p-2 rounded border text-left text-xs transition-all ${
                    currentStyle === 'satellite-streets'
                      ? 'bg-sky-950/60 border-sky-400 text-sky-200 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-[11px]">Satellite Hybrid</div>
                  <div className="text-[9px] text-slate-400">Satellite + Labels & Ports</div>
                </button>

                <button
                  onClick={() => onChangeStyle('tactical-dark')}
                  className={`p-2 rounded border text-left text-xs transition-all ${
                    currentStyle === 'tactical-dark'
                      ? 'bg-sky-950/60 border-sky-400 text-sky-200 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-[11px]">Tactical Vector</div>
                  <div className="text-[9px] text-slate-400">Minimal dark navigation</div>
                </button>

                <button
                  onClick={() => onChangeStyle('bathymetry')}
                  className={`p-2 rounded border text-left text-xs transition-all ${
                    currentStyle === 'bathymetry'
                      ? 'bg-sky-950/60 border-sky-400 text-sky-200 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-[11px]">Bathymetry</div>
                  <div className="text-[9px] text-slate-400">Depth contours & shelves</div>
                </button>
              </div>
            </div>

            {/* Tactical Overlays */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
                <Layers className="w-3 h-3 text-sky-400" />
                Operational Overlays
              </span>

              <div className="space-y-1.5">
                {[
                  { key: 'vessels' as const, label: 'AIS Live Targets', desc: 'Real-time positioning & vectors' },
                  { key: 'tracks' as const, label: 'Historical Tracks', desc: 'Target breadcrumb history' },
                  { key: 'shippingLanes' as const, label: 'Shipping Corridors (TSS)', desc: 'Mumbai port transit channels' },
                  { key: 'oilFields' as const, label: 'Bombay High Oil Fields', desc: 'Restricted 500m platform zones' },
                  { key: 'eezBoundary' as const, label: 'India EEZ (200 NM)', desc: 'Exclusive economic zone boundary' },
                  { key: 'highRiskZones' as const, label: 'Surveillance Alert Sector', desc: 'High risk security perimeter' },
                  { key: 'weatherRadar' as const, label: 'Atmospheric Vectors', desc: 'Swell & wind stream overlay' },
                  { key: 'radarSweep' as const, label: 'Dynamic Radar Sweep', desc: 'Active sensor scanning simulation' },
                  { key: 'rangeRings' as const, label: 'Nautical Range Rings', desc: '50/100/150 NM Mumbai markers' },
                ].map(({ key, label, desc }) => {
                  const active = layers[key];
                  return (
                    <button
                      key={key}
                      onClick={() => onToggleLayer(key)}
                      className={`w-full flex items-center justify-between p-2 rounded text-left border transition-all ${
                        active 
                          ? 'bg-slate-900/90 border-slate-700 text-slate-200' 
                          : 'bg-slate-950/40 border-slate-800/40 text-slate-500'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs flex items-center gap-1.5">
                          {active ? (
                            <Eye className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                          )}
                          <span>{label}</span>
                        </div>
                        <div className="text-[9px] text-slate-500 ml-5">{desc}</div>
                      </div>
                      
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                        active ? 'bg-sky-500/20 border-sky-400 text-sky-400' : 'border-slate-700'
                      }`}>
                        {active && <span className="w-1.5 h-1.5 rounded bg-sky-400"></span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: MARITIME ALERTS & SITUATION LOG */}
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Radar className="w-3 h-3 text-amber-400" />
                Live Incident Monitor
              </span>
              <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ONLINE
              </span>
            </div>

            <div className="space-y-2">
              {alerts.map(alert => {
                const isCritical = alert.level === 'critical';
                const isWarning = alert.level === 'warning';
                
                return (
                  <div
                    key={alert.id}
                    onClick={() => onFocusAlert(alert)}
                    className={`p-2.5 rounded border text-left cursor-pointer transition-all ${
                      isCritical
                        ? 'bg-rose-950/30 border-rose-500/50 hover:bg-rose-950/50'
                        : isWarning
                        ? 'bg-amber-950/30 border-amber-500/50 hover:bg-amber-950/50'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                        isCritical
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                          : isWarning
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                      }`}>
                        {alert.level}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{alert.timestamp}</span>
                    </div>

                    <div className="font-semibold text-xs text-slate-200 mt-1">{alert.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{alert.description}</div>
                    
                    <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono text-sky-400">
                      <span>CLICK TO INSPECT GEO-LOC</span>
                      <Navigation className="w-2.5 h-2.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Bottom System Status Badge */}
      <div className="p-2.5 border-t border-slate-800/80 bg-slate-950 text-[10px] font-mono text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          ENCRYPTED LINK 22
        </span>
        <span className="text-slate-500">SYS VER 4.8.2</span>
      </div>

    </aside>
  );
};
