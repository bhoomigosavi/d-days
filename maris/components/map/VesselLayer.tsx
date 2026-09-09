'use client';

import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Vessel } from '@/types/maris';

interface VesselLayerProps {
  vessels: Vessel[];
  selectedVessel: Vessel | null;
  onSelectVessel: (vessel: Vessel) => void;
}

export const VesselLayer: React.FC<VesselLayerProps> = ({
  vessels,
  selectedVessel,
  onSelectVessel
}) => {
  const createVesselIcon = (vessel: Vessel) => {
    const isPatrol = vessel.type === 'Coast Guard Patrol';
    const isSuspicious = vessel.isSuspicious;
    const isSelected = selectedVessel?.id === vessel.id;

    const shipColor = isPatrol
      ? '#64ffda' // ICG Cyan/Aqua
      : isSuspicious
      ? '#ff7b72' // Warning Orange/Red
      : '#b9c7e4'; // Standard Navy Primary

    const html = `
      <div class="relative flex items-center justify-center cursor-pointer transition-transform ${isSelected ? 'scale-125' : ''}">
        <!-- Vessel Heading Pointer -->
        <div style="transform: rotate(${vessel.headingDeg}deg);" class="transition-transform duration-500">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L19 21L12 17L5 21L12 2Z" fill="${shipColor}" fill-opacity="0.85" stroke="#08132a" stroke-width="1.5"/>
          </svg>
        </div>
        ${
          isSuspicious
            ? `<div class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-error animate-ping"></div>`
            : ''
        }
      </div>
    `;

    return L.divIcon({
      html,
      className: 'vessel-custom-icon',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  return (
    <>
      {vessels.map((vessel) => (
        <Marker
          key={vessel.id}
          position={[vessel.lat, vessel.lng]}
          icon={createVesselIcon(vessel)}
          eventHandlers={{
            click: () => onSelectVessel(vessel),
          }}
        >
          <Tooltip direction="top" offset={[0, -14]} opacity={0.95}>
            <div className="p-1 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-primary">{vessel.name}</span>
                <span className="text-[10px]">{vessel.flag}</span>
              </div>
              <div className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                {vessel.type} • {vessel.speedKnots} kts
              </div>
              <div className="mt-1 pt-1 border-t border-outline-variant/30 text-[10px] text-on-surface-variant">
                Dest: <span className="text-on-surface font-semibold">{vessel.destination}</span>
              </div>
              {vessel.isSuspicious && (
                <div className="mt-1 text-[10px] text-error font-bold tracking-wider">
                  ⚠️ Bilge Discharge Risk Flagged
                </div>
              )}
            </div>
          </Tooltip>
        </Marker>
      ))}
    </>
  );
};

