import  { useState } from 'react';

const WorkerBookingCalendar = ({ onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleDayClick = (day) => {
    setSelectedDay(day);
    if (onDateSelect) {
      const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      onDateSelect(selected);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-gray-800 dark:text-white">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="space-x-2">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-300 transition"
            aria-label="Previous month"
          >
            &lt;
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-300 transition"
            aria-label="Next month"
          >
            &gt;
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-400 mb-3">
        <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => (
          <button
            key={day}
            onClick={() => handleDayClick(day)}
            className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition cursor-pointer ${
              selectedDay === day
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600'
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WorkerBookingCalendar;
