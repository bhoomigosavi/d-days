export type VesselType = 
  | 'Tanker' 
  | 'Cargo' 
  | 'Military' 
  | 'Fishing' 
  | 'Tug' 
  | 'Passenger' 
  | 'Special';

export type NavStatus = 
  | 'Underway Using Engine'
  | 'At Anchor'
  | 'Moored'
  | 'Restricted Manoeuvrability'
  | 'Engaged in Fishing'
  | 'Drifting';

export interface Vessel {
  id: string;
  name: string;
  mmsi: string;
  imo: string;
  callSign: string;
  flag: string;
  flagCode: string;
  type: VesselType;
  coordinates: [number, number]; // [lon, lat]
  heading: number; // 0 - 360 degrees
  sog: number; // Speed Over Ground in knots
  cog: number; // Course Over Ground
  draught: number; // in meters
  length: number; // in meters
  beam: number; // in meters
  destination: string;
  eta: string;
  status: NavStatus;
  riskScore: number; // 0 - 100
  riskFactors: string[];
  anomalyFlags: {
    darkActivity?: boolean;
    spoofingSuspected?: boolean;
    speedDeviation?: boolean;
    routeDeviation?: boolean;
  };
  history: [number, number][]; // past track [lon, lat]
  lastReported: string;
}

export type AlertLevel = 'critical' | 'warning' | 'info';

export interface MaritimeAlert {
  id: string;
  timestamp: string;
  level: AlertLevel;
  title: string;
  description: string;
  vesselId?: string;
  coordinates?: [number, number];
}

export interface MapLayerState {
  vessels: boolean;
  shippingLanes: boolean;
  eezBoundary: boolean;
  oilFields: boolean;
  weatherRadar: boolean;
  radarSweep: boolean;
  rangeRings: boolean;
  highRiskZones: boolean;
  tracks: boolean;
}

export type MapStyleId = 'dark-satellite' | 'satellite-streets' | 'tactical-dark' | 'bathymetry';

export interface WeatherMetrics {
  windSpeed: number; // knots
  windDirection: number; // degrees
  waveHeight: number; // meters
  seaTemp: number; // celsius
  visibility: number; // nautical miles
  barometer: number; // hPa
}
