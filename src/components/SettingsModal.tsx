import React from 'react';
import {
  X,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Smartphone,
  Sparkles,
  Camera,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { PlayerSettings } from '../types';
import { sound } from '../services/audio';

interface SettingsModalProps {
  settings: PlayerSettings;
  onUpdateSettings: (newSettings: Partial<PlayerSettings>) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 z-40 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                SETTINGS
              </h2>
              <p className="text-xs text-slate-400">
                Audio, haptics, camera & graphics preferences
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playButtonClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SETTINGS FORM */}
        <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-4">
          {/* AUDIO CONTROLS */}
          <div className="bg-slate-850/60 border border-slate-800 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-black text-cyan-400 tracking-wider uppercase">
              Audio Mix
            </h3>

            {/* MUSIC VOLUME */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-1.5">
                <span className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-purple-400" />
                  <span>Synthwave Music</span>
                </span>
                <span>{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings({ musicVolume: val });
                  sound.setVolumes(settings.sfxVolume, val);
                }}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* SFX VOLUME */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-1.5">
                <span className="flex items-center space-x-2">
                  {settings.sfxVolume > 0 ? (
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500" />
                  )}
                  <span>Sound Effects</span>
                </span>
                <span>{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings({ sfxVolume: val });
                  sound.setVolumes(val, settings.musicVolume);
                  sound.playButtonClick();
                }}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* GAMEPLAY & VISUALS */}
          <div className="bg-slate-850/60 border border-slate-800 rounded-2xl p-4 space-y-3.5">
            <h3 className="text-xs font-black text-cyan-400 tracking-wider uppercase">
              Feedback & Visuals
            </h3>

            {/* HAPTICS TOGGLE */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-xs font-bold text-white block">Device Haptics</span>
                  <span className="text-[11px] text-slate-400">Vibration feedback on swipe/coin/near miss</span>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playButtonClick();
                  onUpdateSettings({ haptics: !settings.haptics });
                }}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.haptics ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.haptics ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* CAMERA SHAKE TOGGLE */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="flex items-center space-x-2.5">
                <Camera className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="text-xs font-bold text-white block">Camera Shake</span>
                  <span className="text-[11px] text-slate-400">Tactile impact and near miss camera recoil</span>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playButtonClick();
                  onUpdateSettings({ cameraShake: !settings.cameraShake });
                }}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.cameraShake ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.cameraShake ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* GRAPHICS QUALITY */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center space-x-2 text-xs font-bold text-white mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Graphics Rendering</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      sound.playButtonClick();
                      onUpdateSettings({ graphicsQuality: q });
                    }}
                    className={`py-2 rounded-xl text-xs font-bold capitalize transition ${
                      settings.graphicsQuality === q
                        ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DANGER ZONE: RESET PROGRESS */}
          <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-rose-400 block">Reset All Game Data</span>
              <span className="text-[10px] text-slate-400">Clear high score, unlocked heroes, and upgrades</span>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                  onResetProgress();
                }
              }}
              className="px-3 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs transition border border-rose-500/40"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
