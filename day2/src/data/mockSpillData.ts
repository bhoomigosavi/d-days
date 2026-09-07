import { SpillFeature, SpillFeatureCollection } from '../types/spill';

/**
 * Primary realistic oil spill polygon located in the Arabian Sea / Bombay High sector
 */
export const MOCK_PRIMARY_SPILL: SpillFeature = {
  type: 'Feature',
  id: 'spill-bh-001',
  properties: {
    id: 'OS-2026-0829-01',
    name: 'Crude Oil Slick (Sector 4-B)',
    area: 14.85, // km²
    confidence: 0.94, // 94%
    detectionTime: '2026-08-29T08:15:00Z',
    severity: 'critical',
    sourceVessel: 'MT SAGAR SAMRAT (Auxiliary Barge)',
    sourceVesselMmsi: '419002341',
    thicknessMm: 0.15,
    estimatedVolumeM3: 2200,
    sensorType: 'Sentinel-1 SAR / C-Band',
    description: 'High-density crude oil slick drifting southeast with 1.2 knot surface current.'
  },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [72.22, 18.68],
        [72.28, 18.74],
        [72.35, 18.71],
        [72.41, 18.66],
        [72.39, 18.57],
        [72.31, 18.55],
        [72.24, 18.60],
        [72.22, 18.68]
      ]
    ]
  }
};

/**
 * Secondary spill in shipping corridor near Mumbai Harbour approach
 */
export const MOCK_SECONDARY_SPILL: SpillFeature = {
  type: 'Feature',
  id: 'spill-mh-002',
  properties: {
    id: 'OS-2026-0829-02',
    name: 'Heavy Bunker Fuel Sheen',
    area: 6.42, // km²
    confidence: 0.88, // 88%
    detectionTime: '2026-08-29T09:40:00Z',
    severity: 'high',
    sourceVessel: 'Suspected Bilge Discharge (Track #4489)',
    sensorType: 'RADARSAT-2 / Quad-Pol',
    thicknessMm: 0.08,
    description: 'Linear fuel oil dispersion along the southbound commercial lane.'
  },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [72.48, 18.82],
        [72.56, 18.85],
        [72.63, 18.81],
        [72.59, 18.75],
        [72.51, 18.74],
        [72.48, 18.82]
      ]
    ]
  }
};

/**
 * MultiPolygon spill consisting of separated slicks
 */
export const MOCK_MULTIPOLYGON_SPILL: SpillFeature = {
  type: 'Feature',
  id: 'spill-multi-003',
  properties: {
    id: 'OS-2026-0829-03',
    name: 'Fragmented Emulsion Field',
    area: 22.10, // km²
    confidence: 0.91, // 91%
    detectionTime: '2026-08-29T06:30:00Z',
    severity: 'critical',
    sourceVessel: 'Unidentified Tanker Transit',
    sensorType: 'Landsat-9 OLI-2 (Thermal/SWIR)',
    description: 'Two large contiguous slicks with weathering and mousse formation.'
  },
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      // First Slick
      [
        [
          [72.05, 18.42],
          [72.12, 18.48],
          [72.18, 18.44],
          [72.15, 18.36],
          [72.07, 18.34],
          [72.05, 18.42]
        ]
      ],
      // Second Slick
      [
        [
          [72.22, 18.32],
          [72.29, 18.35],
          [72.32, 18.28],
          [72.25, 18.25],
          [72.22, 18.32]
        ]
      ]
    ]
  }
};

/**
 * Feature collection containing all mock spills
 */
export const MOCK_SPILL_COLLECTION: SpillFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    MOCK_PRIMARY_SPILL,
    MOCK_SECONDARY_SPILL,
    MOCK_MULTIPOLYGON_SPILL
  ]
};
