import  { useState } from 'react';
import { Heart, CheckCircle } from 'lucide-react';
import { submitPostJobTip } from '../../services/gratuityBonusService';

const TipAndBonusModal = ({ bookingId, workerId }) => {
  const [tipAmount, setTipAmount] = useState(15);
  const [customTip, setCustomTip] = useState('');
  const [compliments, setCompliments] = useState(['Punctual', 'Expert Skill']);
  const [note] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const availableTags = ['Punctual', 'Clean Work', 'Polite', 'Expert Skill', 'Above & Beyond'];

  const toggleTag = (tag) => {
    setCompliments(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const getFinalAmount = () => customTip ? Number(customTip) : tipAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitPostJobTip({
        bookingId,
        workerId,
        tipAmountUSD: getFinalAmount(),
        complimentTags: compliments,
        customerNote: note
      });
      setMsg(`Thank you! $${getFinalAmount()} tip sent directly to worker earnings.`);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Tip submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl space-y-5">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 bg-pink-100 dark:bg-pink-950 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <Heart className="w-6 h-6 fill-pink-600" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Leave a Tip & Compliment</h2>
        <p className="text-xs text-slate-500">100% of your tip goes directly to the service provider.</p>
      </div>

      {msg ? (
        <div className="p-4 bg-emerald-50 text-emerald-800 font-bold rounded-2xl text-xs text-center space-y-2">
          <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" />
          <p>{msg}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[10, 15, 25].map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => { setTipAmount(amt); setCustomTip(''); }}
                className={`py-2.5 rounded-xl font-extrabold text-xs border transition ${tipAmount === amt && !customTip ? 'bg-pink-600 text-white border-pink-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'}`}
              >
                ${amt}
              </button>
            ))}
          </div>

          <input
            type="number"
            min="1"
            placeholder="Or enter custom tip ($)..."
            value={customTip}
            onChange={(e) => setCustomTip(e.target.value)}
            className="w-full p-2.5 rounded-xl border text-xs dark:bg-slate-900"
          />

          <div>
            <label className="block text-xs font-bold mb-1">Add Compliments</label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border transition ${compliments.includes(tag) ? 'bg-indigo-100 text-indigo-800 border-indigo-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs transition">
            {submitting ? 'Sending Tip...' : `Send $${getFinalAmount()} Tip`}
          </button>
        </form>
      )}
    </div>
  );
};

export default TipAndBonusModal;
