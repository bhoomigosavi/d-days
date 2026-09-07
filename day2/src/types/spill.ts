import type mapboxgl from 'mapbox-gl';

export type SpillSeverity = 'critical' | 'high' | 'medium' | 'low';

export type SpillDetectionStatus = 
  | 'CONFIRMED_ACTIVE' 
  | 'INVESTIGATING' 
  | 'CONTAINMENT_IN_PROGRESS' 
  | 'DISSIPATING' 
  | 'CONTAINED'
  | 'HIGH_RISK_ANOMALY';

export interface ShapeMetrics {
  /** Isoperimetric quotient Q = 4 * PI * Area / Perimeter^2 (1.0 = circle, <0.4 = elongated) */
  compactness: number;
  /** Qualitative descriptor for shape dispersal pattern */
  compactnessLabel: 'Compact Core' | 'Moderately Dispersed' | 'Elongated / Linear Trail' | 'Irregular / Dendritic';
  /** Aspect ratio of the minimum enclosing axis (Length / Width) */
  aspectRatio: number;
  /** Geographic bounding box [minLon, minLat, maxLon, maxLat] */
  boundingBox: [number, number, number, number];
  /** Bounding box physical dimensions in kilometers */
  dimensionsKm: {
    lengthKm: number;
    widthKm: number;
  };
  /** Total outer and inner boundary perimeter in km */
  perimeterKm: number;
  /** Perimeter in nautical miles */
  perimeterNm: number;
  /** Number of coordinate vertices defining the boundary */
  verticesCount: number;
  /** Perimeter-to-area boundary complexity score */
  complexityScore: number;
}

export interface SpillFeatureProperties {
  id?: string;
  name?: string;
  area?: number; // In square kilometers (km²)
  perimeter?: number; // In kilometers (km)
  confidence?: number; // 0 to 1 (e.g. 0.94) or 0 to 100 (e.g. 94)
  detectionTime?: string; // ISO 8601 string or date string (e.g. '2026-08-29T08:30:00Z')
  detectedAt?: string; // Alternative timestamp field
  severity?: SpillSeverity;
  status?: SpillDetectionStatus;
  sourceVessel?: string;
  sourceVesselMmsi?: string;
  sourceVesselType?: string;
  thicknessMm?: number;
  estimatedVolumeM3?: number;
  sensorType?: string; // e.g. 'Sentinel-1 SAR', 'Landsat-9', 'RADARSAT-2', 'Aerial Drone'
  weatheringState?: string; // e.g. 'Fresh Crude', 'Emulsified Mousse', 'Surface Sheen'
  driftVelocityKnots?: number;
  driftHeadingDeg?: number;
  description?: string;
  shapeMetrics?: Partial<ShapeMetrics>;
  [key: string]: any;
}

export type SpillPolygonGeometry = GeoJSON.Polygon | GeoJSON.MultiPolygon;

export type SpillFeature = GeoJSON.Feature<SpillPolygonGeometry, SpillFeatureProperties>;

export type SpillFeatureCollection = GeoJSON.FeatureCollection<SpillPolygonGeometry, SpillFeatureProperties>;

export type SpillGeoJSONInput = 
  | SpillFeature
  | SpillFeatureCollection
  | SpillPolygonGeometry;

export interface SpillLayerProps {
  /** Mapbox GL Map instance. Required to bind layers, markers, and event handlers. */
  map: mapboxgl.Map | null;
  /** GeoJSON data (Feature, FeatureCollection, or raw Polygon/MultiPolygon geometry). */
  data: SpillGeoJSONInput;
  /** Unique ID prefix for Mapbox sources & layers (default: 'oil-spill-layer'). */
  id?: string;
  /** Fill color for the oil spill polygon (default: '#ef4444'). */
  fillColor?: string;
  /** Fill opacity from 0 to 1 (default: 0.35). */
  fillOpacity?: number;
  /** Border outline stroke color (default: '#dc2626'). */
  borderColor?: string;
  /** Border outline stroke width in pixels (default: 2.5). */
  borderWidth?: number;
  /** Optional stroke dash pattern, e.g. [2, 2]. Defaults to solid line. */
  borderDashArray?: number[];
  /** Whether to render the pulsing beacon dot at the polygon centroid (default: true). */
  showPulsingDot?: boolean;
  /** Color of the pulsing centroid dot (default: '#ef4444'). */
  pulseColor?: string;
  /** Size in pixels of the pulsing centroid marker (default: 36). */
  pulseSize?: number;
  /** Whether clicking the polygon opens a detail popup (default: true). */
  interactive?: boolean;
  /** Optional custom popup renderer for overriding HTML content. */
  renderPopupContent?: (
    feature: SpillFeature, 
    calculatedAreaKm2: number, 
    centroid: [number, number]
  ) => HTMLElement | string;
  /** Callback fired when the spill polygon or pulsing centroid is clicked. */
  onSpillClick?: (
    event: mapboxgl.MapLayerMouseEvent | MouseEvent, 
    feature: SpillFeature, 
    centroid: [number, number]
  ) => void;
  /** Callback fired when the mouse enters or leaves the spill polygon. */
  onSpillHover?: (
    event: mapboxgl.MapLayerMouseEvent, 
    feature: SpillFeature | null
  ) => void;
  /** Control visibility of the layer (default: true). */
  visible?: boolean;
  /** Before layer ID to insert this layer beneath specific map layers (e.g. text labels). */
  beforeId?: string;
}

export interface SpillPanelProps {
  /** The currently selected or active oil spill feature */
  feature?: SpillFeature | null;
  /** Optional GeoJSON input to automatically extract feature from */
  data?: SpillGeoJSONInput | null;
  /** Whether the sidebar panel is open/visible (default: true) */
  isOpen?: boolean;
  /** Callback fired when the user clicks the close/collapse button */
  onClose?: () => void;
  /** Callback to center/focus the map camera on the spill centroid */
  onFocusOnMap?: (centroid: [number, number], zoom?: number) => void;
  /** Callback to trigger an alert broadcast or notification */
  onDispatchAlert?: (feature: SpillFeature) => void;
  /** Callback to export or copy the GeoJSON boundary */
  onExportGeoJson?: (feature: SpillFeature) => void;
  /** Extra container CSS classes */
  className?: string;
  /** Theme mode for the panel (default: auto inherits from dark class / document) */
  theme?: 'light' | 'dark' | 'auto';
  /** Optional theme toggle callback */
  onToggleTheme?: () => void;
}
