import { OilSpill } from '@/types/maris';

export interface SARUploadResult {
  id: string;
  filename: string;
  fileSizeBytes: number;
  imageUrl?: string;
  location: string;
  sensorMode: string;
  detectedAnomaly: string;
  slickName: string;
  confidenceScore: number;
  estAreaSqKm: number;
  estVolumeBarrels: number;
  lookalikeRiskPercent: number;
  lat: number;
  lng: number;
  spillPayload: OilSpill;
}

// TODO: replace mock body with real POST /api/sar/upload once backend is available
export async function uploadSARImage(file: File): Promise<SARUploadResult> {
  // Simulate network upload and backend neural inference latency
  await new Promise((resolve) => setTimeout(resolve, 1800));

  // Randomize or calibrate realistic Indian maritime coordinates around active tanker routes
  const indianMaritimePresets = [
    {
      location: '18.9205° N, 71.4820° E (Mumbai High Basin, Arabian Sea)',
      slickName: 'Mumbai High Offshore Inferred Slick',
      lat: 18.9205,
      lng: 71.4820,
      anomaly: 'Low-backscatter dark patch detected adjacent to production platform cluster',
      estArea: 7.2,
      estVol: 1450,
      confidence: 96.4,
    },
    {
      location: '21.3400° N, 72.3800° E (Gulf of Khambhat / Hazira Corridor)',
      slickName: 'Gulf of Khambhat Bilge Anomaly',
      lat: 21.3400,
      lng: 72.3800,
      anomaly: 'Linear low backscatter streak consistent with vessel de-ballasting wake',
      estArea: 4.6,
      estVol: 880,
      confidence: 93.8,
    },
    {
      location: '20.2500° N, 86.9200° E (Offshore Paradip Fairway, Bay of Bengal)',
      slickName: 'Paradip Deepwater SPM Anomaly',
      lat: 20.2500,
      lng: 86.9200,
      anomaly: 'High contrast surfactant layer with sharp boundary contours',
      estArea: 8.9,
      estVol: 1920,
      confidence: 95.1,
    }
  ];

  const selectedPreset = indianMaritimePresets[Math.floor(Math.random() * indianMaritimePresets.length)];

  // Create temporary object URL for uploaded image preview
  let previewUrl = '';
  try {
    previewUrl = URL.createObjectURL(file);
  } catch {
    previewUrl = '';
  }

  const generatedId = `SPILL-SAR-${Math.floor(1000 + Math.random() * 9000)}`;

  const spillPayload: OilSpill = {
    id: generatedId,
    name: selectedPreset.slickName,
    locationName: selectedPreset.location,
    lat: selectedPreset.lat,
    lng: selectedPreset.lng,
    severity: selectedPreset.estVol > 1200 ? 'critical' : 'warning',
    estimatedVolumeBarrels: selectedPreset.estVol,
    slickAreaSqKm: selectedPreset.estArea,
    detectedAt: new Date().toISOString(),
    sensorSource: 'Sentinel-1 SAR',
    containmentStatus: 'Under Surveillance',
    windSpeedKnots: 12.5,
    windDirectionDeg: 235,
    currentDriftKnots: 1.6,
    nearestPort: 'Indian Maritime Port',
    distanceToCoastKm: 32,
    suspectedSource: `SAR Satellite Ingestion (${file.name})`,
    driftTrajectory: [
      [selectedPreset.lat, selectedPreset.lng],
      [selectedPreset.lat + 0.04, selectedPreset.lng + 0.06],
      [selectedPreset.lat + 0.09, selectedPreset.lng + 0.13],
      [selectedPreset.lat + 0.15, selectedPreset.lng + 0.21],
    ],
    slickPolygon: [
      [selectedPreset.lat + 0.025, selectedPreset.lng - 0.025],
      [selectedPreset.lat + 0.035, selectedPreset.lng + 0.035],
      [selectedPreset.lat - 0.025, selectedPreset.lng + 0.025],
      [selectedPreset.lat - 0.035, selectedPreset.lng - 0.015],
    ]
  };

  return {
    id: generatedId,
    filename: file.name,
    fileSizeBytes: file.size,
    imageUrl: previewUrl,
    location: selectedPreset.location,
    sensorMode: 'C-Band Synthetic Aperture Radar (Normalized VV Pol)',
    detectedAnomaly: selectedPreset.anomaly,
    slickName: selectedPreset.slickName,
    confidenceScore: selectedPreset.confidence,
    estAreaSqKm: selectedPreset.estArea,
    estVolumeBarrels: selectedPreset.estVol,
    lookalikeRiskPercent: 2.8,
    lat: selectedPreset.lat,
    lng: selectedPreset.lng,
    spillPayload,
  };
}

