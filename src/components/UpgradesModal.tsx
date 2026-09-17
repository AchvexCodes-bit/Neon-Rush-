import React from 'react';
import {
  X,
  Coins,
  Zap,
  Shield,
  Magnet,
  TrendingUp,
  ArrowUpCircle,
  CheckCircle2,
} from 'lucide-react';
import { INITIAL_UPGRADES } from '../services/storage';
import { UpgradeConfig } from '../types';
import { sound } from '../services/audio';

interface UpgradesModalProps {
  coins: number;
  upgrades: Record<string, number>;
  onUpgrade: (upgradeId: string, cost: number) => void;
  onClose: () => void;
}

export const UpgradesModal: React.FC<UpgradesModalProps> = ({
  coins,
  upgrades,
  onUpgrade,
  onClose,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Magnet':
        return <Magnet className="w-5 h-5 text-rose-400" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-cyan-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'Coins':
        return <Coins className="w-5 h-5 text-amber-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-purple-400" />;
      default:
        return <Zap className="w-5 h-5 text-cyan-400" />;
    }
  };

  const calculateCost = (upgrade: UpgradeConfig, currentLevel: number) => {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel - 1));
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 z-40 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                TECH UPGRADES
              </h2>
              <p className="text-xs text-slate-400">
                Enhance power-up durations & tactical capabilities
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-amber-400/40">
              <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-black text-amber-300">
                {coins.toLocaleString()}
              </span>
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
        </div>

        {/* UPGRADE TILES */}
        <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-3">
          {INITIAL_UPGRADES.map((upgrade) => {
            const currentLevel = upgrades[upgrade.id] || 1;
            const isMax = currentLevel >= upgrade.maxLevel;
            const cost = calculateCost(upgrade, currentLevel);
            const canAfford = coins >= cost && !isMax;

            return (
              <div
                key={upgrade.id}
                className="p-4 rounded-2xl bg-slate-850/60 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(upgrade.icon)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-white text-sm">
                        {upgrade.name}
                      </h3>
                      <span className="text-[11px] font-bold text-cyan-400">
                        LVL {currentLevel}/{upgrade.maxLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {upgrade.description}
                    </p>

                    {/* LEVEL PIPS */}
                    <div className="flex space-x-1.5 mt-2">
                      {Array.from({ length: upgrade.maxLevel }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-5 h-1.5 rounded-full transition-all ${
                            idx < currentLevel
                              ? 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]'
                              : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* UPGRADE ACTION */}
                <div className="w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                  {isMax ? (
                    <div className="flex items-center justify-center space-x-1 px-4 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>MAXED</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (canAfford) {
                          sound.playLevelUp();
                          onUpgrade(upgrade.id, cost);
                        }
                      }}
                      disabled={!canAfford}
                      className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                          : 'bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                      <span>Upgrade ({cost.toLocaleString()})</span>
                      <Coins className="w-3.5 h-3.5 fill-current" />
                    </button>
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
