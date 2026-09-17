import React, { useState } from 'react';
import {
  X,
  Crown,
  Check,
  Sparkles,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { subscription, SubscriptionOffering } from '../services/subscription';
import { sound } from '../services/audio';
import confetti from 'canvas-confetti';

interface NeonPassModalProps {
  isPremium: boolean;
  onClose: () => void;
  onPurchased: () => void;
}

export const NeonPassModal: React.FC<NeonPassModalProps> = ({
  isPremium,
  onClose,
  onPurchased,
}) => {
  const offerings = subscription.getOfferings();
  const [selectedProduct, setSelectedProduct] = useState<SubscriptionOffering>(offerings[1] || offerings[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    setIsProcessing(true);
    sound.playButtonClick();

    const success = await subscription.purchase(selectedProduct.id);
    setIsProcessing(false);

    if (success) {
      sound.playLevelUp();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#ec4899', '#06b6d4'],
      });
      onPurchased();
    }
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    const restored = await subscription.restorePurchases();
    setIsProcessing(false);
    if (restored) {
      sound.playLevelUp();
      onPurchased();
    } else {
      alert('No previous purchases found to restore.');
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 z-50 bg-slate-950/90 backdrop-blur-md select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-amber-400/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.2)] flex flex-col max-h-[90vh] overflow-hidden relative">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <Crown className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
                <span>NEON PASS VIP</span>
                {isPremium && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                    ACTIVE
                  </span>
                )}
              </h2>
              <p className="text-xs text-amber-300/80">
                Centralized RevenueCat entitlement
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

        {/* SUBSCRIPTION PACKAGES */}
        <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {offerings.map((offering) => {
              const isSelected = selectedProduct.id === offering.id;
              return (
                <button
                  key={offering.id}
                  onClick={() => {
                    sound.playButtonClick();
                    setSelectedProduct(offering);
                  }}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
                    isSelected
                      ? 'bg-amber-950/30 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {offering.popular && (
                    <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded bg-rose-500 text-white text-[9px] font-black uppercase">
                      POPULAR
                    </span>
                  )}
                  {offering.savings && (
                    <span className="text-[10px] font-black text-amber-400">
                      {offering.savings}
                    </span>
                  )}
                  <div>
                    <h3 className="font-bold text-white text-xs mt-1">
                      {offering.title}
                    </h3>
                    <p className="text-sm font-black text-amber-300 mt-0.5">
                      {offering.priceString}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* PERKS CHECKLIST */}
          <div className="bg-slate-850/60 border border-slate-800 rounded-2xl p-4 mt-2">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Included VIP Entitlements</span>
            </h4>
            <div className="space-y-2">
              {selectedProduct.perks.map((perk, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs text-slate-200">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PURCHASE & RESTORE ACTIONS */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          {isPremium ? (
            <div className="py-3 px-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 font-bold text-center text-xs">
              ✓ All Neon Pass privileges are currently active on this account!
            </div>
          ) : (
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:opacity-95 text-slate-950 font-black text-sm uppercase flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 transition"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>
                {isProcessing ? 'Verifying with Store...' : `Activate ${selectedProduct.title}`}
              </span>
            </button>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleRestore}
              disabled={isProcessing}
              className="flex items-center space-x-1 text-[11px] text-slate-500 hover:text-slate-300 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restore Purchases</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
