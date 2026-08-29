import { Vessel, MaritimeAlert, WeatherMetrics } from '@/types/maritime';

export const INITIAL_MAP_CENTER: [number, number] = [72.5, 18.5]; // [lon, lat]
export const INITIAL_MAP_ZOOM = 7;

export const MOCK_VESSELS: Vessel[] = [
  {
    id: 'v-001',
    name: 'DESH SHANTI',
    mmsi: '419000123',
    imo: '9283740',
    callSign: 'VTBF',
    flag: 'India',
    flagCode: 'IN',
    type: 'Tanker',
    coordinates: [72.35, 18.72],
    heading: 115,
    sog: 13.4,
    cog: 118,
    draught: 14.8,
    length: 274,
    beam: 48,
    destination: 'MUMBAI BPCL',
    eta: '2026-08-29 18:00 UTC',
    status: 'Underway Using Engine',
    riskScore: 8,
    riskFactors: ['Normal transit', 'Verified AIS beacon'],
    anomalyFlags: {},
    history: [
      [71.10, 19.30],
      [71.55, 19.10],
      [71.95, 18.90],
      [72.35, 18.72]
    ],
    lastReported: '12 sec ago'
  },
  {
    id: 'v-002',
    name: 'MSC RENEE',
    mmsi: '636018992',
    imo: '9708693',
    callSign: 'D5LU9',
    flag: 'Liberia',
    flagCode: 'LR',
    type: 'Cargo',
    coordinates: [72.62, 18.88],
    heading: 75,
    sog: 16.2,
    cog: 78,
    draught: 13.2,
    length: 366,
    beam: 51,
    destination: 'JNPT NAVI MUMBAI',
    eta: '2026-08-29 14:30 UTC',
    status: 'Underway Using Engine',
    riskScore: 12,
    riskFactors: ['Standard shipping lane compliance'],
    anomalyFlags: {},
    history: [
      [71.30, 18.40],
      [71.80, 18.58],
      [72.20, 18.75],
      [72.62, 18.88]
    ],
    lastReported: '5 sec ago'
  },
  {
    id: 'v-003',
    name: 'ICGS SAMARTH',
    mmsi: '419001999',
    imo: '9648934',
    callSign: 'VWYP',
    flag: 'India Coast Guard',
    flagCode: 'IN',
    type: 'Military',
    coordinates: [72.15, 18.35],
    heading: 320,
    sog: 21.5,
    cog: 322,
    draught: 4.5,
    length: 105,
    beam: 13,
    destination: 'EEZ PATROL SECTOR-B',
    eta: 'ROUTINE PATROL',
    status: 'Underway Using Engine',
    riskScore: 0,
    riskFactors: ['Law Enforcement / Maritime Security Authority'],
    anomalyFlags: {},
    history: [
      [72.40, 17.90],
      [72.30, 18.10],
      [72.15, 18.35]
    ],
    lastReported: '2 sec ago'
  },
  {
    id: 'v-004',
    name: 'INS KOLKATA (D63)',
    mmsi: '419999063',
    imo: '8876541',
    callSign: 'INDK',
    flag: 'Indian Navy',
    flagCode: 'IN',
    type: 'Military',
    coordinates: [71.75, 18.65],
    heading: 260,
    sog: 18.0,
    cog: 258,
    draught: 6.5,
    length: 163,
    beam: 17,
    destination: 'ARABIAN SEA WEST OP',
    eta: 'OPERATIONAL',
    status: 'Underway Using Engine',
    riskScore: 0,
    riskFactors: ['Naval Surface Combatant'],
    anomalyFlags: {},
    history: [
      [72.20, 18.60],
      [71.95, 18.63],
      [71.75, 18.65]
    ],
    lastReported: 'Just now'
  },
  {
    id: 'v-005',
    name: 'SHADOW TRADER (EX-ALTAIR)',
    mmsi: '620894101',
    imo: '9182390',
    callSign: 'D6A9',
    flag: 'Comoros',
    flagCode: 'KM',
    type: 'Special',
    coordinates: [71.42, 19.12],
    heading: 195,
    sog: 1.8,
    cog: 210,
    draught: 16.2,
    length: 240,
    beam: 42,
    destination: 'FOR ORDERS',
    eta: 'UNSPECIFIED',
    status: 'Drifting',
    riskScore: 88,
    riskFactors: [
      'AIS signal intermittent (Dark activity suspected)',
      'Drifting near Mumbai High restricted boundary',
      'Sudden draught change reported (+3.5m)',
      'Potential STS (Ship-to-Ship) transfer profile'
    ],
    anomalyFlags: {
      darkActivity: true,
      spoofingSuspected: true,
      speedDeviation: true,
      routeDeviation: true
    },
    history: [
      [71.35, 19.45],
      [71.38, 19.30],
      [71.42, 19.12]
    ],
    lastReported: '8 min ago (Intermittent)'
  },
  {
    id: 'v-006',
    name: 'AL JABRIYAH II',
    mmsi: '447021000',
    imo: '9315692',
    callSign: '9KJH',
    flag: 'Kuwait',
    flagCode: 'KW',
    type: 'Tanker',
    coordinates: [71.90, 19.65],
    heading: 140,
    sog: 14.8,
    cog: 142,
    draught: 11.5,
    length: 290,
    beam: 45,
    destination: 'DAHEJ LNG TERMINAL',
    eta: '2026-08-30 06:00 UTC',
    status: 'Underway Using Engine',
    riskScore: 15,
    riskFactors: ['High value hazardous cargo (LNG)'],
    anomalyFlags: {},
    history: [
      [71.10, 20.40],
      [71.50, 20.00],
      [71.90, 19.65]
    ],
    lastReported: '22 sec ago'
  },
  {
    id: 'v-007',
    name: 'MAERSK KINSHASA',
    mmsi: '219018000',
    imo: '9458030',
    callSign: 'OWEP2',
    flag: 'Denmark',
    flagCode: 'DK',
    type: 'Cargo',
    coordinates: [71.60, 18.15],
    heading: 285,
    sog: 19.2,
    cog: 284,
    draught: 12.0,
    length: 299,
    beam: 40,
    destination: 'COLOMBO -> SALALAH',
    eta: '2026-08-31 12:00 UTC',
    status: 'Underway Using Engine',
    riskScore: 5,
    riskFactors: ['On-schedule international transit'],
    anomalyFlags: {},
    history: [
      [72.50, 17.60],
      [72.10, 17.85],
      [71.60, 18.15]
    ],
    lastReported: '18 sec ago'
  },
  {
    id: 'v-008',
    name: 'HALANI 1 (OFFSHORE SUPPORT)',
    mmsi: '419000882',
    imo: '7814448',
    callSign: 'AUFQ',
    flag: 'India',
    flagCode: 'IN',
    type: 'Tug',
    coordinates: [71.30, 19.40],
    heading: 45,
    sog: 4.2,
    cog: 40,
    draught: 5.8,
    length: 75,
    beam: 16,
    destination: 'BOMBAY HIGH NORTH',
    eta: 'ON-SITE',
    status: 'Restricted Manoeuvrability',
    riskScore: 10,
    riskFactors: ['Offshore oil field dynamic positioning mode'],
    anomalyFlags: {},
    history: [
      [71.28, 19.35],
      [71.30, 19.40]
    ],
    lastReported: '40 sec ago'
  },
  {
    id: 'v-009',
    name: 'SAGAR KANYA FLEET #14',
    mmsi: '419900451',
    imo: 'N/A',
    callSign: 'IND-MH-049',
    flag: 'India',
    flagCode: 'IN',
    type: 'Fishing',
    coordinates: [72.75, 18.20],
    heading: 180,
    sog: 3.1,
    cog: 175,
    draught: 2.8,
    length: 28,
    beam: 7,
    destination: 'ALBAUG FISHING GROUND',
    eta: '2026-08-29 22:00 UTC',
    status: 'Engaged in Fishing',
    riskScore: 18,
    riskFactors: ['Dense artisanal cluster near coastal lane'],
    anomalyFlags: {},
    history: [
      [72.80, 18.35],
      [72.78, 18.28],
      [72.75, 18.20]
    ],
    lastReported: '1 min ago'
  },
  {
    id: 'v-010',
    name: 'NORDIC CASPIAN',
    mmsi: '538006124',
    imo: '9543885',
    callSign: 'V7XQ8',
    flag: 'Marshall Islands',
    flagCode: 'MH',
    type: 'Tanker',
    coordinates: [72.72, 18.70],
    heading: 350,
    sog: 0.1,
    cog: 340,
    draught: 13.9,
    length: 228,
    beam: 38,
    destination: 'MUMBAI OUTER ANCHORAGE',
    eta: 'AT ANCHOR',
    status: 'At Anchor',
    riskScore: 14,
    riskFactors: ['Waiting berth clearance'],
    anomalyFlags: {},
    history: [
      [72.72, 18.70]
    ],
    lastReported: '35 sec ago'
  },
  {
    id: 'v-011',
    name: 'EVER FORTUNE',
    mmsi: '356982000',
    imo: '9850551',
    callSign: '3E2184',
    flag: 'Panama',
    flagCode: 'PA',
    type: 'Cargo',
    coordinates: [72.10, 17.65],
    heading: 330,
    sog: 17.8,
    cog: 332,
    draught: 14.1,
    length: 334,
    beam: 48,
    destination: 'MUNDRA PORT',
    eta: '2026-08-30 04:00 UTC',
    status: 'Underway Using Engine',
    riskScore: 7,
    riskFactors: ['Standard passage planning verified'],
    anomalyFlags: {},
    history: [
      [72.30, 17.20],
      [72.20, 17.40],
      [72.10, 17.65]
    ],
    lastReported: '15 sec ago'
  },
  {
    id: 'v-012',
    name: 'CMA CGM CHENNAI',
    mmsi: '228394900',
    imo: '9783928',
    callSign: 'FNBF',
    flag: 'France',
    flagCode: 'FR',
    type: 'Cargo',
    coordinates: [72.85, 18.95],
    heading: 60,
    sog: 8.4,
    cog: 62,
    draught: 11.2,
    length: 300,
    beam: 48,
    destination: 'JNPT BERTH 3',
    eta: 'PILOT ON BOARD',
    status: 'Restricted Manoeuvrability',
    riskScore: 9,
    riskFactors: ['Port pilotage underway'],
    anomalyFlags: {},
    history: [
      [72.70, 18.85],
      [72.78, 18.90],
      [72.85, 18.95]
    ],
    lastReported: '8 sec ago'
  }
];

