'use client';

import React from 'react';
import { OilSpill, Vessel } from '@/types/maris';
import { 
  BarChart3, 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Droplets, 
  TrendingDown, 
  TrendingUp, 
  Compass,
  Ship
} from 'lucide-react';

interface AnalyticsDrawerProps {
  spills: OilSpill[];
  vessels: Vessel[];
  onClose: () => void;
}

export const AnalyticsDrawer: React.FC<AnalyticsDrawerProps> = ({
  spills,
  vessels,
  onClose,
}) => {
  const totalVolume = spills.reduce((acc, curr) => acc + curr.estimatedVolumeBarrels, 0);
  const totalArea = spills.reduce((acc, curr) => acc + curr.slickAreaSqKm, 0);
  const criticalCount = spills.filter((s) => s.severity === 'critical').length;
  const containedCount = spills.filter((s) => s.containmentStatus === 'Containment Deployed').length;
  const containmentRate = Math.round((containedCount / spills.length) * 100);

  return (
    <div className="fixed left-4 md:left-[304px] top-20 bottom-14 w-84 md:w-96 glass-panel-heavy rounded-xl p-4 z-40 border border-outline-variant/30 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200" data-testid="analytics-drawer">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-tertiary-container/80 border border-tertiary/40 text-tertiary">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider text-on-surface uppercase">
              Maritime Environmental Audit
            </h2>
            <p className="text-[11px] font-mono text-on-surface-variant">
              Indian Coast Guard Pollution Intelligence
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

      {/* Analytics Content */}
      <div className="flex-1 overflow-y-auto space-y-3.5 my-3 pr-1">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-surface-container-low/80 border border-outline-variant/20">
            <span className="text-[10px] uppercase font-mono text-on-surface-variant block">Active Slicks</span>
            <span className="text-xl font-bold font-mono text-primary">{spills.length}</span>
            <span className="text-[10px] text-error font-mono flex items-center gap-0.5 mt-1">
              <AlertTriangle className="w-3 h-3" /> {criticalCount} Critical
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low/80 border border-outline-variant/20">
            <span className="text-[10px] uppercase font-mono text-on-surface-variant block">Containment Rate</span>
            <span className="text-xl font-bold font-mono text-cyan-300">{containmentRate}%</span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5 mt-1">
              <ShieldCheck className="w-3 h-3" /> {containedCount} Deployed
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low/80 border border-outline-variant/20">
            <span className="text-[10px] uppercase font-mono text-on-surface-variant block">Aggregate Volume</span>
            <span className="text-xl font-bold font-mono text-error">{totalVolume.toLocaleString()}</span>
            <span className="text-[10px] text-on-surface-variant font-mono">Barrels (Crude)</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low/80 border border-outline-variant/20">
            <span className="text-[10px] uppercase font-mono text-on-surface-variant block">Affected Area</span>
            <span className="text-xl font-bold font-mono text-primary">{totalArea.toFixed(1)}</span>
            <span className="text-[10px] text-on-surface-variant font-mono">Square Kilometers</span>
          </div>
        </div>

        {/* Regional Risk Breakdown */}
        <div className="p-3 rounded-xl bg-surface-container/60 border border-outline-variant/30 space-y-2 text-xs">
          <div className="text-[10px] uppercase font-mono font-bold text-primary flex items-center justify-between">
            <span>Regional Zone Threat Levels</span>
            <span>Risk Index</span>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div>
              <div className="flex justify-between text-on-surface mb-0.5">
                <span>Western Coast (Mumbai / Gujarat)</span>
                <span className="text-error font-bold">88 / 100</span>
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                <div className="bg-error h-full rounded-full w-[88%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-on-surface mb-0.5">
                <span>Eastern Coast (Odisha / Paradip)</span>
                <span className="text-secondary font-bold">64 / 100</span>
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full w-[64%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-on-surface mb-0.5">
                <span>Southern Corridors (Cochin / Palk)</span>
                <span className="text-tertiary font-bold">42 / 100</span>
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                <div className="bg-tertiary h-full rounded-full w-[42%]" />
              </div>
            </div>
          </div>
        </div>

        {/* AIS Vessel Surveillance Summary */}
        <div className="p-3 rounded-xl bg-surface-container/60 border border-outline-variant/30 text-xs font-mono space-y-2">
          <div className="text-[10px] uppercase font-bold text-primary flex items-center justify-between">
            <span>AIS Fleet Intercept Status</span>
            <Ship className="w-3.5 h-3.5" />
          </div>
          <div className="flex justify-between text-on-surface-variant text-[11px]">
            <span>Active ICG Patrol Cutters:</span>
            <span className="text-cyan-300 font-bold">3 Units</span>
          </div>
          <div className="flex justify-between text-on-surface-variant text-[11px]">
            <span>Flagged Bilge Anomalies:</span>
            <span className="text-error font-bold">2 Tankers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

