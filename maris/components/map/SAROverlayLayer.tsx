'use client';

import React from 'react';
import { Polygon, Tooltip } from 'react-leaflet';

interface SAROverlayLayerProps {
  visible: boolean;
}

export const SAROverlayLayer: React.FC<SAROverlayLayerProps> = ({ visible }) => {
  if (!visible) return null;

  // Swaths representing Sentinel-1 SAR acquisition passes across Indian maritime EEZ
  const sarSwaths: { id: string; name: string; pass: string; bounds: [number, number][] }[] = [
    {
      id: 'SAR-S1A-PASS-102',
      name: 'Sentinel-1A SAR Swath: Western Offshore (Mumbai High / Gujarat)',
      pass: 'Ascending Pass #102 | C-Band VV/VH',
      bounds: [
        [22.8, 68.2],
        [22.4, 73.5],
        [17.5, 74.0],
        [18.0, 68.8],
      ]
    },
    {
      id: 'SAR-S1B-PASS-044',
      name: 'Sentinel-1B SAR Swath: Eastern Seaboard (Bay of Bengal / Odisha)',
      pass: 'Descending Pass #044 | C-Band Polarimetric',
      bounds: [
        [21.8, 85.5],
        [21.2, 90.0],
        [15.5, 87.5],
        [16.2, 82.8],
      ]
    },
    {
      id: 'SAR-S1A-PASS-078',
      name: 'Sentinel-1A SAR Swath: South Indian Shipping Corridor & Sri Lanka',
      pass: 'Ascending Pass #078 | C-Band High Res',
      bounds: [
        [11.5, 74.5],
        [10.8, 81.0],
        [5.5, 81.5],
        [6.2, 75.0],
      ]
    }
  ];

  return (
    <>
      {sarSwaths.map((swath) => (
        <Polygon
          key={swath.id}
          positions={swath.bounds}
          pathOptions={{
            color: '#64ffda',
            weight: 1.5,
            dashArray: '5, 5',
            fillColor: '#0a2e38',
            fillOpacity: 0.18,
          }}
        >
          <Tooltip sticky>
            <div className="text-xs p-1">
              <div className="font-bold text-cyan-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                {swath.name}
              </div>
              <div className="text-on-surface-variant font-mono text-[11px] mt-0.5">{swath.pass}</div>
              <div className="text-[10px] text-primary/80 mt-1">Radar Backscatter Calibration: Nominal</div>
            </div>
          </Tooltip>
        </Polygon>
      ))}
    </>
  );
};

