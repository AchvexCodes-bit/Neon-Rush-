export type GameState =
  | 'MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'GAMEOVER'
  | 'SHOP'
  | 'UPGRADES'
  | 'MISSIONS'
  | 'LEADERBOARD'
  | 'SETTINGS'
  | 'NEON_PASS';

export type Lane = -1 | 0 | 1; // Left, Center, Right

export type ObstacleType =
  | 'BARRIER'
  | 'LOW_BARRIER'
  | 'HIGH_BARRIER'
  | 'MOVING_OBSTACLE'
  | 'LASER_GATE'
  | 'ROTATING_OBSTACLE'
  | 'ENERGY_WALL';

export type PowerUpType =
  | 'SHIELD'
  | 'MAGNET'
  | 'DOUBLE_COINS'
  | 'SPEED_BOOST'
  | 'SCORE_MULTIPLIER';

export interface PowerUpConfig {
  type: PowerUpType;
  name: string;
  duration: number; // in seconds
  icon: string;
  color: string;
  description: string;
}

export interface CharacterConfig {
  id: string;
  name: string;
  price: number;
  unlocked: boolean;
  color: string;
  accentColor: string;
  glowColor: string;
  modelStyle: 'speed' | 'ninja' | 'heavy' | 'cyber' | 'stealth';
  description: string;
}

export interface TrailConfig {
  id: string;
  name: string;
  price: number;
  color: string;
  unlocked: boolean;
}

export interface UpgradeConfig {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  currentLevel: number;
  baseCost: number;
  costMultiplier: number;
  icon: string;
  statBonusPerLevel: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardType: 'coins' | 'xp';
  rewardAmount: number;
  completed: boolean;
  claimed: boolean;
  category: 'daily' | 'lifetime';
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  distance: number; // in meters
  characterId: string;
  isPlayer?: boolean;
}

export interface PlayerSettings {
  musicVolume: number;
  sfxVolume: number;
  haptics: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
  cameraShake: boolean;
  motionEffects: boolean;
  highContrast: boolean;
}

export interface GameSaveData {
  coins: number;
  bestScore: number;
  bestDistance: number;
  level: number;
  xp: number;
  selectedCharacter: string;
  selectedTrail: string;
  unlockedCharacters: string[];
  unlockedTrails: string[];
  upgrades: Record<string, number>;
  missions: Mission[];
  dailyRewardLastClaimDate: string | null;
  dailyRewardStreak: number;
  settings: PlayerSettings;
  tutorialCompleted: boolean;
  isPremium: boolean;
}

export interface RunStats {
  score: number;
  coinsCollected: number;
  distance: number;
  nearMisses: number;
  powerUpsUsed: number;
  maxCombo: number;
  duration: number; // seconds
}
