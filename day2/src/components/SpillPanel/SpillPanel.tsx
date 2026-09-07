import React, { useState, useMemo, useCallback } from 'react';
import { 
  AlertTriangle, 
  Compass, 
  Clock, 
  Ruler, 
  Maximize2, 
  Activity, 
  Layers, 
  Ship, 
  Copy, 
  Check, 
  Sun, 
  Moon, 
  X, 
  Share2, 
  Crosshair, 
  Waves, 
  ShieldAlert,
  Info,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { SpillPanelProps, SpillFeature, SpillFeatureProperties } from '../../types/spill';
import { 
  normalizeSpillGeoJSON, 
  calculatePolygonCentroid, 
  calculatePolygonAreaKm2, 
  calculatePolygonPerimeterKm, 
  calculateShapeMetrics, 
  formatArea, 
  formatPerimeter, 
  formatConfidence, 
  formatDetectionTime, 
  formatCoordinates,
  resolveDetectionStatus
} from '../../utils/geoUtils';
import { cn } from '../../lib/utils';
import './SpillPanel.css';

export const SpillPanel: React.FC<SpillPanelProps> = ({
  feature,
  data,
  isOpen = true,
  onClose,
  onFocusOnMap,
  onDispatchAlert,
  onExportGeoJson,
  className,
  theme: controlledTheme,
  onToggleTheme
}) => {
  // Local theme state if not externally controlled
  const [internalTheme, setInternalTheme] = useState<'light' | 'dark'>('dark');
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);
  const [copiedGeoJson, setCopiedGeoJson] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'shape' | 'telemetry'>('overview');

  const currentTheme = controlledTheme && controlledTheme !== 'auto' ? controlledTheme : internalTheme;

  const toggleTheme = () => {
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      setInternalTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    }
  };

  // Resolve active feature
  const activeFeature: SpillFeature | null = useMemo(() => {
    if (feature) return feature;
    if (data) {
      const collection = normalizeSpillGeoJSON(data);
      return collection.features[0] || null;
    }
    return null;
  }, [feature, data]);

  // Extract properties & calculations
  const properties: SpillFeatureProperties = activeFeature?.properties || {};
  const geometry = activeFeature?.geometry;

  // 1. Centroid calculation
  const centroid = useMemo(() => {
    return calculatePolygonCentroid(geometry);
  }, [geometry]);

  // 2. Area calculation (use property if valid, else calculate geodesic area)
  const areaKm2 = useMemo(() => {
    if (typeof properties.area === 'number' && properties.area > 0) {
      return properties.area;
    }
    return calculatePolygonAreaKm2(geometry);
  }, [properties.area, geometry]);

  // 3. Perimeter calculation (use property if valid, else calculate geodesic perimeter)
  const perimeterKm = useMemo(() => {
    if (typeof properties.perimeter === 'number' && properties.perimeter > 0) {
      return properties.perimeter;
    }
    return calculatePolygonPerimeterKm(geometry);
  }, [properties.perimeter, geometry]);

  // 4. Shape metrics
  const shapeMetrics = useMemo(() => {
    return calculateShapeMetrics(geometry, areaKm2, perimeterKm);
  }, [geometry, areaKm2, perimeterKm]);

  // Formatted data values
  const areaInfo = formatArea(areaKm2);
  const perimeterInfo = formatPerimeter(perimeterKm);
  const confInfo = formatConfidence(properties.confidence);
  const timeInfo = formatDetectionTime(properties.detectionTime || properties.detectedAt);
  const coordInfo = formatCoordinates(centroid);
  const statusInfo = resolveDetectionStatus(properties.status, properties.severity);

  // Copy coordinates handler
  const handleCopyCoordinates = useCallback(() => {
    const textToCopy = `${coordInfo.decimal} (${coordInfo.formatted})`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    }
  }, [coordInfo]);

  // Copy/Export GeoJSON handler
  const handleCopyGeoJson = useCallback(() => {
    if (!activeFeature) return;
    const jsonString = JSON.stringify(activeFeature, null, 2);
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(jsonString);
      setCopiedGeoJson(true);
      setTimeout(() => setCopiedGeoJson(false), 2000);
    }
    if (onExportGeoJson) {
      onExportGeoJson(activeFeature);
    }
  }, [activeFeature, onExportGeoJson]);

  // Focus map handler
  const handleFocus = useCallback(() => {
    if (onFocusOnMap && centroid) {
      onFocusOnMap(centroid, 10);
    }
  }, [onFocusOnMap, centroid]);

  if (!isOpen) return null;

  return (
    <aside
      className={cn(
        currentTheme === 'dark' ? 'dark' : '',
        'spill-panel-container z-30 flex flex-col w-full max-w-sm sm:max-w-md h-full select-none overflow-hidden transition-all duration-300',
        className
      )}
      aria-label="Oil Spill Intelligence Panel"
    >
      <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl backdrop-blur-md">
        
        {/* ==================================================================
            PANEL HEADER
            ================================================================== */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Oil Spill Intelligence
                </h2>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  SAR
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                {properties.id || 'INCIDENT #OS-ACTIVE'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* Light / Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              onClick={toggleTheme}
              title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {currentTheme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </Button>

            {/* Close Button */}
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                onClick={onClose}
                title="Close Sidebar Panel"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* ==================================================================
            NAVIGATION TABS (Overview / Shape Metrics / Telemetry)
            ================================================================== */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/70 dark:bg-zinc-900/50 p-1 space-x-1 text-xs">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'shape', label: 'Shape Metrics', icon: Ruler },
            { id: 'telemetry', label: 'Telemetry', icon: Ship }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-md font-medium text-xs transition-all',
                  isActive 
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm font-semibold' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ==================================================================
            SCROLLABLE CONTENT BODY
            ================================================================== */}
        <div className="flex-1 overflow-y-auto spill-panel-scroll p-4 space-y-4">
          
          {/* 1. Detection Status Badge & Incident Title Card */}
          <Card className="border-rose-200 dark:border-rose-950/60 bg-gradient-to-br from-rose-50/50 to-white dark:from-rose-950/20 dark:to-zinc-900 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <Badge variant={statusInfo.variant} className="gap-1.5 text-[11px] font-semibold py-0.5">
                  <span 
                    className="w-2 h-2 rounded-full spill-badge-pulse-dot" 
                    style={{ backgroundColor: statusInfo.dotColor }} 
                  />
                  {statusInfo.label}
                </Badge>

                {properties.severity && (
                  <span className="text-[10px] font-mono uppercase font-bold text-rose-600 dark:text-rose-400">
                    SEV: {properties.severity}
                  </span>
                )}
              </div>

              <CardTitle className="text-base font-bold mt-2 text-zinc-900 dark:text-zinc-50">
                {properties.name || 'Offshore Hydrocarbon Slick'}
              </CardTitle>

              <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400">
                {properties.description || statusInfo.description}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {/* Primary Dual Metrics: Area & Perimeter */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* Area Card */}
                <Card className="hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                  <CardHeader className="p-3 pb-1">
                    <CardDescription className="flex items-center space-x-1 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      <Maximize2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Spill Area</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-50 tracking-tight">
                      {areaInfo.formatted}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center justify-between">
                      <span>{areaInfo.acres}</span>
                      <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">{areaInfo.ha}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Perimeter Card */}
                <Card className="hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                  <CardHeader className="p-3 pb-1">
                    <CardDescription className="flex items-center space-x-1 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      <Ruler className="w-3.5 h-3.5 text-sky-500" />
                      <span>Perimeter</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-50 tracking-tight">
                      {perimeterInfo.formatted}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center justify-between">
                      <span>{perimeterInfo.nm}</span>
                      <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">Boundary</span>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Confidence Progress Bar Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Sensor Confidence
                      </CardTitle>
                    </div>
                    <span 
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded-full border"
                      style={{ 
                        color: confInfo.color,
                        borderColor: `${confInfo.color}40`,
                        backgroundColor: `${confInfo.color}15`
                      }}
                    >
                      {confInfo.percent}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Progress 
                    value={confInfo.value} 
                    className="h-2.5 bg-zinc-100 dark:bg-zinc-800"
                    indicatorClassName={cn(
                      confInfo.value >= 80 ? 'bg-rose-500 dark:bg-rose-400' :
                      confInfo.value >= 50 ? 'bg-amber-500 dark:bg-amber-400' :
                      'bg-sky-500 dark:bg-sky-400'
                    )}
                  />
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-0.5">
                    <span>{confInfo.description}</span>
                    <span className="font-mono">{confInfo.tier} Tier</span>
                  </div>
                </CardContent>
              </Card>

              {/* Centroid Coordinates Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Crosshair className="w-4 h-4 text-sky-500" />
                      <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Centroid Coordinates
                      </CardTitle>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-[10px] gap-1 border-zinc-200 dark:border-zinc-800"
                      onClick={handleCopyCoordinates}
                    >
                      {copiedCoords ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-zinc-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 font-mono flex flex-col space-y-1">
                    <div className="flex justify-between items-center text-zinc-800 dark:text-zinc-200">
                      <span className="text-[10px] text-zinc-500 uppercase">Latitude:</span>
                      <span className="font-semibold">{coordInfo.latDms}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-800 dark:text-zinc-200">
                      <span className="text-[10px] text-zinc-500 uppercase">Longitude:</span>
                      <span className="font-semibold">{coordInfo.lonDms}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 px-0.5">
                    <span>Decimal (WGS84):</span>
                    <span className="font-mono">{coordInfo.decimal}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Detection Time Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Detection Timestamp
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">UTC Time:</span>
                    <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                      {timeInfo.formattedUtc}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Age:</span>
                    <span className="font-medium text-sky-600 dark:text-sky-400">
                      {timeInfo.relative}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* TAB 2: SHAPE METRICS */}
          {activeTab === 'shape' && (
            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Ruler className="w-4 h-4 text-indigo-500" />
                      <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Morphology & Compactness
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      Q = {shapeMetrics.compactness}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Isoperimetric quotient and geometric compactness rating
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  
                  {/* Compactness Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span>Pattern Classification:</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        {shapeMetrics.compactnessLabel}
                      </span>
                    </div>
                    <Progress 
                      value={shapeMetrics.compactness * 100} 
                      className="h-2 bg-zinc-100 dark:bg-zinc-800"
                      indicatorClassName="bg-indigo-500 dark:bg-indigo-400"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                      <span>0.0 (Linear / Trail)</span>
                      <span>1.0 (Circular)</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Metrics Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                      <span className="text-zinc-500 dark:text-zinc-400">Aspect Ratio (L:W):</span>
                      <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                        {shapeMetrics.aspectRatio} : 1
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                      <span className="text-zinc-500 dark:text-zinc-400">Footprint Extent:</span>
                      <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                        {shapeMetrics.dimensionsKm.lengthKm} km × {shapeMetrics.dimensionsKm.widthKm} km
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                      <span className="text-zinc-500 dark:text-zinc-400">Boundary Complexity:</span>
                      <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                        {shapeMetrics.complexityScore} (Index)
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-zinc-500 dark:text-zinc-400">Boundary Vertices:</span>
                      <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                        {shapeMetrics.verticesCount} nodes
                      </span>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Bounding Box Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Geographic Bounding Box
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs font-mono space-y-1 text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>West / Min Lon:</span>
                    <span className="text-zinc-900 dark:text-zinc-100">{shapeMetrics.boundingBox[0].toFixed(4)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span>South / Min Lat:</span>
                    <span className="text-zinc-900 dark:text-zinc-100">{shapeMetrics.boundingBox[1].toFixed(4)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span>East / Max Lon:</span>
                    <span className="text-zinc-900 dark:text-zinc-100">{shapeMetrics.boundingBox[2].toFixed(4)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span>North / Max Lat:</span>
                    <span className="text-zinc-900 dark:text-zinc-100">{shapeMetrics.boundingBox[3].toFixed(4)}°</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 3: TELEMETRY & SOURCE */}
          {activeTab === 'telemetry' && (
            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-1.5">
                    <Ship className="w-4 h-4 text-sky-500" />
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Source & Sensor Telemetry
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs">
                  
                  <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-500 dark:text-zinc-400">Sensor Platform:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {properties.sensorType || 'Sentinel-1 C-SAR'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-500 dark:text-zinc-400">Suspected Source:</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {properties.sourceVessel || 'Unknown Vessel / Anomaly'}
                    </span>
                  </div>

                  {properties.sourceVesselMmsi && (
                    <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                      <span className="text-zinc-500 dark:text-zinc-400">Source MMSI:</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200">
                        {properties.sourceVesselMmsi}
                      </span>
                    </div>
                  )}

                  {properties.thicknessMm && (
                    <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                      <span className="text-zinc-500 dark:text-zinc-400">Est. Thickness:</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200">
                        {properties.thicknessMm} mm
                      </span>
                    </div>
                  )}

                  {properties.estimatedVolumeM3 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-zinc-500 dark:text-zinc-400">Est. Volume:</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200">
                        {properties.estimatedVolumeM3.toLocaleString()} m³
                      </span>
                    </div>
                  )}

                </CardContent>
              </Card>

              {/* Weather & Ocean State */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-1.5">
                    <Waves className="w-4 h-4 text-cyan-500" />
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Dispersion Environment
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Current Drift:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">1.2 kts @ 135° SE</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Sea Surface Temp:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">28.4°C</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Weathering Phase:</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">Emulsion / Sheen</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>

        {/* ==================================================================
            PANEL FOOTER ACTIONS
            ================================================================== */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-xs font-medium border-zinc-300 dark:border-zinc-700"
              onClick={handleFocus}
            >
              <Crosshair className="w-3.5 h-3.5 text-sky-500" />
              Focus on Map
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-xs font-medium border-zinc-300 dark:border-zinc-700"
              onClick={handleCopyGeoJson}
            >
              {copiedGeoJson ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-zinc-500" />
                  <span>GeoJSON</span>
                </>
              )}
            </Button>
          </div>

          <Button
            variant="destructive"
            size="sm"
            className="w-full gap-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 text-white shadow"
            onClick={() => activeFeature && onDispatchAlert && onDispatchAlert(activeFeature)}
          >
            <AlertTriangle className="w-4 h-4" />
            Dispatch Containment Alert
          </Button>
        </div>

      </div>
    </aside>
  );
};

export default SpillPanel;
