import React, { useState } from 'react';
import { DollarSign, Heart, Sparkles, Send } from 'lucide-react';

const CustomerTipSelector = ({ onTipSubmit }) => {
  const [selectedTip, setSelectedTip] = useState(5);
  const [customTip, setCustomTip] = useState('');

  const handleSelect = (amount) => {
    setSelectedTip(amount);
    setCustomTip('');
  };

  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center space-x-2 text-rose-500">
        <Heart className="w-5 h-5 fill-current" />
        <h3 className="font-bold text-slate-800 dark:text-slate-100">Add a Gratuity Tip for Great Service</h3>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[5, 10, 15, 20].map((amount) => (
          <button
            key={amount}
            onClick={() => handleSelect(amount)}
            className={`py-2 px-3 rounded-xl font-bold text-sm border transition ${selectedTip === amount ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'}`}
          >
            ${amount}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CustomerTipSelector;
