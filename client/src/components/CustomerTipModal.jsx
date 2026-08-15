import  { useState } from 'react';

const CustomerTipModal = ({ onTipSuccess, onClose }) => {
  const [tipAmount, setTipAmount] = useState(10);
  const [customTip, setCustomTip] = useState('');
  const [message, setMessage] = useState('');

  const handlePreset = (amount) => {
    setTipAmount(amount);
    setCustomTip('');
  };

  const finalAmount = customTip ? Number(customTip) : tipAmount;

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Show Appreciation with a Tip</h3>
      <p className="text-sm text-gray-500 mb-4">100% of your tip goes directly to the worker.</p>

      <div className="flex gap-3 mb-4">
        {[5, 10, 20, 50].map((amt) => (
          <button
            key={amt}
            onClick={() => handlePreset(amt)}
            className={`flex-1 py-2 rounded-lg font-semibold border ${finalAmount === amt ? 'bg-indigo-600 text-white' : 'bg-gray-50 dark:bg-gray-700'}`}
          >
            ${amt}
          </button>
        ))}
      </div>

      <input
        type="number"
        placeholder="Or enter custom tip amount"
        value={customTip}
        onChange={(e) => setCustomTip(e.target.value)}
        className="w-full p-2.5 border rounded-lg mb-4 text-sm bg-gray-50 dark:bg-gray-700"
      />

      <textarea
        placeholder="Add a thank you note (optional)..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full p-2.5 border rounded-lg mb-4 text-sm bg-gray-50 dark:bg-gray-700"
        rows="2"
      />

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:underline">
          Cancel
        </button>
        <button
          onClick={() => onTipSuccess && onTipSuccess({ tipAmount: finalAmount, message })}
          className="px-5 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Send ${finalAmount} Tip
        </button>
      </div>
    </div>
  );
};

export default CustomerTipModal;
