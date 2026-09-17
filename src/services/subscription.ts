/**
 * Subscription & Entitlement Manager (RevenueCat abstraction)
 * Manages NEON PASS premium entitlement, products, and mock purchase flows.
 */

import { analytics } from './analytics';

export interface SubscriptionOffering {
  id: string;
  title: string;
  priceString: string;
  period: 'month' | 'year' | 'lifetime';
  popular?: boolean;
  savings?: string;
  perks: string[];
}

export const ENTITLEMENT_PREMIUM = 'premium';

export const STORE_PRODUCTS: Record<string, SubscriptionOffering> = {
  neon_monthly: {
    id: 'neon_monthly',
    title: 'Neon Pass Monthly',
    priceString: '$2.99 / mo',
    period: 'month',
    perks: ['Ad-Free Experience', '2x Permanent Coin Boost', 'Cyberpunk Neon Glow Trail', 'Daily 2x Login Rewards'],
  },
  neon_yearly: {
    id: 'neon_yearly',
    title: 'Neon Pass Annual',
    priceString: '$19.99 / yr',
    period: 'year',
    popular: true,
    savings: 'SAVE 45%',
    perks: ['All Monthly Perks', 'Instant 5,000 Bonus Coins', 'Exclusive Future Soldier Cyber Armor', 'VIP Golden Score Aura'],
  },
  neon_lifetime: {
    id: 'neon_lifetime',
    title: 'Founder Lifetime Pass',
    priceString: '$39.99 once',
    period: 'lifetime',
    savings: 'BEST VALUE',
    perks: ['Lifetime Access', 'All Future DLC & Characters', '10,000 Bonus Coins', 'Founders Neon Halo Effect'],
  },
};

class SubscriptionManager {
  private premiumActive = false;
  private listeners: Array<(isPremium: boolean) => void> = [];

  constructor() {
    // Check initial state from storage if available
    try {
      const saved = localStorage.getItem('neon_rush_premium');
      if (saved === 'true') {
        this.premiumActive = true;
      }
    } catch {
      // Ignore
    }
  }

  public isPremium(): boolean {
    return this.premiumActive;
  }

  public getOfferings(): SubscriptionOffering[] {
    return Object.values(STORE_PRODUCTS);
  }

  public async purchase(productId: string): Promise<boolean> {
    analytics.track('purchase_started', { productId });

    // Simulate reliable in-app billing transaction delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    this.premiumActive = true;
    try {
      localStorage.setItem('neon_rush_premium', 'true');
    } catch {
      // Ignore
    }

    analytics.track('purchase_completed', { productId });
    this.notifyListeners();
    return true;
  }

  public async restorePurchases(): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const saved = localStorage.getItem('neon_rush_premium');
      if (saved === 'true') {
        this.premiumActive = true;
        this.notifyListeners();
        return true;
      }
    } catch {
      // Ignore
    }
    return false;
  }

  public addListener(cb: (isPremium: boolean) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notifyListeners() {
    for (const l of this.listeners) {
      l(this.premiumActive);
    }
  }
}

export const subscription = new SubscriptionManager();
