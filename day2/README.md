# SpillLayer & SpillPanel - Maritime Intelligence Components

A suite of production-ready React components for Mapbox GL JS and Next.js / Vite dashboards:
1. **`SpillLayer`**: Renders GeoJSON oil spill boundary polygons as semi-transparent red fills with solid red borders, dynamic multi-tier pulsing beacon at the geometric centroid, and interactive popups.
2. **`SpillPanel`**: A sidebar component built with **shadcn/ui Card components** and a neutral **Light + Dark theme**, displaying detection status badge, area ($\text{km}^2$), perimeter ($\text{km}$), confidence progress bar, centroid coordinates with one-click copy, detection timestamp, shape metrics (compactness quotient $Q$, aspect ratio, bounding footprint, complexity index), and telemetry.

---

## 📸 Component Showcase

```
+-----------------------------------------------------------------------------------+
|  MAPBOX GL MAP                                    |  SPILLPANEL SIDEBAR (SHADCN)  |
|                                                   |                               |
|   (Semi-transparent red polygon)                  |  [🔴 ACTIVE SPILL DETECTED]   |
|   +--------------------------+                    |  Crude Oil Slick (Sector 4-B) |
|   |                          |                    |                               |
|   |         🔴 (Centroid)    |                    |  +-------------------------+  |
|   |       Pulsing Beacon     |                    |  | AREA: 14.85 km²         |  |
|   |                          |                    |  | PERIMETER: 18.42 km     |  |
|   +--------------------------+                    |  +-------------------------+  |
|                                                   |  | CONFIDENCE: 94.0% [====]|  |
|                                                   |  +-------------------------+  |
|                                                   |  | CENTROID: 18.65°N, 72.3°E |
|                                                   |  | (Copy / Focus on Map)   |  |
|                                                   |  +-------------------------+  |
|                                                   |  | SHAPE METRICS:          |  |
|                                                   |  | Compactness Q = 0.42    |  |
|                                                   |  | Aspect Ratio: 2.15 : 1  |  |
|                                                   |  +-------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 📦 Installation & Setup

```bash
npm install mapbox-gl lucide-react clsx tailwind-merge class-variance-authority
```

---

## ⚡ Quick Usage Example

```tsx
import React, { useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { SpillLayer, SpillPanel, MOCK_PRIMARY_SPILL, SpillFeature } from './src';

export function MaritimeDashboard() {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<SpillFeature>(MOCK_PRIMARY_SPILL);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  useEffect(() => {
    if (!mapDivRef.current) return;
    mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

    const mapInstance = new mapboxgl.Map({
      container: mapDivRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [72.32, 18.65],
      zoom: 9
    });

    mapInstance.on('load', () => setMap(mapInstance));
    return () => mapInstance.remove();
  }, []);

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      {/* Map View */}
      <div className="flex-1 relative">
        <div ref={mapDivRef} className="w-full h-full" />
        
        {map && (
          <SpillLayer
            map={map}
            data={selectedFeature}
            onSpillClick={(e, feature) => {
              setSelectedFeature(feature);
              setIsPanelOpen(true);
            }}
          />
        )}
      </div>

      {/* Sidebar Panel */}
      {isPanelOpen && (
        <SpillPanel
          feature={selectedFeature}
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          onFocusOnMap={(centroid) => map?.flyTo({ center: centroid, zoom: 10 })}
          theme="dark"
        />
      )}
    </div>
  );
}
```

---

## 📋 SpillPanel Props Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `feature` | `SpillFeature \| null` | `null` | The active GeoJSON spill feature to display. |
| `data` | `SpillGeoJSONInput \| null` | `null` | Optional GeoJSON input to automatically extract feature from. |
| `isOpen` | `boolean` | `true` | Whether the panel is visible/docked. |
| `onClose` | `() => void` | `undefined` | Callback fired on close button click. |
| `onFocusOnMap` | `(centroid: [number, number], zoom?: number) => void` | `undefined` | Callback to center the map on the spill centroid. |
| `onDispatchAlert` | `(feature: SpillFeature) => void` | `undefined` | Callback to trigger maritime alert broadcast. |
| `onExportGeoJson` | `(feature: SpillFeature) => void` | `undefined` | Callback to export/copy GeoJSON boundary. |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Neutral theme appearance (inherits `.dark` or can be toggled). |
| `onToggleTheme` | `() => void` | `undefined` | Callback for switching themes. |

---

## 🧮 Calculated Shape Metrics

1. **Perimeter ($P$)**:
   Geodesic great-circle Haversine formula summed across all boundary rings.
2. **Compactness / Isoperimetric Quotient ($Q$)**:
   $$Q = \frac{4\pi \cdot \text{Area}}{\text{Perimeter}^2}$$
   - $Q \approx 1.0$: Circular slick.
   - $0.4 \le Q < 0.65$: Moderately dispersed slick.
   - $Q < 0.4$: Elongated linear trail (typical of moving vessel discharge).
3. **Aspect Ratio**:
   Ratio of major axis length to minor axis length of geographic bounding box.
4. **Complexity Score**:
   Boundary roughness index computed as $\frac{P}{2\sqrt{\pi A}}$.

---

## 🎨 Theme Support

`SpillPanel` uses **neutral zinc/slate tones** compatible with `shadcn/ui`. It automatically applies `dark:` variants:
- **Light Theme**: `bg-zinc-50`, `bg-white`, `border-zinc-200`, `text-zinc-900`, `text-zinc-500`.
- **Dark Theme**: `bg-zinc-950`, `bg-zinc-900`, `border-zinc-800`, `text-zinc-50`, `text-zinc-400`.

---

## License

MIT © Bhoomi Gosavi
