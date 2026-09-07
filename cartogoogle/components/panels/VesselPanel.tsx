'use client';

import React, { useState } from 'react';
import { Vessel, VesselType } from '@/types/maris';
import { 
  Ship, 
  X, 
  AlertTriangle, 
  ShieldCheck, 
  Navigation, 
  Compass, 
  Anchor, 
  ChevronRight,
  Filter
} from 'lucide-react';

interface VesselPanelProps {
  vessels: Vessel[];
  selectedVessel: Vessel | null;
  onSelectVessel: (vessel: Vessel) => void;
  onClose: () => void;
}

export const VesselPanel: React.FC<VesselPanelProps> = ({
  vessels,
  selectedVessel,
  onSelectVessel,
  onClose,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [suspiciousOnly, setSuspiciousOnly] = useState<boolean>(false);

  const filteredVessels = vessels.filter((v) => {
    const matchesType = filterType === 'all' || v.type === filterType;
    const matchesSuspicious = !suspiciousOnly || v.isSuspicious;
    return matchesType && matchesSuspicious;
  });

  return (
    <div className="fixed left-4 md:left-[304px] top-20 bottom-14 w-84 md:w-96 glass-panel-heavy rounded-xl p-4 z-40 border border-outline-variant/30 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200" data-testid="vessel-panel">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-secondary-container/50 border border-secondary/30 text-secondary">
            <Ship className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider text-on-surface uppercase">
              AIS Vessel Traffic
            </h2>
            <p className="text-[11px] font-mono text-on-surface-variant">
              Indian Ocean & Coastal Shipping Routes
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="my-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-on-surface-variant font-bold">
            Vessel Categories
          </span>
          <label className="flex items-center gap-1.5 text-xs text-error font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={suspiciousOnly}
              onChange={(e) => setSuspiciousOnly(e.target.checked)}
              className="rounded border-error bg-surface-container text-error focus:ring-0"
            />
            <span>High Bilge Risk Only</span>
          </label>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          {['all', 'Crude Tanker', 'Coast Guard Patrol', 'Container Ship', 'Chemical Tanker'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded whitespace-nowrap font-medium transition-all ${
                filterType === type
                  ? 'bg-secondary-container text-secondary border border-secondary/40 font-bold'
                  : 'bg-surface-container/60 text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {type === 'all' ? 'All Types' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Vessels List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {filteredVessels.map((vessel) => {
          const isSelected = selectedVessel?.id === vessel.id;
          const isPatrol = vessel.type === 'Coast Guard Patrol';

          return (
            <div
              key={vessel.id}
              onClick={() => onSelectVessel(vessel)}
              className={`p-3 rounded-lg cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-secondary-container/80 border-secondary ring-1 ring-secondary/50 shadow-lg'
                  : 'bg-surface-container/60 hover:bg-surface-container border-outline-variant/30 hover:border-secondary/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-on-surface">{vessel.name}</span>
                    <span className="text-[11px]">{vessel.flag}</span>
                  </div>
                  <div className="text-[11px] font-mono text-on-surface-variant mt-0.5">
                    MMSI: {vessel.mmsi} | IMO: {vessel.imo}
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                  isPatrol
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-400/40'
                    : vessel.isSuspicious
                    ? 'bg-error-container text-error border border-error/40'
                    : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {vessel.type}
                </span>
              </div>

              {vessel.isSuspicious && (
                <div className="mt-2 p-1.5 rounded bg-error-container/40 border border-error/30 flex items-center gap-1.5 text-[11px] text-error font-mono">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Flagged: Route deviation near slick anomaly</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-outline-variant/20 text-[10px] font-mono">
                <div>
                  <span className="text-on-surface-variant block">SPEED</span>
                  <span className="text-primary font-bold">{vessel.speedKnots} kts</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">HEADING</span>
                  <span className="text-primary font-bold">{vessel.headingDeg}°</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">DRAFT</span>
                  <span className="text-on-surface font-bold">{vessel.draftMeters} m</span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-on-surface-variant font-mono">
                <span className="truncate">Dest: {vessel.destination}</span>
                <span className="text-secondary flex items-center gap-0.5 hover:underline shrink-0">
                  Track <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

