import { OilSpill } from '@/types/maris';

export const INITIAL_SPILLS: OilSpill[] = [
  {
    id: 'SPILL-IND-01',
    name: 'Mumbai High Sector 4 Offshore Leak',
    locationName: 'Mumbai High Basin (160km West of Mumbai)',
    lat: 19.4205,
    lng: 71.3421,
    severity: 'critical',
    estimatedVolumeBarrels: 4250,
    slickAreaSqKm: 18.6,
    detectedAt: '2026-09-01T08:15:00Z',
    sensorSource: 'Sentinel-1 SAR',
    containmentStatus: 'Active Leaking',
    windSpeedKnots: 16.4,
    windDirectionDeg: 230,
    currentDriftKnots: 1.8,
    nearestPort: 'Jawaharlal Nehru Port Trust (JNPT)',
    distanceToCoastKm: 154,
    suspectedSource: 'Platform Wellhead Flange Subsea B-3',
    driftTrajectory: [
      [19.4205, 71.3421],
      [19.4580, 71.4120],
      [19.5120, 71.5030],
      [19.5890, 71.6150],
      [19.6640, 71.7420]
    ],
    slickPolygon: [
      [19.4420, 71.3150],
      [19.4680, 71.3650],
      [19.4350, 71.3980],
      [19.3980, 71.3600],
      [19.4050, 71.3100]
    ]
  },
  {
    id: 'SPILL-IND-02',
    name: 'Gulf of Khambhat Tanker Bilge Discharge',
    locationName: 'Gulf of Khambhat (Approach to Dahej / Hazira)',
    lat: 21.2850,
    lng: 72.3120,
    severity: 'warning',
    estimatedVolumeBarrels: 820,
    slickAreaSqKm: 5.2,
    detectedAt: '2026-09-01T11:40:00Z',
    sensorSource: 'RADARSAT-2',
    containmentStatus: 'Under Surveillance',
    windSpeedKnots: 12.0,
    windDirectionDeg: 210,
    currentDriftKnots: 2.4,
    nearestPort: 'Dahej Chemical Terminal',
    distanceToCoastKm: 28,
    suspectedSource: 'M/T Ocean Mariner (MMSI 636019442)',
    driftTrajectory: [
      [21.2850, 72.3120],
      [21.3320, 72.3580],
      [21.3910, 72.4150],
      [21.4650, 72.4820]
    ],
    slickPolygon: [
      [21.2990, 72.2980],
      [21.3120, 72.3350],
      [21.2720, 72.3410],
      [21.2610, 72.3020]
    ]
  },
  {
    id: 'SPILL-IND-03',
    name: 'Cochin Fairway Hydrocarbon Slick',
    locationName: 'Arabian Sea (18nm off Cochin Port entrance)',
    lat: 9.9820,
    lng: 75.9250,
    severity: 'warning',
    estimatedVolumeBarrels: 1100,
    slickAreaSqKm: 7.8,
    detectedAt: '2026-09-01T04:22:00Z',
    sensorSource: 'Coast Guard Aerial',
    containmentStatus: 'Containment Deployed',
    windSpeedKnots: 9.8,
    windDirectionDeg: 290,
    currentDriftKnots: 1.1,
    nearestPort: 'Cochin Port Trust',
    distanceToCoastKm: 33,
    suspectedSource: 'Bulk Cargo De-ballasting Anomaly',
    driftTrajectory: [
      [9.9820, 75.9250],
      [9.9510, 76.0120],
      [9.9140, 76.1050],
      [9.8720, 76.1980]
    ],
    slickPolygon: [
      [10.0050, 75.9010],
      [10.0120, 75.9620],
      [9.9650, 75.9750],
      [9.9480, 75.9180]
    ]
  },
  {
    id: 'SPILL-IND-04',
    name: 'Chennai Ennore Channel Sheen',
    locationName: 'Bay of Bengal (Off Kamarajar Port Ennore)',
    lat: 13.2450,
    lng: 80.4120,
    severity: 'monitored',
    estimatedVolumeBarrels: 340,
    slickAreaSqKm: 2.1,
    detectedAt: '2026-09-01T14:05:00Z',
    sensorSource: 'Sentinel-1 SAR',
    containmentStatus: 'Under Surveillance',
    windSpeedKnots: 7.5,
    windDirectionDeg: 140,
    currentDriftKnots: 0.9,
    nearestPort: 'Kamarajar Port (Ennore)',
    distanceToCoastKm: 14,
    suspectedSource: 'Bunker Transfer Residual',
    driftTrajectory: [
      [13.2450, 80.4120],
      [13.2980, 80.3850],
      [13.3610, 80.3540],
      [13.4300, 80.3200]
    ],
    slickPolygon: [
      [13.2610, 80.4010],
      [13.2580, 80.4320],
      [13.2290, 80.4280],
      [13.2320, 80.3950]
    ]
  },
  {
    id: 'SPILL-IND-05',
    name: 'Paradip Offshore Single Point Mooring Anomaly',
    locationName: 'Bay of Bengal (12nm off Paradip Port, Odisha)',
    lat: 20.1980,
    lng: 86.8210,
    severity: 'critical',
    estimatedVolumeBarrels: 3100,
    slickAreaSqKm: 14.2,
    detectedAt: '2026-09-01T12:50:00Z',
    sensorSource: 'Sentinel-1 SAR',
    containmentStatus: 'Containment Deployed',
    windSpeedKnots: 18.2,
    windDirectionDeg: 195,
    currentDriftKnots: 2.1,
    nearestPort: 'Paradip Port Trust',
    distanceToCoastKm: 22,
    suspectedSource: 'VLCC Discharge SPM Hose Coupling',
    driftTrajectory: [
      [20.1980, 86.8210],
      [20.2750, 86.8920],
      [20.3580, 86.9810],
      [20.4490, 87.0850]
    ],
    slickPolygon: [
      [20.2250, 86.7950],
      [20.2410, 86.8620],
      [20.1780, 86.8790],
      [20.1550, 86.8090]
    ]
  },
  {
    id: 'SPILL-IND-06',
    name: 'Great Nicobar International Shipping Lane Slick',
    locationName: 'Malacca Strait Approach (South of Indira Point)',
    lat: 6.6850,
    lng: 93.7210,
    severity: 'warning',
    estimatedVolumeBarrels: 1540,
    slickAreaSqKm: 9.4,
    detectedAt: '2026-09-01T06:30:00Z',
    sensorSource: 'Sentinel-1 SAR',
    containmentStatus: 'Under Surveillance',
    windSpeedKnots: 14.5,
    windDirectionDeg: 260,
    currentDriftKnots: 1.6,
    nearestPort: 'Port Blair',
    distanceToCoastKm: 42,
    suspectedSource: 'Transit Tanker Washwater',
    driftTrajectory: [
      [6.6850, 93.7210],
      [6.7150, 93.8150],
      [6.7580, 93.9240],
      [6.8120, 94.0450]
    ],
    slickPolygon: [
      [6.7090, 93.6890],
      [6.7180, 93.7650],
      [6.6580, 93.7720],
      [6.6420, 93.6980]
    ]
  }
];

