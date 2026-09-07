'use client';

import React, { useState } from 'react';
import { OilSpill, Vessel } from '@/types/maris';
import { dispatchCoastGuard, DispatchConfirmation } from '@/lib/api/dispatch';
import { 
  X, 
  ShieldAlert, 
  Droplets, 
  Wind, 
  Waves, 
  MapPin, 
  Ship, 
  Anchor, 
  Download, 
  CheckCircle2, 
  AlertOctagon, 
  Radio,
  Send,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface IncidentModalProps {
  spill: OilSpill | null;
  vessel: Vessel | null;
  onClose: () => void;
  onUpdateSpillStatus?: (spillId: string, newStatus: OilSpill['containmentStatus']) => void;
}

type DispatchState = 'idle' | 'pending' | 'success' | 'error';

export const IncidentModal: React.FC<IncidentModalProps> = ({
  spill,
  vessel,
  onClose,
  onUpdateSpillStatus,
}) => {
  const [deployingBoom, setDeployingBoom] = useState<boolean>(false);
  const [boomDeployed, setBoomDeployed] = useState<boolean>(
    spill?.containmentStatus === 'Containment Deployed'
  );
  const [boomMessage, setBoomMessage] = useState<string | null>(null);

  // Coast Guard Dispatch Async States
  const [dispatchState, setDispatchState] = useState<DispatchState>('idle');
  const [dispatchResult, setDispatchResult] = useState<DispatchConfirmation | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  if (!spill && !vessel) return null;

  const handleDeployBoom = () => {
    if (!spill) return;
    setDeployingBoom(true);
    setTimeout(() => {
      setDeployingBoom(false);
      setBoomDeployed(true);
      if (onUpdateSpillStatus) {
        onUpdateSpillStatus(spill.id, 'Containment Deployed');
      }
      setBoomMessage('Containment boom deployment order confirmed. Telemetry updated.');
      setTimeout(() => setBoomMessage(null), 4000);
    }, 1200);
  };

  const handleDispatch = async () => {
    const targetId = spill ? spill.id : vessel?.id || 'INC-UNKNOWN';
    setDispatchState('pending');
    setDispatchError(null);

    try {
      const confirmation = await dispatchCoastGuard(targetId);
      setDispatchResult(confirmation);
      setDispatchState('success');
    } catch (err: any) {
      setDispatchState('error');
      setDispatchError(err?.message || 'Satellite link failure while transmitting tasking order. Please retry.');
    }
  };

  const handleExportGeoJSON = () => {
    const featureCollection = {
      type: 'FeatureCollection',
      features: [
        spill
          ? {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [spill.slickPolygon.map(([lat, lng]) => [lng, lat])],
              },
              properties: {
                id: spill.id,
                name: spill.name,
                locationName: spill.locationName,
                severity: spill.severity,
                estimatedVolumeBarrels: spill.estimatedVolumeBarrels,
                slickAreaSqKm: spill.slickAreaSqKm,
                detectedAt: spill.detectedAt,
                sensorSource: spill.sensorSource,
                containmentStatus: spill.containmentStatus,
                nearestPort: spill.nearestPort,
                distanceToCoastKm: spill.distanceToCoastKm,
              },
            }
          : {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [vessel!.lng, vessel!.lat],
              },
              properties: {
                id: vessel!.id,
                mmsi: vessel!.mmsi,
                name: vessel!.name,
                type: vessel!.type,
                flag: vessel!.flag,
                speedKnots: vessel!.speedKnots,
                headingDeg: vessel!.headingDeg,
                destination: vessel!.destination,
                status: vessel!.status,
              },
            },
      ],
    };

    const blob = new Blob([JSON.stringify(featureCollection, null, 2)], {
      type: 'application/geo+json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${spill ? spill.id : vessel?.id || 'incident'}_report.geojson`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none" data-testid="incident-modal">
      <div className="w-full max-w-2xl glass-panel-heavy rounded-2xl p-6 border border-outline-variant/40 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              spill
                ? spill.severity === 'critical'
                  ? 'bg-error-container/50 border-error/60 text-error'
                  : 'bg-secondary-container/50 border-secondary/60 text-secondary'
                : 'bg-primary-container border-primary/40 text-primary'
            }`}>
              {spill ? <AlertOctagon className="w-5 h-5" /> : <Ship className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider text-on-surface" data-testid="incident-modal-title">
                {spill ? spill.name : vessel?.name}
              </h2>
              <p className="text-xs text-on-surface-variant font-mono">
                {spill ? `Incident ID: ${spill.id} • Sensor: ${spill.sensorSource}` : `MMSI: ${vessel?.mmsi} • Flag: ${vessel?.flag}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40 rounded-lg transition-colors"
            data-testid="incident-modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Boom Action Success Banner */}
        {boomMessage && (
          <div className="my-3 p-3 rounded-xl bg-surface-container border border-primary/40 text-primary text-xs font-mono flex items-center gap-2 animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>{boomMessage}</span>
          </div>
        )}

        {/* Coast Guard Dispatch Success Readout */}
        {dispatchState === 'success' && dispatchResult && (
          <div className="my-3 p-3.5 rounded-xl bg-surface-container border border-primary/40 text-xs font-mono space-y-1.5 animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between font-bold text-primary">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                Coast Guard Tasking Confirmed (Dispatched)
              </span>
              <span className="px-2 py-0.5 rounded bg-primary-container text-primary border border-primary/30 text-[10px] uppercase">
                EN ROUTE
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-on-surface">
              <div>
                <span className="text-on-surface-variant block text-[10px]">ASSIGNED CUTTER</span>
                <span className="font-semibold">{dispatchResult.unit}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-[10px]">ESTIMATED ARRIVAL</span>
                <span className="font-semibold text-primary">{dispatchResult.eta}</span>
              </div>
            </div>
            <div className="text-[10px] text-on-surface-variant pt-1 border-t border-outline-variant/20">
              {dispatchResult.message}
            </div>
          </div>
        )}

        {/* Coast Guard Dispatch Error Banner */}
        {dispatchState === 'error' && (
          <div className="my-3 p-3 rounded-xl bg-error-container/40 border border-error/50 text-error text-xs font-mono flex items-center justify-between gap-3 animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-error" />
              <span>{dispatchError || 'Failed to transmit Coast Guard dispatch request.'}</span>
            </div>
            <button
              onClick={handleDispatch}
              className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-variant text-on-surface border border-outline-variant/30 font-bold uppercase text-[10px] flex items-center gap-1 shrink-0 transition-all"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        {/* Spill Inspection Content */}
        {spill && (
          <div className="space-y-4 my-3">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <span className="text-[10px] uppercase font-mono text-on-surface-variant block">Severity Level</span>
                <span className={`text-xs font-mono font-bold uppercase ${
                  spill.severity === 'critical' ? 'text-error' : 'text-secondary'
                }`}>
                  {spill.severity}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <span className="text-[10px] uppercase font-mono text-on-surface-variant block">Est. Volume</span>
                <span className="text-xs font-mono font-bold text-primary">
                  {spill.estimatedVolumeBarrels.toLocaleString()} bbls
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <span className="text-[10px] uppercase font-mono text-on-surface-variant block">Slick Surface</span>
                <span className="text-xs font-mono font-bold text-primary">
                  {spill.slickAreaSqKm} km²
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <span className="text-[10px] uppercase font-mono text-on-surface-variant block">Coast Proximity</span>
                <span className="text-xs font-mono font-bold text-on-surface">
                  {spill.distanceToCoastKm} km
                </span>
              </div>
            </div>

            {/* Geographical & Environmental Telemetry */}
            <div className="p-4 rounded-xl bg-surface-container-low/70 border border-outline-variant/30 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Coordinates:</span>
                <span className="font-bold text-primary">{spill.lat.toFixed(4)}° N, {spill.lng.toFixed(4)}° E</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Location Context:</span>
                <span className="text-on-surface text-right">{spill.locationName}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Nearest Major Port:</span>
                <span className="text-on-surface">{spill.nearestPort}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Suspected Origin:</span>
                <span className="text-error font-semibold">{spill.suspectedSource || 'Under Investigation'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Containment Status:</span>
                <span className="text-primary font-bold px-2 py-0.5 rounded bg-primary-container border border-primary/30">
                  {boomDeployed ? 'Containment Deployed' : spill.containmentStatus}
                </span>
              </div>
            </div>

            {/* Response Actions */}
            <div className="pt-2">
              <span className="text-xs font-mono uppercase text-primary font-bold block mb-2">
                Emergency Response Operations
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleDeployBoom}
                  disabled={deployingBoom || boomDeployed}
                  className="py-2.5 px-4 rounded-xl bg-primary-container text-primary font-bold text-xs uppercase tracking-wider border border-primary/40 hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deployingBoom ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deploying Booms...
                    </>
                  ) : boomDeployed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Booms Deployed
                    </>
                  ) : (
                    <>
                      <Waves className="w-4 h-4" />
                      Deploy Containment Boom
                    </>
                  )}
                </button>

                {/* Coast Guard Dispatch Button with State Feedback */}
                <button
                  onClick={handleDispatch}
                  disabled={dispatchState === 'pending' || dispatchState === 'success'}
                  className={`py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                    dispatchState === 'pending'
                      ? 'bg-surface-container text-on-surface-variant border-outline-variant/30 opacity-70 cursor-not-allowed'
                      : dispatchState === 'success'
                      ? 'bg-primary-container text-primary border-primary/40'
                      : 'bg-surface-container-high text-primary border-primary/40 hover:bg-primary hover:text-on-primary'
                  }`}
                >
                  {dispatchState === 'pending' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      Dispatching Task Force...
                    </>
                  ) : dispatchState === 'success' ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      Coast Guard Tasked
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Dispatch Coast Guard ICG
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vessel Inspection Content */}
        {vessel && (
          <div className="space-y-4 my-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <span className="text-[10px] uppercase font-mono text-on-surface-variant block">Vessel Type</span>
                <span className="text-xs font-mono font-bold text-primary">{vessel.type}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <span className="text-[10px] uppercase font-mono text-on-surface-variant block">Speed</span>
                <span className="text-xs font-mono font-bold text-primary">{vessel.speedKnots} kts</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <span className="text-[10px] uppercase font-mono text-on-surface-variant block">Heading</span>
                <span className="text-xs font-mono font-bold text-primary">{vessel.headingDeg}°</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <span className="text-[10px] uppercase font-mono text-on-surface-variant block">Draft Depth</span>
                <span className="text-xs font-mono font-bold text-on-surface">{vessel.draftMeters} m</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low/70 border border-outline-variant/30 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Live Coordinates:</span>
                <span className="font-bold text-primary">{vessel.lat.toFixed(4)}° N, {vessel.lng.toFixed(4)}° E</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Destination Port:</span>
                <span className="text-on-surface">{vessel.destination} (ETA: {vessel.eta})</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Current Status:</span>
                <span className="text-primary font-semibold">{vessel.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Illicit Discharge Risk:</span>
                <span className={`font-bold px-2 py-0.5 rounded ${
                  vessel.isSuspicious ? 'bg-error-container text-error border border-error/40' : 'text-on-surface'
                }`}>
                  {vessel.isSuspicious ? `HIGH RISK (Score: ${vessel.riskScore}/100)` : 'LOW RISK (Nominal)'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleDispatch}
                disabled={dispatchState === 'pending' || dispatchState === 'success'}
                className="w-full py-2.5 px-4 rounded-xl bg-primary-container text-primary font-bold text-xs uppercase tracking-wider border border-primary/40 hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {dispatchState === 'pending' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    Interrogating Transponder...
                  </>
                ) : dispatchState === 'success' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    AIS Inspection Unit Tasked
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4" />
                    Interrogate AIS Transponder & Dispatch Inspection
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-[10px] text-on-surface-variant font-mono">
          <span>MARIS Incident Response Unit (Indian Coast Guard EEZ)</span>
          <button
            onClick={handleExportGeoJSON}
            data-testid="export-geojson-btn"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container hover:bg-surface-variant text-primary border border-outline-variant/30 hover:border-primary/40 transition-all font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            Export GeoJSON Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentModal;
