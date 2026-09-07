import { 
  SpillGeoJSONInput, 
  SpillFeature, 
  SpillFeatureCollection, 
  SpillPolygonGeometry,
  ShapeMetrics,
  SpillDetectionStatus,
  SpillSeverity
} from '../types/spill';

/**
 * Normalizes any valid GeoJSON polygon input (Feature, FeatureCollection, or raw geometry)
 * into a standard SpillFeatureCollection.
 */
export function normalizeSpillGeoJSON(input?: SpillGeoJSONInput | null): SpillFeatureCollection {
  if (!input) {
    return {
      type: 'FeatureCollection',
      features: []
    };
  }

  if (input.type === 'FeatureCollection') {
    return input as SpillFeatureCollection;
  }

  if (input.type === 'Feature') {
    return {
      type: 'FeatureCollection',
      features: [input as SpillFeature]
    };
  }

  if (input.type === 'Polygon' || input.type === 'MultiPolygon') {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: input as SpillPolygonGeometry
        }
      ]
    };
  }

  return {
    type: 'FeatureCollection',
    features: []
  };
}

/**
 * Computes great-circle distance between two [lon, lat] points using the Haversine formula.
 */
export function haversineDistanceKm(p1: [number, number], p2: [number, number]): number {
  const R = 6378.137; // Earth's mean radius in km
  const toRad = Math.PI / 180;

  const lon1 = p1[0] * toRad;
  const lat1 = p1[1] * toRad;
  const lon2 = p2[0] * toRad;
  const lat2 = p2[1] * toRad;

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Computes the geometric centroid of a single linear ring of coordinates [[lon, lat], ...].
 */
export function calculateRingCentroid(ring: [number, number][]): [number, number] {
  if (!ring || ring.length === 0) return [0, 0];
  if (ring.length === 1) return [ring[0][0], ring[0][1]];
  if (ring.length === 2) return [(ring[0][0] + ring[1][0]) / 2, (ring[0][1] + ring[1][1]) / 2];

  let area = 0;
  let cx = 0;
  let cy = 0;

  const n = ring.length;
  for (let i = 0; i < n - 1; i++) {
    const x0 = ring[i][0];
    const y0 = ring[i][1];
    const x1 = ring[i + 1][0];
    const y1 = ring[i + 1][1];

    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }

  area = area * 0.5;

  if (Math.abs(area) < 1e-9) {
    let sumX = 0;
    let sumY = 0;
    const count = n - (ring[0][0] === ring[n - 1][0] && ring[0][1] === ring[n - 1][1] ? 1 : 0);
    for (let i = 0; i < count; i++) {
      sumX += ring[i][0];
      sumY += ring[i][1];
    }
    return [sumX / count, sumY / count];
  }

  const factor = 1 / (6 * area);
  return [cx * factor, cy * factor];
}

/**
 * Computes the geometric centroid for a GeoJSON Polygon or MultiPolygon geometry.
 */
export function calculatePolygonCentroid(geometry?: SpillPolygonGeometry | null): [number, number] {
  if (!geometry) return [0, 0];

  if (geometry.type === 'Polygon') {
    const outerRing = geometry.coordinates[0] as [number, number][];
    return calculateRingCentroid(outerRing);
  }

  if (geometry.type === 'MultiPolygon') {
    let totalWeight = 0;
    let weightedCx = 0;
    let weightedCy = 0;

    for (const polygonCoords of geometry.coordinates) {
      const outerRing = polygonCoords[0] as [number, number][];
      const centroid = calculateRingCentroid(outerRing);
      const ringArea = calculateRingAreaKm2(outerRing);
      const weight = Math.max(ringArea, 0.0001);

      weightedCx += centroid[0] * weight;
      weightedCy += centroid[1] * weight;
      totalWeight += weight;
    }

    if (totalWeight > 0) {
      return [weightedCx / totalWeight, weightedCy / totalWeight];
    }

    const firstRing = geometry.coordinates[0]?.[0] as [number, number][];
    return calculateRingCentroid(firstRing);
  }

  return [0, 0];
}

/**
 * Computes geodesic / spherical area of a linear ring in square kilometers (km²).
 */
export function calculateRingAreaKm2(ring: [number, number][]): number {
  if (!ring || ring.length < 3) return 0;

  const R = 6378.137; // km
  const toRad = Math.PI / 180;
  let total = 0;
  const n = ring.length;

  for (let i = 0; i < n - 1; i++) {
    const p1 = ring[i];
    const p2 = ring[i + 1];

    const lambda1 = p1[0] * toRad;
    const phi1 = p1[1] * toRad;
    const lambda2 = p2[0] * toRad;
    const phi2 = p2[1] * toRad;

    total += (lambda2 - lambda1) * (2 + Math.sin(phi1) + Math.sin(phi2));
  }

  return Math.abs((total * R * R) / 2);
}

/**
 * Calculates total area in km² for a Polygon or MultiPolygon.
 */
export function calculatePolygonAreaKm2(geometry?: SpillPolygonGeometry | null): number {
  if (!geometry) return 0;

  if (geometry.type === 'Polygon') {
    let area = 0;
    for (let i = 0; i < geometry.coordinates.length; i++) {
      const ring = geometry.coordinates[i] as [number, number][];
      const ringArea = calculateRingAreaKm2(ring);
      if (i === 0) {
        area += ringArea;
      } else {
        area -= ringArea;
      }
    }
    return Math.max(0, area);
  }

  if (geometry.type === 'MultiPolygon') {
    let totalArea = 0;
    for (const polygon of geometry.coordinates) {
      for (let i = 0; i < polygon.length; i++) {
        const ring = polygon[i] as [number, number][];
        const ringArea = calculateRingAreaKm2(ring);
        if (i === 0) {
          totalArea += ringArea;
        } else {
          totalArea -= ringArea;
        }
      }
    }
    return Math.max(0, totalArea);
  }

  return 0;
}

/**
 * Calculates perimeter of a linear ring in kilometers.
 */
export function calculateRingPerimeterKm(ring: [number, number][]): number {
  if (!ring || ring.length < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    perimeter += haversineDistanceKm(ring[i], ring[i + 1]);
  }
  return perimeter;
}

/**
 * Calculates total perimeter in km for a Polygon or MultiPolygon.
 */
export function calculatePolygonPerimeterKm(geometry?: SpillPolygonGeometry | null): number {
  if (!geometry) return 0;

  let totalPerimeter = 0;

  if (geometry.type === 'Polygon') {
    for (const ring of geometry.coordinates) {
      totalPerimeter += calculateRingPerimeterKm(ring as [number, number][]);
    }
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates) {
      for (const ring of polygon) {
        totalPerimeter += calculateRingPerimeterKm(ring as [number, number][]);
      }
    }
  }

  return totalPerimeter;
}

