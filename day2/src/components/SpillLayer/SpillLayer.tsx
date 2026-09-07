import React, { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { SpillLayerProps, SpillFeature, SpillFeatureProperties } from '../../types/spill';
import { 
  normalizeSpillGeoJSON, 
  calculatePolygonCentroid, 
  calculatePolygonAreaKm2, 
  formatArea, 
  formatConfidence, 
  formatDetectionTime, 
  formatCoordinates 
} from '../../utils/geoUtils';
import './SpillLayer.css';

export const SpillLayer: React.FC<SpillLayerProps> = ({
  map,
  data,
  id = 'oil-spill-layer',
  fillColor = '#ef4444',
  fillOpacity = 0.35,
  borderColor = '#dc2626',
  borderWidth = 2.5,
  borderDashArray,
  showPulsingDot = true,
  pulseColor = '#ef4444',
  pulseSize = 36,
  interactive = true,
  renderPopupContent,
  onSpillClick,
  onSpillHover,
  visible = true,
  beforeId
}) => {
  const sourceId = `${id}-source`;
  const fillLayerId = `${id}-fill`;
  const borderLayerId = `${id}-border`;

  // References for tracking active DOM elements & Mapbox instances
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  // Normalize GeoJSON input into standard FeatureCollection
  const featureCollection = normalizeSpillGeoJSON(data);
  const primaryFeature = featureCollection.features[0] as SpillFeature | undefined;

  /**
   * Generates the rich interactive HTML popup content for the spill details
   */
  const createDefaultPopupHtml = useCallback((
    feature: SpillFeature, 
    calculatedAreaKm2: number, 
    centroid: [number, number]
  ): string => {
    const props: SpillFeatureProperties = feature.properties || {};
    
    // 1. Area: Use property value if provided, otherwise computed geodesic area
    const effectiveAreaKm2 = typeof props.area === 'number' && props.area > 0 
      ? props.area 
      : calculatedAreaKm2;
    const areaInfo = formatArea(effectiveAreaKm2);

    // 2. Confidence: Format percentage, badge color, meter bar
    const confInfo = formatConfidence(props.confidence);

    // 3. Detection Time: Format UTC and relative time
    const timeInfo = formatDetectionTime(props.detectionTime || props.detectedAt);

    // 4. Coordinates
    const coordString = formatCoordinates(centroid);

    // 5. Spill Name and ID
    const spillTitle = props.name || 'Oil Spill Boundary';
    const spillId = props.id || 'ACTIVE HAZARD';
    const sensor = props.sensorType || 'Satellite SAR Analysis';
    const vessel = props.sourceVessel ? `<div class="spill-detail-row"><span class="label">Source:</span><span class="value">${props.sourceVessel}</span></div>` : '';
    const thickness = props.thicknessMm ? `<div class="spill-detail-row"><span class="label">Est. Thickness:</span><span class="value">${props.thicknessMm} mm</span></div>` : '';

    return `
      <div class="spill-popup-card">
        <!-- Header -->
        <div class="spill-popup-header">
          <div class="spill-popup-badge-row">
            <span class="spill-badge-hazard">
              <span class="spill-badge-dot"></span>
              OIL SPILL ALERT
            </span>
            <span class="spill-popup-id">${spillId}</span>
          </div>
          <h4 class="spill-popup-title">${spillTitle}</h4>
        </div>

        <!-- Body & Core Metrics Grid -->
        <div class="spill-popup-body">
          <div class="spill-metrics-grid">
            
            <!-- Metric 1: Spill Area -->
            <div class="spill-metric-box">
              <div class="spill-metric-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18" />
                </svg>
                Spill Area
              </div>
              <div class="spill-metric-value area-highlight">${areaInfo.formatted}</div>
              <div class="spill-metric-subtext">${areaInfo.acres}</div>
            </div>

            <!-- Metric 2: Confidence -->
            <div class="spill-metric-box">
              <div class="spill-metric-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Confidence
              </div>
              <div class="spill-metric-value" style="color: ${confInfo.color};">${confInfo.percent}</div>
              <div class="spill-confidence-meter">
                <div class="spill-confidence-fill" style="width: ${confInfo.value}%; background-color: ${confInfo.color};"></div>
              </div>
            </div>

            <!-- Metric 3: Detection Time -->
            <div class="spill-metric-box spill-metric-full">
              <div class="spill-metric-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Detection Time
              </div>
              <div class="spill-metric-value" style="font-size: 12px;">${timeInfo.formattedUtc}</div>
              <div class="spill-metric-subtext" style="color: #38bdf8;">${timeInfo.relative}</div>
            </div>

          </div>

          <!-- Extra Telemetry Details -->
          <div class="spill-extra-details">
            <div class="spill-detail-row">
              <span class="label">Centroid:</span>
              <span class="value">${coordString}</span>
            </div>
            <div class="spill-detail-row">
              <span class="label">Sensor:</span>
              <span class="value">${sensor}</span>
            </div>
            ${vessel}
            ${thickness}
          </div>
        </div>
      </div>
    `;
  }, []);

  /**
   * Opens popup at given coordinates with spill details
   */
  const showPopup = useCallback((
    targetCoordinates: [number, number], 
    feature: SpillFeature
  ) => {
    if (!map) return;

    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    const centroid = calculatePolygonCentroid(feature.geometry);
    const calculatedArea = calculatePolygonAreaKm2(feature.geometry);

    const popup = new mapboxgl.Popup({
      className: 'spill-details-popup',
      closeButton: true,
      closeOnClick: true,
      offset: 14,
      maxWidth: '380px'
    }).setLngLat(targetCoordinates);

    if (renderPopupContent) {
      const customContent = renderPopupContent(feature, calculatedArea, centroid);
      if (typeof customContent === 'string') {
        popup.setHTML(customContent);
      } else if (customContent instanceof HTMLElement) {
        popup.setDOMContent(customContent);
      }
    } else {
      popup.setHTML(createDefaultPopupHtml(feature, calculatedArea, centroid));
    }

    popup.addTo(map);
    popupRef.current = popup;
  }, [map, renderPopupContent, createDefaultPopupHtml]);

  /**
   * Synchronize Mapbox Source and Layers (Fill & Border)
   */
  const syncLayers = useCallback(() => {
    if (!map) return;

    // Wait until map style is fully loaded
    if (!map.isStyleLoaded()) {
      map.once('style.load', syncLayers);
      return;
    }

    // 1. Manage GeoJSON Source
    const existingSource = map.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined;
    if (existingSource) {
      existingSource.setData(featureCollection);
    } else {
      map.addSource(sourceId, {
        type: 'geojson',
        data: featureCollection
      });
    }

    // 2. Manage Fill Layer (Semi-transparent red polygon)
    if (!map.getLayer(fillLayerId)) {
      map.addLayer(
        {
          id: fillLayerId,
          type: 'fill',
          source: sourceId,
          layout: {
            visibility: visible ? 'visible' : 'none'
          },
          paint: {
            'fill-color': fillColor,
            'fill-opacity': fillOpacity,
            'fill-antialias': true
          }
        },
        beforeId
      );
    } else {
      map.setPaintProperty(fillLayerId, 'fill-color', fillColor);
      map.setPaintProperty(fillLayerId, 'fill-opacity', fillOpacity);
      map.setLayoutProperty(fillLayerId, 'visibility', visible ? 'visible' : 'none');
    }

    // 3. Manage Border Line Layer (Red border)
    if (!map.getLayer(borderLayerId)) {
      const linePaint: mapboxgl.LinePaint = {
        'line-color': borderColor,
        'line-width': borderWidth,
        'line-opacity': 0.95
      };

      if (borderDashArray && borderDashArray.length > 0) {
        linePaint['line-dasharray'] = borderDashArray;
      }

      map.addLayer(
        {
          id: borderLayerId,
          type: 'line',
          source: sourceId,
          layout: {
            visibility: visible ? 'visible' : 'none',
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: linePaint
        },
        beforeId
      );
    } else {
      map.setPaintProperty(borderLayerId, 'line-color', borderColor);
      map.setPaintProperty(borderLayerId, 'line-width', borderWidth);
      if (borderDashArray && borderDashArray.length > 0) {
        map.setPaintProperty(borderLayerId, 'line-dasharray', borderDashArray);
      }
      map.setLayoutProperty(borderLayerId, 'visibility', visible ? 'visible' : 'none');
    }
  }, [
    map, 
    sourceId, 
    fillLayerId, 
    borderLayerId, 
    featureCollection, 
    fillColor, 
    fillOpacity, 
    borderColor, 
    borderWidth, 
    borderDashArray, 
    visible, 
    beforeId
  ]);

  /**
   * Synchronize Centroid Pulsing Dot Markers
   */
  const syncCentroidMarkers = useCallback(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (!showPulsingDot || !visible || featureCollection.features.length === 0) {
      return;
    }

    featureCollection.features.forEach((feature) => {
      if (!feature.geometry) return;
      const centroid = calculatePolygonCentroid(feature.geometry);

      // Create custom pulsing DOM element
      const markerEl = document.createElement('div');
      markerEl.className = 'spill-centroid-marker';
      markerEl.style.setProperty('--pulse-color', pulseColor);
      markerEl.style.width = `${pulseSize}px`;
      markerEl.style.height = `${pulseSize}px`;

      markerEl.innerHTML = `
        <div class="spill-pulse-ring spill-pulse-ring-outer"></div>
        <div class="spill-pulse-ring spill-pulse-ring-mid"></div>
        <div class="spill-pulse-glow"></div>
        <div class="spill-pulse-core">
          <div class="spill-pulse-inner-dot"></div>
        </div>
        <div class="spill-marker-label">SPILL CENTROID</div>
      `;

      // Pulsing dot click triggers popup & onSpillClick
      if (interactive) {
        markerEl.addEventListener('click', (e) => {
          e.stopPropagation();
          showPopup(centroid, feature);
          if (onSpillClick) {
            onSpillClick(e, feature, centroid);
          }
        });
      }

      const marker = new mapboxgl.Marker({
        element: markerEl,
        anchor: 'center'
      })
        .setLngLat(centroid)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [
    map, 
    showPulsingDot, 
    visible, 
    featureCollection, 
    pulseColor, 
    pulseSize, 
    interactive, 
    showPopup, 
    onSpillClick
  ]);

  /**
   * Handle Mapbox Layer Click & Hover Events
   */
  useEffect(() => {
    if (!map || !map.isStyleLoaded() || !map.getLayer(fillLayerId)) return;

    const handlePolygonClick = (e: mapboxgl.MapLayerMouseEvent) => {
      if (!interactive) return;
      
      const features = map.queryRenderedFeatures(e.point, { layers: [fillLayerId] });
      if (!features || features.length === 0) return;

      const clickedFeature = featureCollection.features[0] || (features[0] as unknown as SpillFeature);
      const centroid = calculatePolygonCentroid(clickedFeature.geometry);
      const clickCoords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      showPopup(clickCoords, clickedFeature);

      if (onSpillClick) {
        onSpillClick(e, clickedFeature, centroid);
      }
    };

    const handleMouseEnter = (e: mapboxgl.MapLayerMouseEvent) => {
      if (!interactive) return;
      map.getCanvas().style.cursor = 'pointer';
      if (onSpillHover) {
        const hoveredFeature = featureCollection.features[0] || null;
        onSpillHover(e, hoveredFeature);
      }
    };

    const handleMouseLeave = (e: mapboxgl.MapLayerMouseEvent) => {
      if (!interactive) return;
      map.getCanvas().style.cursor = '';
      if (onSpillHover) {
        onSpillHover(e, null);
      }
    };

    map.on('click', fillLayerId, handlePolygonClick);
    map.on('mouseenter', fillLayerId, handleMouseEnter);
    map.on('mouseleave', fillLayerId, handleMouseLeave);

    return () => {
      if (!map) return;
      map.off('click', fillLayerId, handlePolygonClick);
      map.off('mouseenter', fillLayerId, handleMouseEnter);
      map.off('mouseleave', fillLayerId, handleMouseLeave);
    };
  }, [map, fillLayerId, interactive, featureCollection, showPopup, onSpillClick, onSpillHover]);

  /**
   * Synchronize layers and markers on prop changes
   */
  useEffect(() => {
    syncLayers();
    syncCentroidMarkers();
  }, [syncLayers, syncCentroidMarkers]);

  /**
   * Handle map style changes (re-add layers and markers when style reloads)
   */
  useEffect(() => {
    if (!map) return;

    const handleStyleData = () => {
      if (map.isStyleLoaded()) {
        syncLayers();
        syncCentroidMarkers();
      }
    };

    map.on('styledata', handleStyleData);

    return () => {
      map.off('styledata', handleStyleData);
    };
  }, [map, syncLayers, syncCentroidMarkers]);

  /**
   * Clean up layers, sources, markers, and popups on unmount
   */
  useEffect(() => {
    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }

      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      if (map) {
        try {
          if (map.getLayer(borderLayerId)) map.removeLayer(borderLayerId);
          if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
          if (map.getSource(sourceId)) map.removeSource(sourceId);
        } catch {
          // Ignored if map is already being destroyed
        }
      }
    };
  }, [map, borderLayerId, fillLayerId, sourceId]);

  return null; // SpillLayer renders directly to Mapbox GL canvas & DOM markers
};

export default SpillLayer;
