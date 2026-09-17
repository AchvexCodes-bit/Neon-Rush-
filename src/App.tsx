/**
 * NEON RUSH — Main Application Component
 * High-octane 3D Cyberpunk Endless Runner
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine, ActivePowerUpState } from './game/GameEngine';
import {
  CharacterConfig,
  GameSaveData,
  GameState,
  PlayerSettings,
  RunStats,
  TrailConfig,
} from './types';
import {
  createDefaultSaveData,
  DAILY_REWARDS,
  getXPForLevel,
  INITIAL_CHARACTERS,
  INITIAL_TRAILS,
  INITIAL_UPGRADES,
  loadGameData,
  saveGameData,
} from './services/storage';
import { sound } from './services/audio';
import { analytics } from './services/analytics';
import { subscription } from './services/subscription';
import confetti from 'canvas-confetti';

// UI Components
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { GameOverModal } from './components/GameOverModal';
import { ShopModal } from './components/ShopModal';
import { UpgradesModal } from './components/UpgradesModal';
import { MissionsModal } from './components/MissionsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SettingsModal } from './components/SettingsModal';
import { TutorialOverlay } from './components/TutorialOverlay';
import { PauseModal } from './components/PauseModal';
import { NeonPassModal } from './components/NeonPassModal';

export default function App() {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [saveData, setSaveData] = useState<GameSaveData>(() => loadGameData());
  const [isNewBest, setIsNewBest] = useState(false);
  const [hasDoubledCoins, setHasDoubledCoins] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // In-Game HUD state
  const [hudStats, setHudStats] = useState<{
    score: number;
    coins: number;
    distance: number;
    combo: number;
    speed: number;
    activePowerUps: ActivePowerUpState[];
  }>({
    score: 0,
    coins: 0,
    distance: 0,
    combo: 1,
    speed: 14,
    activePowerUps: [],
  });

  const [nearMissText, setNearMissText] = useState<string | null>(null);
  const nearMissTimeoutRef = useRef<number | null>(null);

  const [lastRunStats, setLastRunStats] = useState<RunStats>({
    score: 0,
    coinsCollected: 0,
    distance: 0,
    nearMisses: 0,
    powerUpsUsed: 0,
    maxCombo: 1,
    duration: 0,
  });

  // Keep save data synced with localStorage
  const updateSaveData = useCallback((updater: (prev: GameSaveData) => GameSaveData) => {
    setSaveData((prev) => {
      const next = updater(prev);
      saveGameData(next);
      return next;
    });
  }, []);

  // Check Daily Login Reward availability
  const todayStr = new Date().toISOString().slice(0, 10);
  const canClaimDaily = saveData.dailyRewardLastClaimDate !== todayStr;

  // Count unclaimed completed missions
  const unclaimedMissionsCount = saveData.missions.filter(
    (m) => m.current >= m.target && !m.claimed
  ).length;

  // Initialize Subscription listener
  useEffect(() => {
    const unsub = subscription.addListener((isPremium) => {
      updateSaveData((prev) => ({ ...prev, isPremium }));
    });
    return unsub;
  }, [updateSaveData]);

  // Handle Game Over
  const handleEngineGameOver = useCallback((stats: RunStats) => {
    analytics.track('game_over', { score: stats.score, distance: stats.distance });

    setLastRunStats(stats);
    setHasDoubledCoins(false);

    updateSaveData((prev) => {
      const isRecord = stats.score > prev.bestScore;
      setIsNewBest(isRecord);

      const newBestScore = Math.max(prev.bestScore, stats.score);
      const newBestDistance = Math.max(prev.bestDistance, stats.distance);
      const newCoins = prev.coins + stats.coinsCollected;

      // XP calculation: distance / 2 + coins * 2 + near misses * 15
      const xpGained = Math.floor(stats.distance / 2 + stats.coinsCollected * 2 + stats.nearMisses * 15);
      let currentXP = prev.xp + xpGained;
      let currentLevel = prev.level;
      let neededXP = getXPForLevel(currentLevel);

      while (currentXP >= neededXP && currentLevel < 100) {
        currentXP -= neededXP;
        currentLevel++;
        neededXP = getXPForLevel(currentLevel);
        sound.playLevelUp();
      }

      // Update Missions progress
      const updatedMissions = prev.missions.map((m) => {
        let added = 0;
        if (m.id.includes('coins')) added = stats.coinsCollected;
        else if (m.id.includes('distance')) added = stats.distance;
        else if (m.id.includes('near_miss')) added = stats.nearMisses;
        else if (m.id.includes('powerup')) added = stats.powerUpsUsed;
        else if (m.id.includes('combo')) added = stats.maxCombo >= m.target ? m.target : 0;
        else if (m.id.includes('score')) added = stats.score >= m.target ? m.target : 0;

        const nextCurrent = Math.min(m.target, m.current + added);
        return {
          ...m,
          current: nextCurrent,
          completed: nextCurrent >= m.target,
        };
      });

      return {
        ...prev,
        bestScore: newBestScore,
        bestDistance: newBestDistance,
        coins: newCoins,
        level: currentLevel,
        xp: currentXP,
        missions: updatedMissions,
      };
    });

    setGameState('GAMEOVER');
  }, [updateSaveData]);

  // Handle Near Miss notification
  const handleEngineNearMiss = useCallback((bonus: number) => {
    setNearMissText(`NEAR MISS! +${bonus}`);
    if (nearMissTimeoutRef.current !== null) {
      window.clearTimeout(nearMissTimeoutRef.current);
    }
    nearMissTimeoutRef.current = window.setTimeout(() => {
      setNearMissText(null);
    }, 1200);
  }, []);

  // Initialize Three.js Engine
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    sound.setVolumes(saveData.settings.sfxVolume, saveData.settings.musicVolume);

    const engine = new GameEngine(canvasContainerRef.current, {
      onScoreUpdate: (stats) => {
        setHudStats(stats);
      },
      onNearMiss: handleEngineNearMiss,
      onGameOver: handleEngineGameOver,
    });

    engineRef.current = engine;

    return () => {
      engine.unbind();
    };
  }, [handleEngineNearMiss, handleEngineGameOver, saveData.settings.sfxVolume, saveData.settings.musicVolume]);

  // START RUN ACTION
  const handleStartRun = () => {
    if (!engineRef.current) return;

    if (!saveData.tutorialCompleted) {
      setShowTutorial(true);
      return;
    }

    analytics.track('game_started');

    const currentChar = INITIAL_CHARACTERS.find((c) => c.id === saveData.selectedCharacter) || INITIAL_CHARACTERS[0];
    const currentTrail = INITIAL_TRAILS.find((t) => t.id === saveData.selectedTrail) || INITIAL_TRAILS[0];

    // Compute upgrade bonuses
    const magnetUpgrade = INITIAL_UPGRADES.find((u) => u.id === 'magnet_duration');
    const shieldUpgrade = INITIAL_UPGRADES.find((u) => u.id === 'shield_duration');
    const speedUpgrade = INITIAL_UPGRADES.find((u) => u.id === 'speed_boost_duration');
    const coinUpgrade = INITIAL_UPGRADES.find((u) => u.id === 'coin_multiplier_duration');
    const scoreUpgrade = INITIAL_UPGRADES.find((u) => u.id === 'score_boost_duration');

    const upgradeBonus = {
      magnet: ((saveData.upgrades['magnet_duration'] || 1) - 1) * (magnetUpgrade?.statBonusPerLevel || 2),
      shield: ((saveData.upgrades['shield_duration'] || 1) - 1) * (shieldUpgrade?.statBonusPerLevel || 2.5),
      speedBoost: ((saveData.upgrades['speed_boost_duration'] || 1) - 1) * (speedUpgrade?.statBonusPerLevel || 1.5),
      doubleCoins: ((saveData.upgrades['coin_multiplier_duration'] || 1) - 1) * (coinUpgrade?.statBonusPerLevel || 2),
      scoreMultiplier: ((saveData.upgrades['score_boost_duration'] || 1) - 1) * (scoreUpgrade?.statBonusPerLevel || 2.5),
    };

    engineRef.current.startRun({
      characterColor: currentChar.color,
      trailColor: currentTrail.color,
      upgradeBonus,
      cameraShake: saveData.settings.cameraShake,
      motionEffects: saveData.settings.motionEffects,
      haptics: saveData.settings.haptics,
    });

    setGameState('PLAYING');
  };

  // REWARDED AD / DOUBLE COINS
  const handleDoubleCoins = () => {
    if (hasDoubledCoins) return;
    analytics.track('ad_watched', { type: 'double_coins' });

    setHasDoubledCoins(true);
    sound.playLevelUp();

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#d97706'],
    });

    updateSaveData((prev) => ({
      ...prev,
      coins: prev.coins + lastRunStats.coinsCollected,
    }));
  };

  // DAILY REWARD CLAIM
  const handleClaimDailyReward = () => {
    if (!canClaimDaily) return;

    sound.playLevelUp();
    const streak = (saveData.dailyRewardStreak % 7) + 1;
    const rewardItem = DAILY_REWARDS[streak - 1];

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#00f0ff', '#fbbf24', '#ec4899'],
    });

    analytics.track('daily_reward_claimed', { streak, amount: rewardItem.reward });

    updateSaveData((prev) => ({
      ...prev,
      coins: prev.coins + rewardItem.reward,
      dailyRewardLastClaimDate: todayStr,
      dailyRewardStreak: streak,
    }));
  };

  // UNLOCK HERO
  const handleUnlockCharacter = (char: CharacterConfig) => {
    if (saveData.coins < char.price) return;
    analytics.track('character_unlocked', { characterId: char.id });

    updateSaveData((prev) => ({
      ...prev,
      coins: prev.coins - char.price,
      unlockedCharacters: [...prev.unlockedCharacters, char.id],
      selectedCharacter: char.id,
    }));
  };

  // UNLOCK TRAIL
  const handleUnlockTrail = (trail: TrailConfig) => {
    if (saveData.coins < trail.price) return;
    updateSaveData((prev) => ({
      ...prev,
      coins: prev.coins - trail.price,
      unlockedTrails: [...prev.unlockedTrails, trail.id],
      selectedTrail: trail.id,
    }));
  };

  // PURCHASE UPGRADE
  const handleUpgrade = (upgradeId: string, cost: number) => {
    if (saveData.coins < cost) return;
    updateSaveData((prev) => {
      const current = prev.upgrades[upgradeId] || 1;
      return {
        ...prev,
        coins: prev.coins - cost,
        upgrades: {
          ...prev.upgrades,
          [upgradeId]: current + 1,
        },
      };
    });
  };

  // CLAIM MISSION REWARD
  const handleClaimMission = (missionId: string) => {
    analytics.track('mission_completed', { missionId });

    updateSaveData((prev) => {
      const mission = prev.missions.find((m) => m.id === missionId);
      if (!mission || mission.claimed) return prev;

      let extraCoins = 0;
      let extraXP = 0;
      if (mission.rewardType === 'coins') extraCoins = mission.rewardAmount;
      else extraXP = mission.rewardAmount;

      return {
        ...prev,
        coins: prev.coins + extraCoins,
        xp: prev.xp + extraXP,
        missions: prev.missions.map((m) =>
          m.id === missionId ? { ...m, claimed: true } : m
        ),
      };
    });
  };

  // RESET PROGRESS
  const handleResetProgress = () => {
    const defaultData = createDefaultSaveData();
    saveGameData(defaultData);
    setSaveData(defaultData);
    sound.playButtonClick();
    setGameState('MENU');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* 3D WEBGL ENGINE CANVAS MOUNT */}
      <div
        ref={canvasContainerRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10"
      />

      {/* ACTIVE GAMEPLAY HUD */}
      {gameState === 'PLAYING' && (
        <HUD
          score={hudStats.score}
          coins={hudStats.coins}
          distance={hudStats.distance}
          combo={hudStats.combo}
          speed={hudStats.speed}
          activePowerUps={hudStats.activePowerUps}
          nearMissText={nearMissText}
          onPause={() => {
            if (engineRef.current) engineRef.current.pause();
            setGameState('PAUSED');
          }}
          onMoveLeft={() => engineRef.current?.moveLeft()}
          onMoveRight={() => engineRef.current?.moveRight()}
          onJump={() => engineRef.current?.jump()}
          onSlide={() => engineRef.current?.slide()}
        />
      )}

      {/* PAUSE MENU */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={() => {
            if (engineRef.current) engineRef.current.resume();
            setGameState('PLAYING');
          }}
          onRestart={() => {
            handleStartRun();
          }}
          onOpenSettings={() => setGameState('SETTINGS')}
          onQuit={() => {
            if (engineRef.current) engineRef.current.stop();
            setGameState('MENU');
          }}
        />
      )}

      {/* MAIN MENU */}
      {gameState === 'MENU' && (
        <MainMenu
          saveData={saveData}
          onPlay={handleStartRun}
          onOpenShop={() => setGameState('SHOP')}
          onOpenUpgrades={() => setGameState('UPGRADES')}
          onOpenMissions={() => setGameState('MISSIONS')}
          onOpenLeaderboard={() => setGameState('LEADERBOARD')}
          onOpenSettings={() => setGameState('SETTINGS')}
          onOpenNeonPass={() => setGameState('NEON_PASS')}
          onOpenTutorial={() => setShowTutorial(true)}
          onClaimDailyReward={handleClaimDailyReward}
          canClaimDaily={canClaimDaily}
          unclaimedMissionsCount={unclaimedMissionsCount}
        />
      )}

      {/* GAME OVER SCREEN */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          stats={lastRunStats}
          bestScore={saveData.bestScore}
          isNewBest={isNewBest}
          onPlayAgain={handleStartRun}
          onHome={() => setGameState('MENU')}
          onOpenUpgrades={() => setGameState('UPGRADES')}
          onOpenMissions={() => setGameState('MISSIONS')}
          onDoubleCoins={handleDoubleCoins}
          hasDoubledCoins={hasDoubledCoins}
        />
      )}

      {/* CHARACTER & SKIN LOCKER */}
      {gameState === 'SHOP' && (
        <ShopModal
          coins={saveData.coins}
          selectedCharacter={saveData.selectedCharacter}
          selectedTrail={saveData.selectedTrail}
          unlockedCharacters={saveData.unlockedCharacters}
          unlockedTrails={saveData.unlockedTrails}
          onSelectCharacter={(id) => updateSaveData((prev) => ({ ...prev, selectedCharacter: id }))}
          onSelectTrail={(id) => updateSaveData((prev) => ({ ...prev, selectedTrail: id }))}
          onUnlockCharacter={handleUnlockCharacter}
          onUnlockTrail={handleUnlockTrail}
          onClose={() => setGameState('MENU')}
        />
      )}

      {/* TECH UPGRADES */}
      {gameState === 'UPGRADES' && (
        <UpgradesModal
          coins={saveData.coins}
          upgrades={saveData.upgrades}
          onUpgrade={handleUpgrade}
          onClose={() => setGameState('MENU')}
        />
      )}

      {/* MISSIONS & ACHIEVEMENTS */}
      {gameState === 'MISSIONS' && (
        <MissionsModal
          missions={saveData.missions}
          onClaimReward={handleClaimMission}
          onClose={() => setGameState('MENU')}
        />
      )}

      {/* LEADERBOARDS */}
      {gameState === 'LEADERBOARD' && (
        <LeaderboardModal
          playerBestScore={saveData.bestScore}
          playerBestDistance={saveData.bestDistance}
          onClose={() => setGameState('MENU')}
        />
      )}

      {/* SETTINGS */}
      {gameState === 'SETTINGS' && (
        <SettingsModal
          settings={saveData.settings}
          onUpdateSettings={(newSettings) =>
            updateSaveData((prev) => ({
              ...prev,
              settings: { ...prev.settings, ...newSettings } as PlayerSettings,
            }))
          }
          onResetProgress={handleResetProgress}
          onClose={() => setGameState('MENU')}
        />
      )}

      {/* NEON PASS (REVENUECAT SUBSCRIPTION) */}
      {gameState === 'NEON_PASS' && (
        <NeonPassModal
          isPremium={saveData.isPremium}
          onClose={() => setGameState('MENU')}
          onPurchased={() => {
            updateSaveData((prev) => ({ ...prev, isPremium: true }));
          }}
        />
      )}

      {/* TUTORIAL & CONTROLS OVERLAY */}
      {showTutorial && (
        <TutorialOverlay
          onClose={() => {
            setShowTutorial(false);
            updateSaveData((prev) => ({ ...prev, tutorialCompleted: true }));
            if (gameState === 'MENU') {
              handleStartRun();
            }
          }}
        />
      )}
    </div>
  );
}
