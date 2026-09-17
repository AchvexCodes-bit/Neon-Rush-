import {
  CharacterConfig,
  GameSaveData,
  Mission,
  PlayerSettings,
  TrailConfig,
  UpgradeConfig,
} from '../types';

export const INITIAL_CHARACTERS: CharacterConfig[] = [
  {
    id: 'default',
    name: 'Default Runner',
    price: 0,
    unlocked: true,
    color: '#06b6d4', // Cyan
    accentColor: '#3b82f6',
    glowColor: '#22d3ee',
    modelStyle: 'speed',
    description: 'Standard agile combat runner equipped with kinetic thrusters.',
  },
  {
    id: 'cyber',
    name: 'Cyber Runner',
    price: 500,
    unlocked: false,
    color: '#ec4899', // Hot Pink
    accentColor: '#8b5cf6',
    glowColor: '#f472b6',
    modelStyle: 'cyber',
    description: 'Upgraded with high-frequency neon sub-frames and low drag.',
  },
  {
    id: 'ninja',
    name: 'Neon Ninja',
    price: 1500,
    unlocked: false,
    color: '#10b981', // Emerald
    accentColor: '#059669',
    glowColor: '#34d399',
    modelStyle: 'ninja',
    description: 'Silent assassin tuned for lightning reflex lane changes.',
  },
  {
    id: 'shadow',
    name: 'Shadow Runner',
    price: 3000,
    unlocked: false,
    color: '#a855f7', // Purple
    accentColor: '#6366f1',
    glowColor: '#c084fc',
    modelStyle: 'stealth',
    description: 'Dark matter cloaked prototype with luminous spectral aura.',
  },
  {
    id: 'soldier',
    name: 'Future Soldier',
    price: 5000,
    unlocked: false,
    color: '#f59e0b', // Amber / Gold
    accentColor: '#ef4444',
    glowColor: '#fbbf24',
    modelStyle: 'heavy',
    description: 'Armored elite vanguard engineered for heavy urban endurance.',
  },
];

export const INITIAL_TRAILS: TrailConfig[] = [
  { id: 'trail_cyan', name: 'Cyber Cyan', price: 0, color: '#06b6d4', unlocked: true },
  { id: 'trail_pink', name: 'Plasma Pink', price: 300, color: '#f43f5e', unlocked: false },
  { id: 'trail_gold', name: 'Solar Flare', price: 800, color: '#eab308', unlocked: false },
  { id: 'trail_toxic', name: 'Toxic Neon', price: 1200, color: '#22c55e', unlocked: false },
  { id: 'trail_violet', name: 'Quantum Void', price: 2000, color: '#a855f7', unlocked: false },
];

export const INITIAL_UPGRADES: UpgradeConfig[] = [
  {
    id: 'magnet_duration',
    name: 'Magnet Duration',
    description: 'Increases the time coin attraction remains active.',
    maxLevel: 5,
    currentLevel: 1,
    baseCost: 200,
    costMultiplier: 1.6,
    icon: 'Magnet',
    statBonusPerLevel: 2.0, // +2 seconds per level
  },
  {
    id: 'shield_duration',
    name: 'Shield Fortification',
    description: 'Grants extended invulnerability window upon impact.',
    maxLevel: 5,
    currentLevel: 1,
    baseCost: 250,
    costMultiplier: 1.7,
    icon: 'Shield',
    statBonusPerLevel: 2.5,
  },
  {
    id: 'speed_boost_duration',
    name: 'Hyperdrive Turbo',
    description: 'Lengthens invincible supersonic dash duration.',
    maxLevel: 5,
    currentLevel: 1,
    baseCost: 350,
    costMultiplier: 1.8,
    icon: 'Zap',
    statBonusPerLevel: 1.5,
  },
  {
    id: 'coin_multiplier_duration',
    name: '2x Coin Multiplier',
    description: 'Extends double coin value duration.',
    maxLevel: 5,
    currentLevel: 1,
    baseCost: 300,
    costMultiplier: 1.7,
    icon: 'Coins',
    statBonusPerLevel: 2.0,
  },
  {
    id: 'score_boost_duration',
    name: 'Overdrive Score',
    description: 'Keeps score amplifier running longer.',
    maxLevel: 5,
    currentLevel: 1,
    baseCost: 300,
    costMultiplier: 1.6,
    icon: 'TrendingUp',
    statBonusPerLevel: 2.5,
  },
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'daily_coins_1',
    title: 'Neon Vault',
    description: 'Collect 150 coins in runs',
    target: 150,
    current: 0,
    rewardType: 'coins',
    rewardAmount: 200,
    completed: false,
    claimed: false,
    category: 'daily',
  },
  {
    id: 'daily_distance_1',
    title: 'City Explorer',
    description: 'Run 1,000 meters total',
    target: 1000,
    current: 0,
    rewardType: 'xp',
    rewardAmount: 350,
    completed: false,
    claimed: false,
    category: 'daily',
  },
  {
    id: 'daily_near_miss_1',
    title: 'Close Shave',
    description: 'Perform 5 near misses',
    target: 5,
    current: 0,
    rewardType: 'coins',
    rewardAmount: 150,
    completed: false,
    claimed: false,
    category: 'daily',
  },
  {
    id: 'daily_powerups_1',
    title: 'Power Surge',
    description: 'Grab 4 power-ups during gameplay',
    target: 4,
    current: 0,
    rewardType: 'coins',
    rewardAmount: 180,
    completed: false,
    claimed: false,
    category: 'daily',
  },
  // Lifetime missions
  {
    id: 'life_distance_5k',
    title: 'Highway Legend',
    description: 'Reach a cumulative distance of 5,000m',
    target: 5000,
    current: 0,
    rewardType: 'coins',
    rewardAmount: 1000,
    completed: false,
    claimed: false,
    category: 'lifetime',
  },
  {
    id: 'life_score_50k',
    title: 'Score Overload',
    description: 'Attain a single run score of 25,000+',
    target: 25000,
    current: 0,
    rewardType: 'xp',
    rewardAmount: 800,
    completed: false,
    claimed: false,
    category: 'lifetime',
  },
  {
    id: 'life_combo_10',
    title: 'Rhythm Master',
    description: 'Reach an x5 combo streak',
    target: 5,
    current: 0,
    rewardType: 'coins',
    rewardAmount: 500,
    completed: false,
    claimed: false,
    category: 'lifetime',
  },
];