export const MOCK_ALERTS: MaritimeAlert[] = [
  {
    id: 'alt-01',
    timestamp: '07:22:15 UTC',
    level: 'critical',
    title: 'AIS Gap & Loitering Detected',
    description: 'Vessel SHADOW TRADER turned off transponder for 45 minutes near Bombay High North buffer perimeter.',
    vesselId: 'v-005',
    coordinates: [71.42, 19.12]
  },
  {
    id: 'alt-02',
    timestamp: '07:18:40 UTC',
    level: 'warning',
    title: 'High Traffic Density in Mumbai TSS',
    description: 'Convergence of 4 container carriers and tanker approach within 3 NM of Gateway channel.',
    coordinates: [72.65, 18.85]
  },
  {
    id: 'alt-03',
    timestamp: '06:55:00 UTC',
    level: 'info',
    title: 'Coast Guard Patrol Vector Delta',
    description: 'ICGS SAMARTH initiated surveillance patrol across Sector-B EEZ boundary.',
    vesselId: 'v-003',
    coordinates: [72.15, 18.35]
  },
  {
    id: 'alt-04',
    timestamp: '06:30:12 UTC',
    level: 'info',
    title: 'Weather Advisory: Swell Warning',
    description: 'Southwest monsoon surge creating 2.8m waves in Central Arabian Sea off Maharashtra coast.',
    coordinates: [71.80, 18.00]
  }
];

