'use client';

import React, { useState } from 'react';

interface HeaderProps {
  onOpenSettings?: () => void;
  onOpenLanguage?: () => void;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenLanguage,
  onOpenProfile,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 glass-panel hidden md:flex border-b-0 shadow-[0_4px_30px_rgba(0,0,0,0.1)] select-none">
      {/* Brand Title matching Stitch template */}
      <div className="flex items-center gap-4">
        <div className="text-[24px] tracking-wider font-bold text-on-surface mr-8 uppercase flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: '"FILL" 0' }}>
            satellite_alt
          </span>
          MARIS
        </div>
      </div>

      {/* Trailing Action Icons matching Stitch template */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="p-2 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg hover:bg-surface-variant/30 border border-transparent hover:border-outline-variant/30 flex items-center justify-center"
            title="Language / Maritime EEZ"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: '"FILL" 0' }}>
              language
            </span>
          </button>
          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl glass-panel-heavy p-2.5 shadow-2xl border border-outline-variant/40 z-50 text-xs font-mono">
              <div className="px-2 py-1 font-bold text-primary border-b border-outline-variant/30 mb-1">
                ZONE: INDIAN EEZ
              </div>
              <div className="px-2 py-1 text-on-surface hover:bg-surface-container rounded cursor-pointer">
                English (Maritime UTC/IST)
              </div>
              <div className="px-2 py-1 text-on-surface-variant hover:bg-surface-container rounded cursor-pointer">
                Hindi (भारतीय जलक्षेत्र)
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onOpenSettings || (() => alert('MARIS Settings: Sentinel-1 SAR Calibration Active | AIS Receiver: Online'))}
          className="p-2 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg hover:bg-surface-variant/30 border border-transparent hover:border-outline-variant/30 flex items-center justify-center"
          title="Settings"
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: '"FILL" 0' }}>
            settings
          </span>
        </button>

        <button
          onClick={onOpenProfile || (() => alert('MARIS Command: Indian Coast Guard HQ Surveillance Station'))}
          className="p-2 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg hover:bg-surface-variant/30 border border-transparent hover:border-outline-variant/30 flex items-center justify-center"
          title="Account Profile"
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: '"FILL" 0' }}>
            account_circle
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
