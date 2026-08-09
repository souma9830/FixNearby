import React from 'react';
import { Ticket, Gift, Sparkles, CheckCircle } from 'lucide-react';

const LoyaltyVoucherCatalog = ({ pointsBalance = 450, onRedeem }) => {
  const tiers = [
    { points: 100, discount: 10, title: '$10 Off Any Service' },
    { points: 250, discount: 30, title: '$30 Off Home Maintenance' },
    { points: 500, discount: 70, title: '$70 Premium Service Credit' }
  ];

  return (
    <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Gift className="w-6 h-6 text-amber-400" /> Reward Redemption Center
          </h2>
          <p className="text-sm text-slate-400 mt-1">Convert earned loyalty points into instant service discount vouchers</p>
        </div>
        <div className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl font-bold text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" /> {pointsBalance} Points
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier, idx) => {
          const canAfford = pointsBalance >= tier.points;
          return (
            <div key={idx} className={`p-4 rounded-xl border flex flex-col justify-between ${canAfford ? 'bg-slate-800 border-slate-700' : 'bg-slate-800/40 border-slate-800 opacity-60'}`}>
              <div>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">{tier.points} PTS</span>
                <h3 className="text-lg font-bold mt-1 text-slate-100">{tier.title}</h3>
                <p className="text-2xl font-black text-emerald-400 mt-2">${tier.discount} SAVINGS</p>
              </div>
              <button
                disabled={!canAfford}
                onClick={() => onRedeem && onRedeem(tier)}
                className={`mt-4 w-full py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${canAfford ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold hover:brightness-110' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
              >
                <Ticket className="w-4 h-4" /> {canAfford ? 'Redeem Voucher' : 'Need More Points'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LoyaltyVoucherCatalog;
