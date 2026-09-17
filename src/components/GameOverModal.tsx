import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Home,
  Zap,
  Target,
  Trophy,
  Coins,
  Sparkles,
  Award,
} from 'lucide-react';
import { RunStats } from '../types';
import confetti from 'canvas-confetti';
import { sound } from '../services/audio';

interface GameOverModalProps {
  stats: RunStats;
  bestScore: number;
  isNewBest: boolean;
  onPlayAgain: () => void;
  onHome: () => void;
  onOpenUpgrades: () => void;
  onOpenMissions: () => void;
  onDoubleCoins: () => void;
  hasDoubledCoins: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  bestScore,
  isNewBest,
  onPlayAgain,
  onHome,
  onOpenUpgrades,
  onOpenMissions,
  onDoubleCoins,
  hasDoubledCoins,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    sound.playHit();

    // Trigger confetti if high score beaten
    if (isNewBest) {
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#ff007f', '#ffff00', '#7928ca'],
        });
      }, 400);
    }

    // Number ticker animation
    let start = 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    const frame = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic out
      setAnimatedScore(Math.floor(ease * stats.score));

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };
    requestAnimationFrame(frame);
  }, [stats.score, isNewBest]);

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters} m`;
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-40 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* TOP GLOW ACCENT */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* HEADER */}
        <div className="flex flex-col items-center">
          {isNewBest && (
            <div className="flex items-center space-x-1.5 px-3 py-1 mb-2 rounded-full bg-amber-500/20 border border-amber-400/80 text-amber-300 text-xs font-black tracking-wider uppercase animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NEW ALL-TIME RECORD!</span>
            </div>
          )}
          <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-fuchsia-400 to-cyan-400 tracking-tight">
            RUN TERMINATED
          </h2>
        </div>

        {/* MAIN SCORE DISPLAY */}
        <div className="my-4 w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
          <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">Final Score</span>
          <span className="text-4xl sm:text-5xl font-black text-white tracking-tight my-1 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
            {animatedScore.toLocaleString()}
          </span>

          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Best: <strong className="text-slate-200">{bestScore.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* DETAILED STATS GRID */}
        <div className="grid grid-cols-3 gap-2 w-full mb-4">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-2.5 flex flex-col items-center">
            <Coins className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-bold uppercase">Coins</span>
            <span className="text-base font-black text-amber-300">
              +{stats.coinsCollected}
            </span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-2.5 flex flex-col items-center">
            <Award className="w-4 h-4 text-purple-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-bold uppercase">Distance</span>
            <span className="text-base font-black text-slate-200">
              {formatDistance(stats.distance)}
            </span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-2.5 flex flex-col items-center">
            <Zap className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-bold uppercase">Near Miss</span>
            <span className="text-base font-black text-cyan-300">
              {stats.nearMisses}
            </span>
          </div>
        </div>

        {/* REWARDED AD / DOUBLE COINS BONUS BUTTON */}
        {!hasDoubledCoins && stats.coinsCollected > 0 && (
          <button
            onClick={onDoubleCoins}
            className="w-full mb-4 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/80 hover:bg-amber-500/30 text-amber-300 font-bold text-sm flex items-center justify-center space-x-2 transition active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            <Coins className="w-4 h-4 fill-amber-300" />
            <span>Double Coins (+{stats.coinsCollected} Bonus)</span>
          </button>
        )}

        {/* PRIMARY ACTION BUTTON: PLAY AGAIN */}
        <button
          onClick={onPlayAgain}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-lg tracking-wider uppercase flex items-center justify-center space-x-2 shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-95 transition"
        >
          <RotateCcw className="w-5 h-5" />
          <span>PLAY AGAIN</span>
        </button>

        {/* SECONDARY NAVIGATION ACTIONS */}
        <div className="grid grid-cols-3 gap-2 w-full mt-3">
          <button
            onClick={onHome}
            className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 border border-slate-700"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <button
            onClick={onOpenUpgrades}
            className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 border border-slate-700"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Upgrades</span>
          </button>

          <button
            onClick={onOpenMissions}
            className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 border border-slate-700"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Missions</span>
          </button>
        </div>
      </div>
    </div>
  );
};
