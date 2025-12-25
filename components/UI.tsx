import React, { useRef } from 'react';
import { GestureType } from '../types';

interface UIProps {
  gesture: GestureType;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UI: React.FC<UIProps> = ({ gesture, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status text for the subtle indicator, now web-focused
  const getStatusText = () => {
    switch (gesture) {
      case 'FIST': return 'GATHERING JOY';
      case 'OPEN': return 'SCATTERING MAGIC';
      case 'PINCH': return 'VIEWING MEMORY';
      default: return 'AWAITING MAGIC';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8 md:p-12 font-sans selection:bg-red-500/30">
      
      {/* Top Header - Christmas Theme */}
      <div className="flex justify-between items-start mr-12"> 
        {/* Added margin-right to prevent overlap with music button */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-light text-white tracking-[0.2em] uppercase drop-shadow-lg">
            MERRY <span className="text-yellow-400 font-normal filter drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">CHRISTMAS</span>
          </h1>
          <div className="h-px w-32 bg-gradient-to-r from-red-600 via-yellow-400 to-transparent my-4"></div>
          <p className="text-xs md:text-sm text-red-200/80 tracking-widest uppercase font-medium">
            Interactive Holiday Magic &bull; 2024
          </p>
        </div>

        {/* Minimal Status Indicator */}
        <div className="hidden md:flex flex-col items-end gap-1 mt-2">
           <div className="text-[10px] text-yellow-100/50 uppercase tracking-widest">Magic Status</div>
           <div className="text-sm font-mono text-red-400 tracking-wider font-bold">
             // {getStatusText()}
           </div>
        </div>
      </div>

      {/* Bottom Interface */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        
        {/* Web Controls Guide - Red/Gold Theme */}
        <div className="bg-black/30 backdrop-blur-md border-l-2 border-red-500/50 pl-4 py-3 text-white/80 max-w-md rounded-r-lg">
          <h3 className="text-yellow-400 text-xs font-bold mb-3 uppercase tracking-widest">
            Festive Controls
          </h3>
          <ul className="space-y-2 text-xs md:text-sm font-light tracking-wide">
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              <span><strong className="text-red-100">Click & Hold</strong> to Gather Magic</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]"></span>
              <span><strong className="text-red-100">Release</strong> to Let it Snow</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
              <span><strong className="text-red-100">Mouse Move</strong> to Rotate View</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <span><strong className="text-red-100">Click Photos</strong> to Open Memories</span>
            </li>
          </ul>
        </div>

        {/* Action Button - Christmas Style */}
        <div className="pointer-events-auto flex flex-col items-end gap-3">
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*" 
            multiple
            onChange={onUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="group relative overflow-hidden bg-transparent hover:bg-red-900/20 text-white border border-red-500/30 px-8 py-4 transition-all duration-300 ease-out rounded-sm"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-600/20 to-yellow-500/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
            <span className="relative flex items-center gap-3 uppercase tracking-[0.15em] text-xs font-bold text-yellow-100">
              <span className="text-yellow-400 text-lg leading-none">+</span>
              Add Holiday Memories
            </span>
          </button>
          <div className="text-[10px] text-red-200/40 uppercase tracking-widest text-right">
            Supports local image upload
          </div>
        </div>
      </div>
    </div>
  );
};