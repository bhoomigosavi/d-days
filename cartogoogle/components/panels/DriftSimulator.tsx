'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wind, 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Compass, 
  Waves, 
  ShieldAlert,
  Gauge
} from 'lucide-react';
import { OilSpill } from '@/types/maris';

interface DriftSimulatorProps {
  simulationHour: number;
  setSimulationHour: React.Dispatch<React.SetStateAction<number>>;
  spills: OilSpill[];
  onClose: () => void;
}

export const DriftSimulator: React.FC<DriftSimulatorProps> = ({
  simulationHour,
  setSimulationHour,
  spills,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [windSpeed, setWindSpeed] = useState<number>(15);
  const [currentSpeed, setCurrentSpeed] = useState<number>(1.8);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setSimulationHour((prev) => (prev >= 48 ? 0 : prev + 6));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, setSimulationHour]);

  const milestones = [0, 6, 12, 24, 36, 48];

  return (
    <div className="fixed left-4 md:left-[304px] top-20 bottom-14 w-84 md:w-96 glass-panel-heavy rounded-xl p-4 z-40 border border-outline-variant/30 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider text-on-surface uppercase">
              Drift & Hydrodynamics
            </h2>
            <p className="text-[11px] font-mono text-on-surface-variant">
              Indian Ocean Monsoon Trajectory Model
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

      {/* Main Simulation Scrubbing Bar */}
      <div className="my-4 p-3.5 rounded-xl bg-surface-container-low/80 border border-outline-variant/30">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="text-on-surface-variant uppercase">Forecast Horizon:</span>
          <span className="font-bold text-base text-cyan-300">
            +{simulationHour} HOURS {simulationHour === 0 && '(CURRENT DETECTION)'}
          </span>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="0"
          max="48"
          step="6"
          value={simulationHour}
          onChange={(e) => setSimulationHour(Number(e.target.value))}
          className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />

        {/* Milestone Steps */}
        <div className="flex justify-between text-[10px] font-mono text-on-surface-variant mt-1.5 px-1">
          {milestones.map((h) => (
            <button
              key={h}
              onClick={() => setSimulationHour(h)}
              className={`hover:text-cyan-300 transition-colors ${
                simulationHour === h ? 'text-cyan-300 font-bold underline' : ''
              }`}
            >
              +{h}h
            </button>
          ))}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-outline-variant/20">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-400 text-cyan-300 hover:bg-cyan-900/80 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all shadow"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Animate Drift
              </>
            )}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setSimulationHour(0);
            }}
            className="p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/30"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Environmental Oceanography Controls */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        <div className="text-xs font-mono uppercase text-primary font-bold">
          Meteorological Input Parameters
        </div>

        <div className="p-3 rounded-lg bg-surface-container/60 border border-outline-variant/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-on-surface-variant">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              Surface Wind Speed (Knots)
            </span>
            <span className="font-mono font-bold text-primary">{windSpeed} kts</span>
          </div>
          <input
            type="range"
            min="5"
            max="40"
            value={windSpeed}
            onChange={(e) => setWindSpeed(Number(e.target.value))}
            className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div className="p-3 rounded-lg bg-surface-container/60 border border-outline-variant/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-on-surface-variant">
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              Ocean Surface Current (Knots)
            </span>
            <span className="font-mono font-bold text-primary">{currentSpeed} kts</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={currentSpeed}
            onChange={(e) => setCurrentSpeed(Number(e.target.value))}
            className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Projected Impact Risk */}
        <div className="p-3 rounded-lg bg-error-container/30 border border-error/40 text-xs">
          <div className="font-bold text-error flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>Coastline Landfall Projection</span>
          </div>
          <div className="text-[11px] text-on-surface-variant mt-1.5 font-mono">
            {simulationHour >= 24
              ? '⚠️ High landfall probability near Gulf of Khambhat & Maharashtra coast within 36h if uncontained.'
              : '✅ Slick currently remaining in open offshore corridor.'}
          </div>
        </div>
      </div>
    </div>
  );
};
