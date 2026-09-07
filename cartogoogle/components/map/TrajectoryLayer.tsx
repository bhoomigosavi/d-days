'use client';

import React from 'react';
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import { OilSpill } from '@/types/maris';

interface TrajectoryLayerProps {
  spills: OilSpill[];
  simulationHour: number; // 0, 6, 12, 24, 48
}

export const TrajectoryLayer: React.FC<TrajectoryLayerProps> = ({
  spills,
  simulationHour,
}) => {
  if (simulationHour === 0) return null;

  return (
    <>
      {spills.map((spill) => {
        if (!spill.driftTrajectory || spill.driftTrajectory.length === 0) return null;

        // Calculate slice based on simulation hour
        const pointsCount = Math.min(
          spill.driftTrajectory.length,
          Math.max(1, Math.ceil((simulationHour / 48) * spill.driftTrajectory.length))
        );
        const currentPath = spill.driftTrajectory.slice(0, pointsCount);
        const lastPoint = currentPath[currentPath.length - 1];

        return (
          <React.Fragment key={`traj-${spill.id}`}>
            {/* Trajectory Polyline Vector */}
            <Polyline
              positions={currentPath}
              pathOptions={{
                color: spill.severity === 'critical' ? '#ffb4ab' : '#b6c6ed',
                weight: 2.5,
                dashArray: '6, 6',
                opacity: 0.85,
              }}
            />

            {/* Projected Future Slick Center */}
            {lastPoint && (
              <CircleMarker
                center={lastPoint}
                radius={8 + simulationHour / 4}
                pathOptions={{
                  color: '#ffb4ab',
                  fillColor: '#93000a',
                  fillOpacity: 0.5,
                  weight: 1.5,
                  dashArray: '2, 2',
                }}
              >
                <Tooltip direction="right">
                  <div className="text-xs font-mono p-1">
                    <div className="font-bold text-error">+{simulationHour}h Drift Projection</div>
                    <div className="text-[11px] text-on-surface-variant">
                      Speed: {spill.currentDriftKnots} kts @ {spill.windDirectionDeg}°
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

