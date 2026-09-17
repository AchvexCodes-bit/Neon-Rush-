import React from 'react';
import {
  X,
  Trophy,
  Medal,
  Award,
  Crown,
  User,
} from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { sound } from '../services/audio';

interface LeaderboardModalProps {
  playerBestScore: number;
  playerBestDistance: number;
  onClose: () => void;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'VEX_SPECTRE', score: 94820, distance: 8240, characterId: 'soldier' },
  { rank: 2, name: 'CYBER_VIPER', score: 81400, distance: 6890, characterId: 'ninja' },
  { rank: 3, name: 'AERO_BLAST', score: 67350, distance: 5420, characterId: 'cyber' },
  { rank: 4, name: 'NEO_PHANTOM', score: 52100, distance: 4190, characterId: 'shadow' },
  { rank: 5, name: 'GLITCH_RUNNER', score: 43250, distance: 3540, characterId: 'default' },
  { rank: 6, name: 'PULSE_CHRONO', score: 38900, distance: 3100, characterId: 'ninja' },
  { rank: 7, name: 'GRID_SURFER', score: 29400, distance: 2450, characterId: 'cyber' },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  playerBestScore,
  playerBestDistance,
  onClose,
}) => {
  // Insert player entry dynamically into ranking
  const fullList = [...MOCK_LEADERBOARD, {
    rank: 0,
    name: 'YOU (Runner)',
    score: playerBestScore,
    distance: playerBestDistance,
    characterId: 'player',
    isPlayer: true,
  }]
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300 fill-slate-300" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600 fill-amber-600" />;
    return <span className="text-xs font-black text-slate-400">#{rank}</span>;
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${meters} m`;
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 z-40 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                CYBER RANKINGS
              </h2>
              <p className="text-xs text-slate-400">
                Local preview leaderboard • Ready for cloud sync
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

        {/* RANKINGS LIST */}
        <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-2">
          {fullList.map((entry) => (
            <div
              key={entry.name}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                entry.isPlayer
                  ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-850/60 border-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
                  {getRankBadge(entry.rank)}
                </div>

                <div className="flex items-center space-x-2">
                  <User className={`w-4 h-4 ${entry.isPlayer ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-sm font-black ${entry.isPlayer ? 'text-cyan-300' : 'text-white'}`}>
                        {entry.name}
                      </span>
                      {entry.isPlayer && (
                        <span className="px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 text-[10px] font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {formatDistance(entry.distance)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-white">
                  {entry.score.toLocaleString()}
                </span>
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
