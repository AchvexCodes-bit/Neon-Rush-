import React, { useState } from 'react';
import {
  X,
  Target,
  Coins,
  Sparkles,
  CheckCircle2,
  Gift,
  Calendar,
  Award,
} from 'lucide-react';
import { Mission } from '../types';
import { sound } from '../services/audio';
import confetti from 'canvas-confetti';

interface MissionsModalProps {
  missions: Mission[];
  onClaimReward: (missionId: string) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  missions,
  onClaimReward,
  onClose,
}) => {
  const [filter, setFilter] = useState<'all' | 'daily' | 'lifetime'>('all');

  const filteredMissions = missions.filter((m) => {
    if (filter === 'daily') return m.category === 'daily';
    if (filter === 'lifetime') return m.category === 'lifetime';
    return true;
  });

  const handleClaim = (mission: Mission) => {
    sound.playLevelUp();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00f0ff', '#f59e0b', '#ec4899'],
    });
    onClaimReward(mission.id);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 z-40 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                OPERATIONAL MISSIONS
              </h2>
              <p className="text-xs text-slate-400">
                Complete milestones for massive coin and XP payouts
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

        {/* TABS */}
        <div className="flex space-x-2 my-4">
          <button
            onClick={() => {
              sound.playButtonClick();
              setFilter('all');
            }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm transition ${
              filter === 'all'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Missions
          </button>
          <button
            onClick={() => {
              sound.playButtonClick();
              setFilter('daily');
            }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition ${
              filter === 'daily'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily</span>
          </button>
          <button
            onClick={() => {
              sound.playButtonClick();
              setFilter('lifetime');
            }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition ${
              filter === 'lifetime'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Lifetime</span>
          </button>
        </div>

        {/* MISSION CARDS LIST */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {filteredMissions.map((mission) => {
            const isCompleted = mission.current >= mission.target;
            const percent = Math.min(100, Math.floor((mission.current / mission.target) * 100));

            return (
              <div
                key={mission.id}
                className="p-4 rounded-2xl bg-slate-850/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        mission.category === 'daily'
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}
                    >
                      {mission.category}
                    </span>
                    <h3 className="font-bold text-white text-sm">
                      {mission.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {mission.description}
                  </p>

                  {/* PROGRESS BAR */}
                  <div className="mt-2.5 flex items-center space-x-3">
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-300 shrink-0">
                      {mission.current}/{mission.target}
                    </span>
                  </div>
                </div>

                {/* REWARD / CLAIM BUTTON */}
                <div className="w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                  {mission.claimed ? (
                    <div className="flex items-center justify-center space-x-1 px-4 py-2 rounded-xl bg-slate-800 text-slate-500 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>CLAIMED</span>
                    </div>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaim(mission)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-[0_0_15px_rgba(245,158,11,0.5)] active:scale-95 animate-pulse"
                    >
                      <Gift className="w-4 h-4" />
                      <span>Claim +{mission.rewardAmount} {mission.rewardType.toUpperCase()}</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-400 text-xs font-bold">
                      {mission.rewardType === 'coins' ? (
                        <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                      <span>+{mission.rewardAmount} {mission.rewardType.toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