export const DAILY_REWARDS = [
  { day: 1, reward: 100, label: '100 Coins' },
  { day: 2, reward: 150, label: '150 Coins' },
  { day: 3, reward: 200, label: '200 Coins' },
  { day: 4, reward: 250, label: '250 Coins' },
  { day: 5, reward: 400, label: '400 Coins' },
  { day: 6, reward: 500, label: '500 Coins' },
  { day: 7, reward: 1000, label: '1,000 Coins + VIP' },
];

const DEFAULT_SETTINGS: PlayerSettings = {
  musicVolume: 0.5,
  sfxVolume: 0.8,
  haptics: true,
  graphicsQuality: 'high',
  cameraShake: true,
  motionEffects: true,
  highContrast: false,
};

const STORAGE_KEY = 'neon_rush_save_v1';

export function getXPForLevel(level: number): number {
  return Math.floor(400 * Math.pow(level, 1.4));
}

export function loadGameData(): GameSaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultSaveData();

    const data = JSON.parse(raw) as Partial<GameSaveData>;

    return {
      coins: Math.max(0, Number(data.coins) || 0),
      bestScore: Math.max(0, Number(data.bestScore) || 0),
      bestDistance: Math.max(0, Number(data.bestDistance) || 0),
      level: Math.max(1, Math.min(100, Number(data.level) || 1)),
      xp: Math.max(0, Number(data.xp) || 0),
      selectedCharacter: data.selectedCharacter || 'default',
      selectedTrail: data.selectedTrail || 'trail_cyan',
      unlockedCharacters: Array.isArray(data.unlockedCharacters)
        ? data.unlockedCharacters
        : ['default'],
      unlockedTrails: Array.isArray(data.unlockedTrails)
        ? data.unlockedTrails
        : ['trail_cyan'],
      upgrades: data.upgrades || {
        magnet_duration: 1,
        shield_duration: 1,
        speed_boost_duration: 1,
        coin_multiplier_duration: 1,
        score_boost_duration: 1,
      },
      missions: Array.isArray(data.missions) && data.missions.length > 0
        ? data.missions
        : INITIAL_MISSIONS,
      dailyRewardLastClaimDate: data.dailyRewardLastClaimDate || null,
      dailyRewardStreak: Number(data.dailyRewardStreak) || 0,
      settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
      tutorialCompleted: Boolean(data.tutorialCompleted),
      isPremium: Boolean(data.isPremium),
    };
  } catch (err) {
    console.warn('Failed to parse save data, initializing defaults', err);
    return createDefaultSaveData();
  }
}

export function saveGameData(data: GameSaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save game data to local storage', err);
  }
}

export function createDefaultSaveData(): GameSaveData {
  return {
    coins: 150, // Starting bonus
    bestScore: 0,
    bestDistance: 0,
    level: 1,
    xp: 0,
    selectedCharacter: 'default',
    selectedTrail: 'trail_cyan',
    unlockedCharacters: ['default'],
    unlockedTrails: ['trail_cyan'],
    upgrades: {
      magnet_duration: 1,
      shield_duration: 1,
      speed_boost_duration: 1,
      coin_multiplier_duration: 1,
      score_boost_duration: 1,
    },
    missions: INITIAL_MISSIONS,
    dailyRewardLastClaimDate: null,
    dailyRewardStreak: 0,
    settings: DEFAULT_SETTINGS,
    tutorialCompleted: false,
    isPremium: false,
  };
}

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light', enabled = true) {
  if (!enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    if (type === 'light') navigator.vibrate(12);
    else if (type === 'medium') navigator.vibrate(28);
    else if (type === 'heavy') navigator.vibrate([40, 30, 60]);
  } catch {
    // Ignore unsupported browser / user permission issues
  }
}
