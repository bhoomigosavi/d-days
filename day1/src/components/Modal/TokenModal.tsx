"use client";

import React, { useState, useEffect } from 'react';
import { Key, X, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentToken: string;
  onSaveToken: (token: string) => void;
}

export const TokenModal: React.FC<TokenModalProps> = ({
  isOpen,
  onClose,
  currentToken,
  onSaveToken,
}) => {
  const [tokenInput, setTokenInput] = useState(currentToken);
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    setTokenInput(currentToken);
  }, [currentToken, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveToken(tokenInput.trim());
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setTokenInput('');
    onSaveToken('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm select-none p-4">
      <div className="w-full max-w-md bg-slate-950 border border-slate-700/80 rounded-xl shadow-2xl p-5 text-slate-100 space-y-4 font-sans">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-sm tracking-wide">Mapbox Access Token</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Enter your public Mapbox token (<code className="text-sky-300 font-mono">pk.eyJ...</code>) to enable high-resolution Mapbox Vector & Satellite GL vector styles.
          </p>

          <div className="p-2.5 rounded bg-sky-950/30 border border-sky-500/30 flex items-start space-x-2 text-[11px] text-sky-200">
            <AlertCircle className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Even without a token, the dashboard seamlessly renders using high-contrast satellite raster imagery and complete tactical vector layers out-of-the-box.
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
              MAPBOX PUBLIC TOKEN:
            </label>
            <input
              type="text"
              placeholder="pk.eyJ1..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded font-mono text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <a 
              href="https://account.mapbox.com/access-tokens/" 
              target="_blank" 
              rel="noreferrer"
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1 underline"
            >
              <span>Get a free Mapbox token</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {currentToken && (
              <button
                onClick={handleClear}
                className="text-rose-400 hover:text-rose-300 underline"
              >
                Clear Token
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all shadow-lg flex items-center space-x-1.5"
          >
            {savedStatus ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save & Reload Map</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
