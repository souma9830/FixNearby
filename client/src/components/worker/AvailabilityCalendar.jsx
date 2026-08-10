import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import calendarService from '../../services/calendarService';

const AvailabilityCalendar = ({ schedule = [], onUpdateSchedule }) => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isRecurring, setIsRecurring] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg('');

    if (startTime >= endTime) {
      setError('End time must be after start time.');
      return;
    }

    try {
      setLoading(true);
      const newSlot = { day: selectedDay, startTime, endTime, isRecurring };
      const updatedSlots = await calendarService.addAvailabilitySlot(newSlot);
      setSuccessMsg(`Successfully added slot for ${selectedDay}!`);
      if (onUpdateSchedule) onUpdateSchedule(updatedSlots);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add availability slot.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSlot = async (slotId) => {
    try {
      setLoading(true);
      const updatedSlots = await calendarService.removeAvailabilitySlot(slotId);
      setSuccessMsg('Slot removed successfully.');
      if (onUpdateSchedule) onUpdateSchedule(updatedSlots);
    } catch (err) {
      setError('Failed to remove availability slot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Interactive Availability Calendar</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Configure weekly booking slots and work hours</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleAddSlot} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">Day of Week</label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
          >
            {daysOfWeek.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Time Slot
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Configured Slots ({schedule.length})</h4>
        {schedule.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">No custom availability slots set yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {schedule.map((slot, index) => (
              <div key={slot._id || index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/40 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-white text-sm">{slot.day}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">{slot.startTime} - {slot.endTime}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveSlot(slot._id)}
                  disabled={loading}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
