export type AnalyticsEvent =
  | 'game_started'
  | 'game_over'
  | 'run_completed'
  | 'powerup_collected'
  | 'mission_completed'
  | 'character_unlocked'
  | 'paywall_viewed'
  | 'purchase_started'
  | 'purchase_completed'
  | 'ad_watched'
  | 'daily_reward_claimed';

class AnalyticsService {
  private logs: Array<{ event: AnalyticsEvent; params?: Record<string, unknown>; timestamp: number }> = [];

  public track(event: AnalyticsEvent, params?: Record<string, unknown>) {
    const record = { event, params, timestamp: Date.now() };
    this.logs.push(record);
    if (this.logs.length > 100) this.logs.shift();

    // Development console logging
    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      console.log(`[ANALYTICS] ${event}`, params || '');
    }
  }

  public getHistory() {
    return [...this.logs];
  }
}

export const analytics = new AnalyticsService();
