import React from 'react';
import {
  Coins,
  Pause,
  Shield,
  Magnet,
  Zap,
  Flame,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { ActivePowerUpState } from '../game/GameEngine';

interface HUDProps {
  score: number;
  coins: number;
  distance: number;
  combo: number;
  speed: number;
  activePowerUps: ActivePowerUpState[];
  nearMissText: string | null;
  onPause: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onJump: () => void;
  onSlide: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  coins,
  distance,
  combo,
  speed,
  activePowerUps,
  nearMissText,
  onPause,
  onMoveLeft,
  onMoveRight,
  onJump,
  onSlide,
}) => {
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters} m`;
  };

  const getPowerUpIcon = (type: string) => {
    switch (type) {
      case 'SHIELD':
        return <Shield className="w-5 h-5 text-cyan-400 animate-pulse" />;
      case 'MAGNET':
        return <Magnet className="w-5 h-5 text-rose-400 animate-bounce" />;
      case 'SPEED_BOOST':
        return <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />;
      case 'DOUBLE_COINS':
        return <Coins className="w-5 h-5 text-amber-400 animate-spin" />;
      case 'SCORE_MULTIPLIER':
        return <Flame className="w-5 h-5 text-purple-400 animate-pulse" />;
      default:
        return <Zap className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getPowerUpLabel = (type: string) => {
    switch (type) {
      case 'SHIELD':
        return 'SHIELD';
      case 'MAGNET':
        return 'MAGNET';
      case 'SPEED_BOOST':
        return 'TURBO';
      case 'DOUBLE_COINS':
        return '2X COINS';
      case 'SCORE_MULTIPLIER':
        return '2X SCORE';
      default:
        return type;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 select-none z-20">
      {/* TOP STATUS BAR */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
        {/* SCORE & DISTANCE */}
        <div className="flex flex-col">
          <div className="flex items-baseline space-x-2">
            <span className="text-xs font-semibold tracking-wider text-cyan-400/80 uppercase">Score</span>
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
              {score.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center space-x-2 mt-0.5">
            <span className="text-xs font-medium text-purple-400">Distance</span>
            <span className="text-sm font-bold text-slate-200">
              {formatDistance(distance)}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-slate-400">
              {speed} m/s
            </span>
          </div>
        </div>

        {/* ACTIVE COMBO METER */}
        {combo > 1 && (
          <div className="flex flex-col items-center justify-center animate-bounce">
            <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-black text-amber-300 tracking-wider">
                x{combo} COMBO
              </span>
            </div>
          </div>
        )}

        {/* COIN COUNTER & PAUSE BUTTON */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.2)]">
            <Coins className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="text-lg font-black text-amber-300">
              {coins.toLocaleString()}
            </span>
          </div>

          <button
            onClick={onPause}
            className="pointer-events-auto p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 hover:text-cyan-400 text-slate-200 transition active:scale-95 shadow-lg"
            title="Pause Game"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* NEAR MISS NOTIFICATION BANNER */}
      {nearMissText && (
        <div className="self-center -mt-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 border border-rose-300 text-white font-black tracking-widest text-base shadow-[0_0_20px_rgba(244,63,94,0.8)]">
            ⚡ {nearMissText} ⚡
          </div>
        </div>
      )}

      {/* ACTIVE POWER-UPS LIST */}
      <div className="flex flex-col space-y-2 max-w-xs self-start mt-2">
        {activePowerUps.map((p) => {
          const percent = (p.remainingTime / p.totalDuration) * 100;
          return (
            <div
              key={p.type}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/85 border border-slate-700 shadow-md backdrop-blur-sm"
            >
              {getPowerUpIcon(p.type)}
              <div className="flex flex-col flex-1 min-w-[100px]">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-300 mb-0.5">
                  <span>{getPowerUpLabel(p.type)}</span>
                  <span>{Math.ceil(p.remainingTime)}s</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 transition-all duration-100"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* OPTIONAL ON-SCREEN VIRTUAL TOUCH CONTROLS (Accessible mobile buttons) */}
      <div className="pointer-events-auto flex items-end justify-between w-full max-w-md mx-auto pb-2">
        <div className="flex space-x-3">
          <button
            onClick={onMoveLeft}
            className="w-14 h-14 rounded-2xl bg-slate-900/75 border border-cyan-500/40 text-cyan-400 flex items-center justify-center active:scale-90 active:bg-cyan-500/30 backdrop-blur-md shadow-lg"
            title="Move Left"
          >
            <ArrowLeft className="w-7 h-7" />
          </button>
          <button
            onClick={onMoveRight}
            className="w-14 h-14 rounded-2xl bg-slate-900/75 border border-cyan-500/40 text-cyan-400 flex items-center justify-center active:scale-90 active:bg-cyan-500/30 backdrop-blur-md shadow-lg"
            title="Move Right"
          >
            <ArrowRight className="w-7 h-7" />
          </button>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onSlide}
            className="w-14 h-14 rounded-2xl bg-slate-900/75 border border-amber-500/40 text-amber-400 flex items-center justify-center active:scale-90 active:bg-amber-500/30 backdrop-blur-md shadow-lg"
            title="Slide"
          >
            <ArrowDown className="w-7 h-7" />
          </button>
          <button
            onClick={onJump}
            className="w-14 h-14 rounded-2xl bg-slate-900/75 border border-rose-500/40 text-rose-400 flex items-center justify-center active:scale-90 active:bg-rose-500/30 backdrop-blur-md shadow-lg"
            title="Jump"
          >
            <ArrowUp className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};
