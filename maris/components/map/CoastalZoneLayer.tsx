'use client';

import React from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import { COASTAL_ZONES } from '@/data/coastalZones';
import { CoastalZone } from '@/types/maris';

interface CoastalZoneLayerProps {
  visible: boolean;
  onSelectZone?: (zone: CoastalZone) => void;
}

export const CoastalZoneLayer: React.FC<CoastalZoneLayerProps> = ({ visible, onSelectZone }) => {
  if (!visible) return null;

  return (
    <>
      {COASTAL_ZONES.map((zone) => {
        const isNationalPark = zone.type === 'Marine National Park' || zone.type === 'Coral Sanctuary' || zone.type === 'Mangrove Reserve';
        const color = isNationalPark ? '#81c784' : '#ffd54f';
        const fillColor = isNationalPark ? '#2e7d32' : '#f57f17';

        return (
          <CircleMarker
            key={zone.id}
            center={[zone.lat, zone.lng]}
            radius={7}
            pathOptions={{
              color,
              fillColor,
              fillOpacity: 0.6,
              weight: 1.5,
            }}
            eventHandlers={{
              click: () => onSelectZone && onSelectZone(zone),
            }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <div className="p-1 text-xs">
                <div className="font-bold text-on-surface flex items-center gap-1">
                  <span>{isNationalPark ? '🌿' : '⚓'}</span>
                  {zone.name}
                </div>
                <div className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                  Type: {zone.type} | Sensitivity: <span className="font-semibold text-primary">{zone.sensitivityIndex}</span>
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
};

