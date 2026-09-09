export type SpillSeverity = 'critical' | 'warning' | 'monitored';

export interface OilSpill {
  id: string;
  name: string;
  locationName: string;
  lat: number;
  lng: number;
  severity: SpillSeverity;
  estimatedVolumeBarrels: number;
  slickAreaSqKm: number;
  detectedAt: string;
  sensorSource: 'Sentinel-1 SAR' | 'RADARSAT-2' | 'AIS Anomaly' | 'Coast Guard Aerial';
  containmentStatus: 'Active Leaking' | 'Containment Deployed' | 'Under Surveillance' | 'Dispersed';
  windSpeedKnots: number;
  windDirectionDeg: number;
  currentDriftKnots: number;
  driftTrajectory: [number, number][]; // lat, lng points over 48h
  slickPolygon: [number, number][]; // boundary polygon for leaflet
  suspectedSource?: string;
  nearestPort: string;
  distanceToCoastKm: number;
}

export type VesselType = 'Crude Tanker' | 'Chemical Tanker' | 'Container Ship' | 'Coast Guard Patrol' | 'Bulk Carrier' | 'Offshore Supply';

export interface Vessel {
  id: string;
  mmsi: string;
  imo: string;
  name: string;
  type: VesselType;
  flag: string;
  lat: number;
  lng: number;
  speedKnots: number;
  headingDeg: number;
  destination: string;
  eta: string;
  draftMeters: number;
  riskScore: number; // 0-100
  isSuspicious: boolean;
  status: 'Underway' | 'Moored' | 'Anchored' | 'Engaged in Spill Response';
}

export interface CoastalZone {
  id: string;
  name: string;
  type: 'Marine National Park' | 'Major Oil Terminal' | 'Coral Sanctuary' | 'Fishing Port' | 'Mangrove Reserve';
  lat: number;
  lng: number;
  region: 'Arabian Sea' | 'Bay of Bengal' | 'Gulf of Kutch' | 'Gulf of Mannar' | 'Andaman Sea';
  sensitivityIndex: 'Extreme' | 'High' | 'Moderate';
}

export interface TelemetryState {
  cursorLat: number;
  cursorLng: number;
  scaleKm: number;
  bearingDeg: number;
  activeSpillsCount: number;
  activeVesselsCount: number;
  containmentRatePercent: number;
  sarSatelliteOnline: boolean;
}

