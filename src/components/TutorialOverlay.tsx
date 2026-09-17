import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Zap,
  Play,
} from 'lucide-react';
import { sound } from '../services/audio';

interface TutorialOverlayProps {
  onClose: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-50 bg-slate-950/90 backdrop-blur-md select-none animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-3">
          <Zap className="w-6 h-6" />
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight">
          HOW TO RUN & SURVIVE
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-5">
          Mobile touch gestures & keyboard shortcuts
        </p>

        {/* CONTROLS GUIDE TILES */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-center">
            <div className="flex space-x-1 text-cyan-400 mb-2">
              <ArrowLeft className="w-5 h-5" />
              <ArrowRight className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-white">SWIPE LEFT / RIGHT</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Switch between 3 lanes (A / D)</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-center">
            <ArrowUp className="w-6 h-6 text-rose-400 mb-2" />
            <span className="text-xs font-black text-white">SWIPE UP</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Jump over low barriers (Space / W)</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-center">
            <ArrowDown className="w-6 h-6 text-amber-400 mb-2" />
            <span className="text-xs font-black text-white">SWIPE DOWN</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Slide under laser barriers (S / Down)</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-amber-400/20 border border-amber-400 text-amber-300 text-xs font-black flex items-center justify-center mb-2">
              🪙
            </div>
            <span className="text-xs font-black text-white">CHAIN COINS</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Build up your combo multiplier!</span>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playButtonClick();
            onClose();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-base uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-95 transition"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>READY TO RUN</span>
        </button>
      </div>
    </div>
  );
};
