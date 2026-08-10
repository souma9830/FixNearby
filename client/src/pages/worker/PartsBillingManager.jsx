import React, { useState } from 'react';
import { Package, Plus, Trash2, DollarSign, CheckCircle } from 'lucide-react';
import { submitPartsInvoice } from '../../services/partsBillingService';

const PartsBillingManager = ({ bookingId }) => {
  const [items, setItems] = useState([{ itemName: '', quantity: 1, unitCostUSD: '' }]);
  const [markup, setMarkup] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const handleAddItem = () => {
    setItems([...items, { itemName: '', quantity: 1, unitCostUSD: '' }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const calculateTotal = () => {
    const rawSum = items.reduce((acc, curr) => acc + Number(curr.quantity || 0) * Number(curr.unitCostUSD || 0), 0);
    return Math.round(rawSum * (1 + markup / 100));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitPartsInvoice({
        bookingId,
        items,
        totalMaterialCostUSD: calculateTotal()
      });
      setMsg('Parts invoice submitted for customer review!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Invoice submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md space-y-4">
      <div className="flex items-center justify-between border-b pb-3 dark:border-slate-700">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <Package className="w-5 h-5 text-indigo-500" /> Parts & Equipment Billing
        </h2>
        <span className="text-xs bg-indigo-50 text-indigo-700 font-extrabold px-2.5 py-1 rounded-full">Itemized Line Billing</span>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 font-bold rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input type="text" placeholder="Part description (e.g. Copper Pipe 1/2in)" required value={item.itemName} onChange={(e) => handleChange(index, 'itemName', e.target.value)} className="flex-2 p-2.5 rounded-xl border text-xs dark:bg-slate-900" />
            <input type="number" placeholder="Qty" min="1" required value={item.quantity} onChange={(e) => handleChange(index, 'quantity', e.target.value)} className="w-16 p-2.5 rounded-xl border text-xs dark:bg-slate-900" />
            <input type="number" placeholder="Unit $" min="0.1" step="0.01" required value={item.unitCostUSD} onChange={(e) => handleChange(index, 'unitCostUSD', e.target.value)} className="w-24 p-2.5 rounded-xl border text-xs dark:bg-slate-900" />
            {items.length > 1 && (
              <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={handleAddItem} className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Add Another Part
        </button>

        <div className="pt-3 border-t flex justify-between items-center dark:border-slate-700">
          <span className="font-extrabold text-slate-900 dark:text-white text-base">Total Cost: ${calculateTotal()}</span>
          <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition">
            {submitting ? 'Submitting...' : 'Submit Parts Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PartsBillingManager;
