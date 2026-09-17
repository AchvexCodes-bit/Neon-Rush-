import React, { useState } from 'react';
import {
  X,
  Coins,
  Check,
  Lock,
  Sparkles,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { INITIAL_CHARACTERS, INITIAL_TRAILS } from '../services/storage';
import { CharacterConfig, TrailConfig } from '../types';
import { sound } from '../services/audio';

interface ShopModalProps {
  coins: number;
  selectedCharacter: string;
  selectedTrail: string;
  unlockedCharacters: string[];
  unlockedTrails: string[];
  onSelectCharacter: (id: string) => void;
  onSelectTrail: (id: string) => void;
  onUnlockCharacter: (char: CharacterConfig) => void;
  onUnlockTrail: (trail: TrailConfig) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  coins,
  selectedCharacter,
  selectedTrail,
  unlockedCharacters,
  unlockedTrails,
  onSelectCharacter,
  onSelectTrail,
  onUnlockCharacter,
  onUnlockTrail,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'heroes' | 'trails'>('heroes');

  return (
    <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 z-40 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                CYBER LOCKER
              </h2>
              <p className="text-xs text-slate-400">
                Unlock futuristic runners & energy trail effects
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

        {/* TABS */}
        <div className="flex space-x-2 my-4">
          <button
            onClick={() => {
              sound.playButtonClick();
              setActiveTab('heroes');
            }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition ${
              activeTab === 'heroes'
                ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Heroes ({INITIAL_CHARACTERS.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              setActiveTab('trails');
            }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition ${
              activeTab === 'trails'
                ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Energy Trails ({INITIAL_TRAILS.length})</span>
          </button>
        </div>

        {/* CONTENT LIST */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {activeTab === 'heroes' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INITIAL_CHARACTERS.map((char) => {
                const isUnlocked = unlockedCharacters.includes(char.id);
                const isSelected = selectedCharacter === char.id;
                const canAfford = coins >= char.price;

                return (
                  <div
                    key={char.id}
                    className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                        : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* CHARACTER TOP PREVIEW */}
                    <div className="flex items-start space-x-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner"
                        style={{
                          backgroundColor: `${char.color}22`,
                          borderColor: char.color,
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{
                            backgroundColor: char.color,
                            boxShadow: `0 0 12px ${char.glowColor}`,
                          }}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-black text-white text-sm">
                            {char.name}
                          </h3>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 text-[10px] font-black border border-cyan-400/40">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {char.description}
                        </p>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      {isUnlocked ? (
                        isSelected ? (
                          <div className="flex items-center space-x-1 text-cyan-400 text-xs font-bold">
                            <Check className="w-4 h-4" />
                            <span>Equipped</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              sound.playButtonClick();
                              onSelectCharacter(char.id);
                            }}
                            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition active:scale-95 border border-slate-700"
                          >
                            Equip Hero
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => {
                            if (canAfford) {
                              sound.playLevelUp();
                              onUnlockCharacter(char);
                            }
                          }}
                          disabled={!canAfford}
                          className={`w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                              : 'bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Unlock for {char.price.toLocaleString()}</span>
                          <Coins className="w-3.5 h-3.5 fill-current" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INITIAL_TRAILS.map((trail) => {
                const isUnlocked = unlockedTrails.includes(trail.id);
                const isSelected = selectedTrail === trail.id;
                const canAfford = coins >= trail.price;

                return (
                  <div
                    key={trail.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                        : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center border"
                        style={{
                          backgroundColor: `${trail.color}22`,
                          borderColor: trail.color,
                        }}
                      >
                        <Flame
                          className="w-5 h-5"
                          style={{ color: trail.color }}
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-white text-sm">
                          {trail.name}
                        </h3>
                        <div
                          className="w-20 h-1.5 rounded-full mt-1.5"
                          style={{
                            backgroundColor: trail.color,
                            boxShadow: `0 0 8px ${trail.color}`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80">
                      {isUnlocked ? (
                        isSelected ? (
                          <div className="flex items-center space-x-1 text-cyan-400 text-xs font-bold justify-center py-1">
                            <Check className="w-4 h-4" />
                            <span>Active Trail</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              sound.playButtonClick();
                              onSelectTrail(trail.id);
                            }}
                            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition active:scale-95 border border-slate-700"
                          >
                            Equip Trail
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => {
                            if (canAfford) {
                              sound.playLevelUp();
                              onUnlockTrail(trail);
                            }
                          }}
                          disabled={!canAfford}
                          className={`w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                              : 'bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Unlock for {trail.price}</span>
                          <Coins className="w-3.5 h-3.5 fill-current" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