/**
 * Calculates detailed shape metrics (compactness, aspect ratio, bounding box, complexity).
 */
export function calculateShapeMetrics(
  geometry?: SpillPolygonGeometry | null,
  overrideAreaKm2?: number,
  overridePerimeterKm?: number
): ShapeMetrics {
  const areaKm2 = typeof overrideAreaKm2 === 'number' && overrideAreaKm2 > 0
    ? overrideAreaKm2
    : calculatePolygonAreaKm2(geometry);

  const perimeterKm = typeof overridePerimeterKm === 'number' && overridePerimeterKm > 0
    ? overridePerimeterKm
    : calculatePolygonPerimeterKm(geometry);

  const perimeterNm = perimeterKm * 0.539957;

  // 1. Calculate Bounding Box and count vertices
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  let verticesCount = 0;

  const extractCoords = (coords: any[]) => {
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      const [lon, lat] = coords as [number, number];
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      verticesCount++;
    } else {
      coords.forEach(extractCoords);
    }
  };

  if (geometry?.coordinates) {
    extractCoords(geometry.coordinates);
  }

  if (minLon === Infinity) {
    minLon = 0;
    maxLon = 0;
    minLat = 0;
    maxLat = 0;
  }

  // Dimensions of bounding box
  const widthKm = haversineDistanceKm([minLon, (minLat + maxLat) / 2], [maxLon, (minLat + maxLat) / 2]);
  const lengthKm = haversineDistanceKm([(minLon + maxLon) / 2, minLat], [(minLon + maxLon) / 2, maxLat]);

  const maxDim = Math.max(widthKm, lengthKm);
  const minDim = Math.min(widthKm, lengthKm);
  const aspectRatio = minDim > 0 ? Number((maxDim / minDim).toFixed(2)) : 1.0;

  // 2. Isoperimetric Quotient Q = 4 * PI * Area / Perimeter^2
  let compactness = 0;
  if (perimeterKm > 0 && areaKm2 > 0) {
    compactness = (4 * Math.PI * areaKm2) / (perimeterKm * perimeterKm);
    compactness = Math.min(1.0, Math.max(0.01, compactness));
  }

  let compactnessLabel: ShapeMetrics['compactnessLabel'] = 'Moderately Dispersed';
  if (compactness >= 0.65) {
    compactnessLabel = 'Compact Core';
  } else if (compactness >= 0.40) {
    compactnessLabel = 'Moderately Dispersed';
  } else if (aspectRatio >= 2.2) {
    compactnessLabel = 'Elongated / Linear Trail';
  } else {
    compactnessLabel = 'Irregular / Dendritic';
  }

  // 3. Complexity Score (Boundary Roughness index)
  const complexityScore = perimeterKm > 0 ? Number((perimeterKm / (2 * Math.sqrt(Math.PI * Math.max(areaKm2, 0.01)))).toFixed(2)) : 1.0;

  return {
    compactness: Number(compactness.toFixed(3)),
    compactnessLabel,
    aspectRatio,
    boundingBox: [minLon, minLat, maxLon, maxLat],
    dimensionsKm: {
      lengthKm: Number(Math.max(lengthKm, widthKm).toFixed(2)),
      widthKm: Number(Math.min(lengthKm, widthKm).toFixed(2))
    },
    perimeterKm: Number(perimeterKm.toFixed(2)),
    perimeterNm: Number(perimeterNm.toFixed(2)),
    verticesCount,
    complexityScore
  };
}

