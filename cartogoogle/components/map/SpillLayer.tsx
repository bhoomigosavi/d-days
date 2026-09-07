'use client';

import React from 'react';
import { Marker, Polygon, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { OilSpill } from '@/types/maris';

interface SpillLayerProps {
  spills: OilSpill[];
  selectedSpill: OilSpill | null;
  onSelectSpill: (spill: OilSpill) => void;
  showSlickPolygons: boolean;
}

export const SpillLayer: React.FC<SpillLayerProps> = ({
  spills,
  selectedSpill,
  onSelectSpill,
  showSlickPolygons
}) => {
  const createSpillIcon = (spill: OilSpill) => {
    const isCritical = spill.severity === 'critical';
    const isWarning = spill.severity === 'warning';
    
    // Stitch exact class mappings
    const colorClass = isCritical
      ? 'text-error border-error'
      : isWarning
      ? 'text-secondary border-secondary'
      : 'text-tertiary border-tertiary';

    const bgClass = isCritical
      ? 'bg-error'
      : isWarning
      ? 'bg-secondary'
      : 'bg-tertiary';

    const isSelected = selectedSpill?.id === spill.id;

    const html = `
      <div class="relative flex items-center justify-center cursor-pointer indicator-pulse ${colorClass} ${isSelected ? 'scale-125' : ''}" data-testid="spill-marker-${spill.id}">
        <!-- Inner square core (Stitch exact) -->
        <div class="w-2 h-2 ${bgClass} rounded-none z-10 pointer-events-auto"></div>
        <!-- Middle tech marker square (Stitch exact) -->
        <div class="absolute w-8 h-8 border border-current opacity-60 rounded-sm tech-marker pointer-events-none"></div>
        <!-- Outer square boundary (Stitch exact) -->
        <div class="absolute w-12 h-12 border border-current opacity-25 rounded-sm pointer-events-none"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: `stitch-spill-marker marker-${spill.id}`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
  };

  return (
    <>
      {spills.map((spill) => (
        <React.Fragment key={spill.id}>
          {/* Slick Polygon Footprint */}
          {showSlickPolygons && spill.slickPolygon && spill.slickPolygon.length > 0 && (
            <Polygon
              positions={spill.slickPolygon}
              pathOptions={{
                color: spill.severity === 'critical' ? '#ffb4ab' : spill.severity === 'warning' ? '#b6c6ed' : '#bdc7d9',
                weight: 1.5,
                dashArray: '4, 4',
                fillColor: spill.severity === 'critical' ? '#93000a' : spill.severity === 'warning' ? '#374767' : '#1f2942',
                fillOpacity: 0.35,
              }}
              eventHandlers={{
                click: () => onSelectSpill(spill),
              }}
            >
              <Tooltip sticky>
                <div className="text-xs p-1 font-mono">
                  <div className="font-bold text-primary">{spill.name}</div>
                  <div className="text-on-surface-variant">Slick Area: {spill.slickAreaSqKm} km²</div>
                </div>
              </Tooltip>
            </Polygon>
          )}

          {/* Central Pulsing Marker matching Stitch (Higher zIndexOffset so it is directly clickable) */}
          <Marker
            position={[spill.lat, spill.lng]}
            icon={createSpillIcon(spill)}
            zIndexOffset={1000}
            eventHandlers={{
              click: () => onSelectSpill(spill),
            }}
          >
            <Tooltip direction="top" offset={[0, -18]} opacity={0.95}>
              <div className="p-1 text-xs font-mono">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-primary">
                  <span className={`w-2 h-2 rounded-none ${spill.severity === 'critical' ? 'bg-error' : 'bg-secondary'}`} />
                  {spill.name}
                </div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">{spill.locationName}</div>
                <div className="grid grid-cols-2 gap-2 mt-1.5 pt-1.5 border-t border-outline-variant/30 text-[10px]">
                  <div>VOL: <span className="text-primary font-bold">{spill.estimatedVolumeBarrels.toLocaleString()} bbls</span></div>
                  <div>AREA: <span className="text-primary font-bold">{spill.slickAreaSqKm} km²</span></div>
                </div>
              </div>
            </Tooltip>
          </Marker>
        </React.Fragment>
      ))}
    </>
  );
};

export default SpillLayer;