export const MOCK_WEATHER: WeatherMetrics = {
  windSpeed: 18.4,
  windDirection: 245,
  waveHeight: 2.3,
  seaTemp: 28.5,
  visibility: 8.5,
  barometer: 1009.2
};

// GeoJSON boundaries for Shipping Lanes, Bombay High Oil Field, EEZ, and High Risk Areas
export const MARITIME_GEOJSON = {
  bombayHighOilField: {
    type: 'Feature' as const,
    properties: {
      name: 'Bombay High Offshore Oil Field (ONGC)',
      type: 'OilField',
      restricted: true,
      description: '500m safety exclusion zone around all platforms'
    },
    geometry: {
      type: 'Polygon' as const,
      coordinates: [[
        [71.10, 19.60],
        [71.60, 19.60],
        [71.65, 19.00],
        [71.15, 19.00],
        [71.10, 19.60]
      ]]
    }
  },
  shippingCorridorNorthbound: {
    type: 'Feature' as const,
    properties: {
      name: 'Mumbai Approach TSS (Northbound)',
      type: 'ShippingLane'
    },
    geometry: {
      type: 'LineString' as const,
      coordinates: [
        [71.00, 17.50],
        [71.50, 18.00],
        [72.10, 18.60],
        [72.55, 18.85],
        [72.85, 18.95]
      ]
    }
  },
  shippingCorridorSouthbound: {
    type: 'Feature' as const,
    properties: {
      name: 'Mumbai Approach TSS (Southbound)',
      type: 'ShippingLane'
    },
    geometry: {
      type: 'LineString' as const,
      coordinates: [
        [72.85, 18.90],
        [72.50, 18.78],
        [72.00, 18.50],
        [71.40, 17.90],
        [70.90, 17.40]
      ]
    }
  },
  indianEezLine: {
    type: 'Feature' as const,
    properties: {
      name: 'India Exclusive Economic Zone (EEZ 200 NM)',
      type: 'EEZ'
    },
    geometry: {
      type: 'LineString' as const,
      coordinates: [
        [69.50, 20.80],
        [70.20, 19.80],
        [70.60, 18.50],
        [71.20, 17.20],
        [71.80, 16.00],
        [72.40, 15.00]
      ]
    }
  },
  highRiskArea: {
    type: 'Feature' as const,
    properties: {
      name: 'Special Surveillance Sector - West',
      type: 'HighRiskArea',
      threatLevel: 'Elevated'
    },
    geometry: {
      type: 'Polygon' as const,
      coordinates: [[
        [70.50, 19.80],
        [71.20, 19.80],
        [71.20, 18.80],
        [70.50, 18.80],
        [70.50, 19.80]
      ]]
    }
  }
};
