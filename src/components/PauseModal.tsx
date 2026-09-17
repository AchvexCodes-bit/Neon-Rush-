import React from 'react';
import {
  Play,
  RotateCcw,
  Settings as SettingsIcon,
  Home,
} from 'lucide-react';
import { sound } from '../services/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onQuit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenSettings,
  onQuit,
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-40 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-wider mb-6">
          GAME PAUSED
        </h2>

        <div className="w-full space-y-3">
          <button
            onClick={() => {
              sound.playButtonClick();
              onResume();
            }}
            className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm uppercase flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume</span>
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              onRestart();
            }}
            className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center space-x-2 border border-slate-700 active:scale-95 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Run</span>
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              onOpenSettings();
            }}
            className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center space-x-2 border border-slate-700 active:scale-95 transition"
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              onQuit();
            }}
            className="w-full py-3.5 rounded-2xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 font-bold text-sm flex items-center justify-center space-x-2 border border-rose-800/50 active:scale-95 transition"
          >
            <Home className="w-4 h-4" />
            <span>Quit to Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