/**
 * Formats area into a human-readable string with units.
 */
export function formatArea(areaKm2: number): { formatted: string; acres: string; sqNm: string; ha: string } {
  const sqKm = Math.max(0, areaKm2);
  const acres = sqKm * 247.105;
  const sqNm = sqKm * 0.291553;
  const ha = sqKm * 100;

  let formatted = '';
  if (sqKm < 0.01) {
    formatted = `${(sqKm * 1000000).toFixed(0)} m²`;
  } else if (sqKm < 1) {
    formatted = `${(sqKm * 100).toFixed(1)} ha (${sqKm.toFixed(3)} km²)`;
  } else {
    formatted = `${sqKm.toFixed(2)} km²`;
  }

  return {
    formatted,
    acres: `${acres.toLocaleString('en-US', { maximumFractionDigits: 1 })} acres`,
    sqNm: `${sqNm.toFixed(2)} NM²`,
    ha: `${ha.toFixed(1)} ha`
  };
}

/**
 * Formats perimeter into km and nautical miles.
 */
export function formatPerimeter(perimeterKm: number): { formatted: string; nm: string } {
  const km = Math.max(0, perimeterKm);
  const nm = km * 0.539957;
  return {
    formatted: `${km.toFixed(2)} km`,
    nm: `${nm.toFixed(2)} NM`
  };
}

/**
 * Normalizes confidence score to percentage and confidence tier.
 */
export function formatConfidence(confidence?: number): {
  percent: string;
  value: number;
  tier: 'High' | 'Moderate' | 'Low';
  color: string;
  badgeVariant: 'critical' | 'warning' | 'info' | 'default';
  description: string;
} {
  if (confidence === undefined || confidence === null || isNaN(confidence)) {
    return {
      percent: 'N/A',
      value: 0,
      tier: 'Moderate',
      color: '#94a3b8',
      badgeVariant: 'default',
      description: 'Pending Sensor Calibration'
    };
  }

  let value = confidence;
  if (value > 0 && value <= 1) {
    value = value * 100;
  }
  value = Math.min(100, Math.max(0, value));

  if (value >= 80) {
    return {
      percent: `${value.toFixed(1)}%`,
      value,
      tier: 'High',
      color: '#ef4444',
      badgeVariant: 'critical',
      description: 'High Satellite Confidence (SAR)'
    };
  } else if (value >= 50) {
    return {
      percent: `${value.toFixed(1)}%`,
      value,
      tier: 'Moderate',
      color: '#f59e0b',
      badgeVariant: 'warning',
      description: 'Moderate Confidence'
    };
  } else {
    return {
      percent: `${value.toFixed(1)}%`,
      value,
      tier: 'Low',
      color: '#38bdf8',
      badgeVariant: 'info',
      description: 'Preliminary Detection'
    };
  }
}

