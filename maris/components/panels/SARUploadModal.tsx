'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Satellite, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Cpu, 
  MapPin, 
  FileImage, 
  RefreshCw, 
  Trash2 
} from 'lucide-react';
import { OilSpill } from '@/types/maris';
import { uploadSARImage, SARUploadResult } from '@/lib/api/sarUpload';

type UploadState = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

interface SARUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewSpill: (newSpill: OilSpill) => void;
}

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export const SARUploadModal: React.FC<SARUploadModalProps> = ({
  isOpen,
  onClose,
  onAddNewSpill,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<SARUploadResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs on unmount or file change
  useEffect(() => {
    return () => {
      if (filePreview && filePreview.startsWith('blob:')) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setFilePreview(null);
      setValidationError(null);
      setUploadState('idle');
      setUploadProgress(0);
      setAnalysisResult(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateFile = (file: File): boolean => {
    setValidationError(null);
    setErrorMessage(null);

    // Validate type (image or tiff)
    const isImage =
      file.type.startsWith('image/') || /\.(jpe?g|png|tiff?|webp|bmp)$/i.test(file.name);

    if (!isImage) {
      setValidationError(
        'Invalid file format. Please upload a satellite radar image (GeoTIFF, PNG, JPEG, or WebP).'
      );
      return false;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setValidationError(`File size (${sizeMB}MB) exceeds the maximum limit of 25MB.`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (!validateFile(file)) {
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
    setUploadState('idle');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setValidationError(null);
    setUploadState('idle');
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Sample quick-loader helper
  const handleLoadSampleSAR = async (sampleName: string, sampleUrl: string) => {
    try {
      setValidationError(null);
      const mockBlob = new Blob(['sample-sar-binary-data'], { type: 'image/png' });
      const mockFile = new File([mockBlob], `${sampleName}.png`, { type: 'image/png' });
      setSelectedFile(mockFile);
      setFilePreview(sampleUrl);
      setUploadState('idle');
    } catch {
      setValidationError('Failed to load sample SAR image.');
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      setValidationError('Please select or drop a SAR radar image first.');
      return;
    }

    setValidationError(null);
    setErrorMessage(null);
    setUploadState('uploading');
    setUploadProgress(15);

    // Simulate upload progress interval
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 25;
      });
    }, 200);

    try {
      // Transition from uploading to processing
      setTimeout(() => {
        setUploadState('processing');
        setUploadProgress(100);
      }, 500);

      // Call the isolated sarUpload API function
      const result = await uploadSARImage(selectedFile);
      clearInterval(progressInterval);
      setAnalysisResult(result);
      setUploadState('success');
    } catch (err: any) {
      clearInterval(progressInterval);
      setUploadState('error');
      setErrorMessage(
        err?.message ||
          'Inference failed while segmenting SAR radar backscatter. Please check your file and retry.'
      );
    }
  };

  const handlePlotOnMap = () => {
    if (!analysisResult) return;
    onAddNewSpill(analysisResult.spillPayload);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none"
      data-testid="sar-upload-modal"
    >
      <div className="w-full max-w-3xl glass-panel-heavy rounded-2xl p-6 border border-outline-variant/40 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-surface-container-high border border-primary/30 text-primary">
              <Satellite className="w-5 h-5 animate-pulse text-primary" />
            </div>
            <div>
              <h2
                className="text-base font-bold uppercase tracking-wider text-on-surface flex items-center gap-2"
                data-testid="sar-modal-title"
              >
                Synthetic Aperture Radar (SAR) AI Studio
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-container border border-primary/30 text-primary">
                  Sentinel-1 C-Band
                </span>
              </h2>
              <p className="text-xs text-on-surface-variant font-mono">
                Automated dark-patch segmentation & oil slick backscatter classification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40 rounded-lg transition-colors"
            data-testid="sar-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client-side Validation Error Banner */}
        {validationError && (
          <div
            className="mt-4 p-3 rounded-xl bg-error-container/40 border border-error/50 text-error text-xs font-mono flex items-center gap-2.5 animate-in slide-in-from-top duration-200"
            data-testid="sar-validation-error"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-error" />
            <span>{validationError}</span>
          </div>
        )}

        {/* State: ERROR Banner with Retry */}
        {uploadState === 'error' && (
          <div
            className="mt-4 p-3.5 rounded-xl bg-error-container/50 border border-error text-xs font-mono flex items-center justify-between gap-3 animate-in slide-in-from-top duration-200"
            data-testid="sar-error-banner"
          >
            <div className="flex items-center gap-2 text-error">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage || 'Failed to process SAR radar image.'}</span>
            </div>
            <button
              onClick={handleStartAnalysis}
              className="px-3 py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-container text-on-surface border border-outline-variant/40 flex items-center gap-1.5 font-bold uppercase text-[10px] transition-all shrink-0"
              data-testid="sar-retry-btn"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Upload & Drag-and-Drop Area (Visible in idle / uploading / error states or when no result yet) */}
        {uploadState !== 'success' && (
          <div className="my-4 space-y-3">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.tiff,.tif"
              onChange={handleInputChange}
              className="hidden"
              data-testid="sar-file-input"
            />

            {!selectedFile ? (
              /* Drag and Drop Zone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                data-testid="sar-dropzone"
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-primary bg-primary-container/60 scale-[0.99]'
                    : 'border-outline-variant/40 bg-surface-container-low/60 hover:bg-surface-container/70 hover:border-primary/50'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-on-surface">
                    Drag and drop your SAR satellite radar image here
                  </div>
                  <div className="text-xs text-on-surface-variant font-mono mt-1">
                    Supports GeoTIFF, PNG, JPEG, WebP (Max 25MB)
                  </div>
                </div>
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-lg bg-primary-container text-primary border border-primary/30 text-xs font-semibold uppercase font-mono hover:bg-primary hover:text-on-primary transition-all"
                >
                  Browse Local Files
                </button>
              </div>
            ) : (
              /* Selected File Card */
              <div
                className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-3"
                data-testid="sar-selected-file-card"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-primary shrink-0">
                    <FileImage className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-on-surface font-mono truncate" data-testid="sar-selected-filename">
                      {selectedFile.name}
                    </div>
                    <div className="text-[11px] text-on-surface-variant font-mono">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB •{' '}
                      {selectedFile.type || 'image/satellite'}
                    </div>
                  </div>
                </div>

                {uploadState === 'idle' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-variant text-on-surface text-xs font-mono border border-outline-variant/30 transition-all"
                      data-testid="sar-change-file-btn"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1.5 rounded-lg bg-error-container/30 hover:bg-error-container text-error border border-error/30 transition-all"
                      title="Remove File"
                      data-testid="sar-remove-file-btn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Sample Presets Loader */}
            {uploadState === 'idle' && !selectedFile && (
              <div>
                <div className="text-[11px] uppercase font-mono font-semibold text-on-surface-variant mb-1.5">
                  Or test with Indian maritime Sentinel-1 SAR acquisition passes:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleLoadSampleSAR(
                        'Sentinel-1A_Mumbai_High_Pass102',
                        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
                      )
                    }
                    className="p-2.5 rounded-lg bg-surface-container-low/70 hover:bg-surface-container border border-outline-variant/20 hover:border-primary/40 text-left transition-all"
                    data-testid="sample-sar-mumbai"
                  >
                    <div className="text-xs font-bold text-on-surface font-mono">Mumbai High Basin</div>
                    <div className="text-[10px] text-primary/80 font-mono">Pass #102 • Arabian Sea</div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleLoadSampleSAR(
                        'Sentinel-1B_Gulf_of_Khambhat_Pass044',
                        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80'
                      )
                    }
                    className="p-2.5 rounded-lg bg-surface-container-low/70 hover:bg-surface-container border border-outline-variant/20 hover:border-primary/40 text-left transition-all"
                    data-testid="sample-sar-khambhat"
                  >
                    <div className="text-xs font-bold text-on-surface font-mono">Gulf of Khambhat</div>
                    <div className="text-[10px] text-primary/80 font-mono">Pass #044 • Gujarat Coast</div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleLoadSampleSAR(
                        'RADARSAT-2_Paradip_Bay_of_Bengal',
                        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80'
                      )
                    }
                    className="p-2.5 rounded-lg bg-surface-container-low/70 hover:bg-surface-container border border-outline-variant/20 hover:border-primary/40 text-left transition-all"
                    data-testid="sample-sar-paradip"
                  >
                    <div className="text-xs font-bold text-on-surface font-mono">Paradip Offshore</div>
                    <div className="text-[10px] text-primary/80 font-mono">Pass #078 • Bay of Bengal</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* State: UPLOADING (Progress Bar) */}
        {uploadState === 'uploading' && (
          <div
            className="my-6 p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3"
            data-testid="sar-uploading-state"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-primary font-semibold flex items-center gap-2">
                <Upload className="w-4 h-4 animate-bounce" />
                Uploading SAR Radar Raster to Inference Server...
              </span>
              <span className="text-primary font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="text-[11px] text-on-surface-variant font-mono">
              Transferring C-Band polarimetric matrix (Normalized Backscatter $\sigma_0$)...
            </div>
          </div>
        )}

        {/* State: PROCESSING (Spinner + Status Labels) */}
        {uploadState === 'processing' && (
          <div
            className="my-6 p-6 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col items-center justify-center text-center gap-3"
            data-testid="sar-processing-state"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border-2 border-primary/20 animate-ping absolute" />
              <Cpu className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div>
              <div className="text-sm font-bold text-on-surface font-mono">
                Executing SAR-UNet-Marine v4 Neural Segmentation
              </div>
              <div className="text-xs text-on-surface-variant font-mono mt-1">
                Classifying surfactant damping vs lookalike biogenic wind slicks...
              </div>
            </div>
          </div>
        )}

        {/* State: SUCCESS (Results Display + Plot on Map CTA) */}
        {uploadState === 'success' && analysisResult && (
          <div
            className="my-3 space-y-4 animate-in fade-in zoom-in-95 duration-200"
            data-testid="sar-success-state"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Radar Image Preview Canvas */}
              <div className="relative rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest h-60 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#08132a] via-[#101b33] to-[#151f37] flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(#b9c7e4_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

                  {/* Radar sweep */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full border border-primary/20 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border border-primary/30 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full border border-primary/40" />
                      </div>
                    </div>
                  </div>

                  {/* Detected Slick Footprint Box */}
                  <div className="absolute inset-x-10 inset-y-10 border-2 border-dashed border-error bg-error-container/30 rounded-xl flex items-center justify-center backdrop-blur-[2px] animate-in zoom-in-90 duration-300">
                    <div className="px-2.5 py-1 rounded bg-[#08132a]/90 border border-error text-[10px] font-mono font-bold text-error flex items-center gap-1.5 shadow">
                      <span className="w-2 h-2 rounded-none bg-error" />
                      SLICK DETECTED: {analysisResult.estAreaSqKm} km²
                    </div>
                  </div>
                </div>

                {/* Radar Label */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-surface-container-lowest/90 border border-outline-variant/40 text-[10px] font-mono text-primary">
                  {analysisResult.sensorMode}
                </div>
              </div>

              {/* AI Inference Readout */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono uppercase text-primary font-bold flex items-center gap-1.5 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Segmentation Results
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-on-surface-variant block">
                        Source File
                      </span>
                      <span className="font-mono text-on-surface font-semibold truncate block">
                        {analysisResult.filename}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-on-surface-variant block">
                        Indian Maritime Location
                      </span>
                      <span className="font-mono text-on-surface">{analysisResult.location}</span>
                    </div>

                    {/* Anomaly Highlight Box */}
                    <div className="p-2.5 rounded-lg bg-error-container/30 border border-error/40 text-xs">
                      <div className="font-bold text-error flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{analysisResult.detectedAnomaly}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-error/20 text-[11px] font-mono">
                        <div>
                          Confidence: <span className="font-bold text-primary">{analysisResult.confidenceScore}%</span>
                        </div>
                        <div>
                          Est. Area: <span className="font-bold text-error">{analysisResult.estAreaSqKm} km²</span>
                        </div>
                        <div>
                          Est. Volume: <span className="font-bold text-error">{analysisResult.estVolumeBarrels} bbl</span>
                        </div>
                        <div>
                          Lookalike Risk: <span className="font-bold text-on-surface">&lt; {analysisResult.lookalikeRiskPercent}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-outline-variant/20 mt-3 flex items-center gap-2">
                  <button
                    onClick={handleRemoveFile}
                    className="py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-variant text-on-surface text-xs font-mono border border-outline-variant/30 transition-all flex items-center gap-1.5"
                    data-testid="sar-reset-btn"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    New Scan
                  </button>

                  <button
                    onClick={handlePlotOnMap}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-primary-container text-primary font-bold text-xs uppercase tracking-wider border border-primary/40 hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2 shadow-lg"
                    data-testid="sar-plot-btn"
                  >
                    <MapPin className="w-4 h-4" />
                    Plot Detected Slick on India Map
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Trigger in Idle / Error state when file is selected */}
        {selectedFile && uploadState === 'idle' && (
          <div className="pt-2">
            <button
              onClick={handleStartAnalysis}
              className="w-full py-2.5 px-4 rounded-xl bg-primary-container text-primary font-bold text-xs uppercase tracking-wider border border-primary/40 hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2 shadow-lg"
              data-testid="sar-analyze-btn"
            >
              <Cpu className="w-4 h-4" />
              Run SAR AI Slick Segmentation
            </button>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-outline-variant/20 mt-3 flex items-center justify-between text-[10px] text-on-surface-variant font-mono">
          <span>Inference Engine: SAR-UNet-Marine v4</span>
          <span className="text-primary font-semibold">Indian Coast Guard EEZ Surveillance Protocol</span>
        </div>
      </div>
    </div>
  );
};

export default SARUploadModal;
