import React from 'react';
import { Package, Plus, AlertCircle, Wrench } from 'lucide-react';

const WorkerEquipmentTracker = ({ items = [] }) => {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Wrench className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Parts & Equipment Stock</h3>
        </div>
        <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Add Part
        </button>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {items.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            No replacement parts or equipment currently tracked in inventory.
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{item.itemName || item.partName}</p>
                <span className="text-xs text-slate-500 capitalize">PN: {item.partNumber || 'N/A'} • {item.category || 'Part'} • ${item.unitPrice}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.stockQuantity <= (item.reorderThreshold || 2) ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                  {item.stockQuantity || 1} units left
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkerEquipmentTracker;