/**
 * Formats detection timestamp with UTC and relative time.
 */
export function formatDetectionTime(isoOrDateString?: string): {
  formattedUtc: string;
  formattedLocal: string;
  relative: string;
  iso: string;
} {
  if (!isoOrDateString) {
    return {
      formattedUtc: 'Unknown Time',
      formattedLocal: 'Unknown Time',
      relative: 'Recently reported',
      iso: new Date().toISOString()
    };
  }

  try {
    const date = new Date(isoOrDateString);
    if (isNaN(date.getTime())) {
      return {
        formattedUtc: isoOrDateString,
        formattedLocal: isoOrDateString,
        relative: 'Reported timestamp',
        iso: isoOrDateString
      };
    }

    const utcString = date.toUTCString().replace('GMT', 'UTC');
    const localString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let relative = '';
    if (diffMs < 0) {
      relative = 'Just now (live stream)';
    } else if (diffMins < 1) {
      relative = 'Just now';
    } else if (diffMins < 60) {
      relative = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      const remMins = diffMins % 60;
      relative = `${diffHours}h ${remMins > 0 ? `${remMins}m ` : ''}ago`;
    } else {
      relative = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }

    return {
      formattedUtc: utcString,
      formattedLocal: localString,
      relative,
      iso: date.toISOString()
    };
  } catch {
    return {
      formattedUtc: String(isoOrDateString),
      formattedLocal: String(isoOrDateString),
      relative: 'Reported',
      iso: String(isoOrDateString)
    };
  }
}

/**
 * Formats coordinates into standard Latitude and Longitude strings.
 */
export function formatCoordinates(coords: [number, number]): {
  formatted: string;
  latDms: string;
  lonDms: string;
  decimal: string;
} {
  const [lon, lat] = coords;
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';

  const formatDms = (val: number, isLat: boolean): string => {
    const abs = Math.abs(val);
    const d = Math.floor(abs);
    const m = Math.floor((abs - d) * 60);
    const s = ((abs - d - m / 60) * 3600).toFixed(1);
    const dir = isLat ? (val >= 0 ? 'N' : 'S') : (val >= 0 ? 'E' : 'W');
    return `${d}° ${m}' ${s}" ${dir}`;
  };

  const latDms = formatDms(lat, true);
  const lonDms = formatDms(lon, false);

  return {
    formatted: `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`,
    latDms,
    lonDms,
    decimal: `${lat.toFixed(6)}, ${lon.toFixed(6)}`
  };
}

/**
 * Helper to resolve status badge properties
 */
export function resolveDetectionStatus(
  status?: SpillDetectionStatus,
  severity?: SpillSeverity
): {
  label: string;
  variant: 'critical' | 'destructive' | 'warning' | 'info' | 'success' | 'default';
  dotColor: string;
  description: string;
} {
  if (status === 'CONFIRMED_ACTIVE' || severity === 'critical') {
    return {
      label: 'ACTIVE SPILL DETECTED',
      variant: 'critical',
      dotColor: '#ef4444',
      description: 'Critical Hazard - Immediate Response Required'
    };
  }
  if (status === 'CONTAINMENT_IN_PROGRESS') {
    return {
      label: 'CONTAINMENT ACTIVE',
      variant: 'warning',
      dotColor: '#f59e0b',
      description: 'Boom Deployments & Skimming Underway'
    };
  }
  if (status === 'INVESTIGATING' || severity === 'medium') {
    return {
      label: 'INVESTIGATING SLICK',
      variant: 'warning',
      dotColor: '#f59e0b',
      description: 'Awaiting Secondary Satellite Confirmation'
    };
  }
  if (status === 'CONTAINED' || status === 'DISSIPATING') {
    return {
      label: 'DISSIPATING / CONTAINED',
      variant: 'success',
      dotColor: '#10b981',
      description: 'Spill Area Reducing'
    };
  }

  return {
    label: 'HAZARD REPORTED',
    variant: 'destructive',
    dotColor: '#ef4444',
    description: 'Maritime Oil Hazard'
  };
}
