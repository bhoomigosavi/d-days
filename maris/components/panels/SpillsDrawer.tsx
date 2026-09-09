'use client';

import React, { useState } from 'react';
import { OilSpill, SpillSeverity } from '@/types/maris';
import { 
  ShieldAlert, 
  X, 
  Filter, 
  Compass, 
  Droplets, 
  ExternalLink,
  ChevronRight,
  Flame
} from 'lucide-react';

interface SpillsDrawerProps {
  spills: OilSpill[];
  selectedSpill: OilSpill | null;
  onSelectSpill: (spill: OilSpill) => void;
  onClose: () => void;
}

export const SpillsDrawer: React.FC<SpillsDrawerProps> = ({
  spills,
  selectedSpill,
  onSelectSpill,
  onClose,
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredSpills = spills.filter((s) => {
    const matchesSeverity = severityFilter === 'all' || s.severity === severityFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const totalSpillVolume = spills.reduce((acc, curr) => acc + curr.estimatedVolumeBarrels, 0);
  const totalSlickArea = spills.reduce((acc, curr) => acc + curr.slickAreaSqKm, 0);

  return (
    <div className="fixed left-4 md:left-[304px] top-20 bottom-14 w-84 md:w-96 glass-panel-heavy rounded-xl p-4 z-40 border border-outline-variant/30 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200" data-testid="spills-drawer">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-error-container/40 border border-error/30 text-error">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider text-on-surface uppercase">
              Oil Spill Incidents
            </h2>
            <p className="text-[11px] font-mono text-on-surface-variant">
              Indian Maritime Surveillance EEZ
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

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 gap-2 my-3">
        <div className="p-2.5 rounded-lg bg-surface-container-low/70 border border-outline-variant/20">
          <div className="text-[10px] uppercase font-mono text-on-surface-variant">Total Volume</div>
          <div className="text-sm font-bold font-mono text-error mt-0.5">
            {totalSpillVolume.toLocaleString()} <span className="text-[10px] text-on-surface-variant">bbls</span>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-surface-container-low/70 border border-outline-variant/20">
          <div className="text-[10px] uppercase font-mono text-on-surface-variant">Surface Slick Area</div>
          <div className="text-sm font-bold font-mono text-primary mt-0.5">
            {totalSlickArea.toFixed(1)} <span className="text-[10px] text-on-surface-variant">km²</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2 mb-3">
        <input
          type="text"
          placeholder="Search spill location, ID, vessel..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary"
        />

        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-on-surface-variant font-mono text-[10px] uppercase mr-1">Filter:</span>
          {['all', 'critical', 'warning', 'monitored'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2 py-1 rounded capitalize font-medium transition-all ${
                severityFilter === sev
                  ? 'bg-primary-container text-primary border border-primary/40'
                  : 'text-on-surface-variant hover:bg-surface-variant/30'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Spills List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {filteredSpills.length === 0 ? (
          <div className="text-center py-8 text-xs text-on-surface-variant font-mono">
            No spill records match the filter criteria.
          </div>
        ) : (
          filteredSpills.map((spill) => {
            const isSelected = selectedSpill?.id === spill.id;
            const isCritical = spill.severity === 'critical';
            const isWarning = spill.severity === 'warning';

            return (
              <div
                key={spill.id}
                onClick={() => onSelectSpill(spill)}
                className={`p-3 rounded-lg cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-primary-container/80 border-primary shadow-lg ring-1 ring-primary/50'
                    : 'bg-surface-container/60 hover:bg-surface-container border-outline-variant/30 hover:border-primary/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCritical ? 'bg-error animate-ping' : isWarning ? 'bg-secondary' : 'bg-tertiary'
                        }`}
                      />
                      <span className="text-xs font-bold text-on-surface">{spill.name}</span>
                    </div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5 font-mono">
                      {spill.locationName}
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                    isCritical ? 'bg-error-container text-error' : isWarning ? 'bg-secondary-container text-secondary' : 'bg-tertiary-container text-tertiary'
                  }`}>
                    {spill.severity}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-outline-variant/20 text-[10px] font-mono">
                  <div>
                    <span className="text-on-surface-variant block">VOLUME</span>
                    <span className="text-primary font-bold">{spill.estimatedVolumeBarrels} bbl</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">SLICK AREA</span>
                    <span className="text-primary font-bold">{spill.slickAreaSqKm} km²</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">COAST DIST</span>
                    <span className="text-on-surface font-bold">{spill.distanceToCoastKm} km</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-on-surface-variant font-mono">
                  <span>Source: {spill.sensorSource}</span>
                  <span className="text-primary flex items-center gap-0.5 hover:underline">
                    Inspect <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

