'use client';

import React from 'react';

interface SidebarProps {
  onOpenUpload: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenUpload }) => {
  return (
    <aside className="fixed left-6 top-24 flex flex-col p-2 z-40 glass-panel shadow-[0_4px_30px_rgba(0,0,0,0.1)] w-[240px] rounded-xl hidden md:flex border border-outline-variant/30 select-none">
      <nav className="flex flex-col flex-1">
        {/* Upload Action */}
        <button
          onClick={onOpenUpload}
          data-testid="sidebar-tab-upload"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30 transition-all border border-transparent hover:border-outline-variant/20 text-left group"
        >
          <span
            className="material-symbols-outlined text-[24px] text-primary group-hover:scale-110 transition-transform"
            style={{ fontVariationSettings: '"FILL" 0' }}
          >
            add_a_photo
          </span>
          <span className="text-sm tracking-wider font-semibold text-on-surface uppercase font-mono">
            Upload
          </span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
