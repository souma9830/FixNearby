import  { useState } from 'react';
import { Calendar, CheckCircle } from 'lucide-react';
import { addAvailabilitySlot, updateCalendarSettings } from '../../services/calendarService';

const AvailabilityCalendar = () => {
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [maxBookings, setMaxBookings] = useState(6);
  const [buffer, setBuffer] = useState(30);
  const [msg, setMsg] = useState('');

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      await addAvailabilitySlot({ day, startTime, endTime, isRecurring: true });
      setMsg(`Recurring shift added for ${day} (${startTime} - ${endTime})`);
    } catch (err) {
      setMsg('Failed to add schedule slot');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateCalendarSettings({ maxBookingsPerDay: Number(maxBookings), bufferMinutes: Number(buffer) });
      setMsg('Shift buffer and daily booking limit saved!');
    } catch (err) {
      setMsg('Failed to update settings');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-emerald-700 to-teal-600 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Calendar className="w-7 h-7 text-emerald-200" /> Multi-Shift Availability & Capacity Manager
          </h1>
          <p className="text-xs text-emerald-100 mt-1">Set custom weekly shifts and job buffer times.</p>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 font-bold rounded-2xl flex items-center gap-2 border border-emerald-200 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600" /> {msg}
        </div>
      )}

      <form onSubmit={handleAddSlot} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Add Recurring Working Shift</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">Day of Week</label>
            <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full p-2.5 rounded-xl border text-xs dark:bg-slate-900">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Start Time</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full p-2.5 rounded-xl border text-xs dark:bg-slate-900" />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">End Time</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full p-2.5 rounded-xl border text-xs dark:bg-slate-900" />
          </div>
        </div>

        <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition">
          Add Working Shift
        </button>
      </form>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Capacity & Travel Buffer Rules</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">Max Bookings Per Day</label>
            <input type="number" min="1" max="15" value={maxBookings} onChange={(e) => setMaxBookings(e.target.value)} className="w-full p-2.5 rounded-xl border text-xs dark:bg-slate-900" />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Buffer Between Jobs (Minutes)</label>
            <input type="number" min="0" max="120" value={buffer} onChange={(e) => setBuffer(e.target.value)} className="w-full p-2.5 rounded-xl border text-xs dark:bg-slate-900" />
          </div>
        </div>

        <button type="button" onClick={handleSaveSettings} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition">
          Save Capacity Rules
        </button>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
