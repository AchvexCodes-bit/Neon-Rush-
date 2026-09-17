import React from 'react';
import {
  Play,
  User,
  Zap,
  Target,
  Trophy,
  Settings as SettingsIcon,
  Coins,
  Crown,
  Gift,
  HelpCircle,
} from 'lucide-react';
import { GameSaveData } from '../types';
import { getXPForLevel } from '../services/storage';

interface MainMenuProps {
  saveData: GameSaveData;
  onPlay: () => void;
  onOpenShop: () => void;
  onOpenUpgrades: () => void;
  onOpenMissions: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
  onOpenNeonPass: () => void;
  onOpenTutorial: () => void;
  onClaimDailyReward: () => void;
  canClaimDaily: boolean;
  unclaimedMissionsCount: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  saveData,
  onPlay,
  onOpenShop,
  onOpenUpgrades,
  onOpenMissions,
  onOpenLeaderboard,
  onOpenSettings,
  onOpenNeonPass,
  onOpenTutorial,
  onClaimDailyReward,
  canClaimDaily,
  unclaimedMissionsCount,
}) => {
  const xpNeeded = getXPForLevel(saveData.level);
  const xpProgress = Math.min(100, Math.floor((saveData.xp / xpNeeded) * 100));

  return (
    <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 z-30 pointer-events-auto bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/80 backdrop-blur-xs select-none overflow-y-auto">
      {/* TOP HEADER: STATS & QUICK ACTIONS */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
        {/* PLAYER LEVEL & XP */}
        <div className="flex items-center space-x-3 bg-slate-900/80 border border-slate-700/80 rounded-2xl px-3.5 py-2 backdrop-blur-md shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-[0_0_12px_rgba(6,182,212,0.5)]">
            {saveData.level}
          </div>
          <div className="flex flex-col">
            <div className="flex justify-between items-center space-x-3 text-xs">
              <span className="font-bold text-slate-200">LVL {saveData.level}</span>
              <span className="text-[10px] text-cyan-400">{saveData.xp}/{xpNeeded} XP</span>
            </div>
            <div className="w-24 sm:w-32 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* COIN BALANCE & NEON PASS */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-2 bg-slate-900/80 border border-amber-400/40 rounded-2xl px-4 py-2 backdrop-blur-md shadow-lg">
            <Coins className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="text-base sm:text-lg font-black text-amber-300">
              {saveData.coins.toLocaleString()}
            </span>
          </div>

          <button
            onClick={onOpenNeonPass}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs sm:text-sm hover:opacity-95 active:scale-95 transition shadow-[0_0_15px_rgba(245,158,11,0.4)]"
          >
            <Crown className="w-4 h-4 fill-white" />
            <span className="hidden sm:inline">NEON PASS</span>
          </button>
        </div>
      </div>

      {/* CENTER LOGO & TITLE */}
      <div className="flex flex-col items-center justify-center my-auto text-center py-4">
        <div className="relative">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_35px_rgba(6,182,212,0.8)]">
            NEON RUSH
          </h1>
          <div className="absolute -inset-1 bg-cyan-500/20 blur-2xl -z-10 rounded-full" />
        </div>

        <p className="mt-2 text-sm sm:text-base font-bold tracking-[0.3em] uppercase text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]">
          RUN. DODGE. SURVIVE.
        </p>

        {/* HIGH SCORE PILL */}
        <div className="mt-4 px-5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/90 flex items-center space-x-2 shadow-inner">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Best Score:</span>
          <span className="text-sm font-black text-white">{saveData.bestScore.toLocaleString()}</span>
        </div>

        {/* PRIMARY PLAY BUTTON */}
        <div className="mt-8">
          <button
            onClick={onPlay}
            className="group relative px-12 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-fuchsia-600 text-white font-black text-2xl sm:text-3xl tracking-wider uppercase shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:shadow-[0_0_50px_rgba(6,182,212,0.9)] active:scale-95 transition-all duration-150 flex items-center space-x-3 border border-cyan-300/40"
          >
            <Play className="w-8 h-8 fill-white group-hover:scale-110 transition-transform" />
            <span>PLAY</span>
          </button>
        </div>

        {/* DAILY REWARD FLOATING BADGE */}
        {canClaimDaily && (
          <button
            onClick={onClaimDailyReward}
            className="mt-5 flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 font-bold text-xs animate-bounce shadow-[0_0_15px_rgba(245,158,11,0.5)] active:scale-95"
          >
            <Gift className="w-4 h-4" />
            <span>Daily Reward Available! Tap to Claim</span>
          </button>
        )}
      </div>

      {/* BOTTOM NAVIGATION TRAY */}
      <div className="w-full max-w-2xl mx-auto grid grid-cols-5 gap-2 sm:gap-3 pt-2">
        <button
          onClick={onOpenShop}
          className="flex flex-col items-center justify-center py-3 px-1 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-400 transition active:scale-95 group shadow-md"
        >
          <User className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] sm:text-xs font-bold mt-1">Heroes</span>
        </button>

        <button
          onClick={onOpenUpgrades}
          className="flex flex-col items-center justify-center py-3 px-1 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-400 transition active:scale-95 group shadow-md"
        >
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] sm:text-xs font-bold mt-1">Upgrades</span>
        </button>

        <button
          onClick={onOpenMissions}
          className="relative flex flex-col items-center justify-center py-3 px-1 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-400 transition active:scale-95 group shadow-md"
        >
          {unclaimedMissionsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
              {unclaimedMissionsCount}
            </span>
          )}
          <Target className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] sm:text-xs font-bold mt-1">Missions</span>
        </button>

        <button
          onClick={onOpenLeaderboard}
          className="flex flex-col items-center justify-center py-3 px-1 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-400 transition active:scale-95 group shadow-md"
        >
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] sm:text-xs font-bold mt-1">Rankings</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center py-3 px-1 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-400 transition active:scale-95 group shadow-md"
        >
          <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] sm:text-xs font-bold mt-1">Settings</span>
        </button>
      </div>

      {/* QUICK HOW TO PLAY LINK */}
      <div className="flex justify-center mt-2">
        <button
          onClick={onOpenTutorial}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-cyan-400 transition"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>How to Play & Controls</span>
        </button>
      </div>
    </div>
  );
};
