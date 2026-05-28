import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState([
    { label: "Total Bookings", value: "0" },
    { label: "Active Jobs", value: "0" },
    { label: "Completed", value: "0" },
    { label: "Rating", value: "5.0/5" },
  ]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    try {
      const savedBookings = JSON.parse(localStorage.getItem("bookings")) || [];
      setBookings(savedBookings);

      const total = savedBookings.length;
      const active = savedBookings.filter(b => b.status === "Pending" || b.status === "Confirmed").length;
      const completed = savedBookings.filter(b => b.status === "Completed").length;

      setStats([
        { label: "Total Bookings", value: total.toString() },
        { label: "Active Jobs", value: active.toString() },
        { label: "Completed", value: completed.toString() },
        { label: "Rating", value: total > 0 ? "4.9/5" : "5.0/5" },
      ]);
    } catch (error) {
      console.error("Failed to load dashboard stats", error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              User Dashboard
            </h1>
            <p className="mt-2 text-slate-600">
              Manage your bookings, track progress, and review recent activity.
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-primary hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-100 transition-all duration-200 self-start md:self-auto"
          >
            Book New Service
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="mb-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Bookings Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Recent Bookings & Activity</h2>
          <p className="mt-2 text-slate-600 text-sm">
            This is your personal activity panel. Live bookings and service history are displayed below.
          </p>

          {bookings.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
              <p className="font-medium text-slate-700">No active bookings yet.</p>
              <p className="mt-1 text-sm text-slate-500">
                Book a service to start tracking updates from your dashboard.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all duration-200 gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold shrink-0">
                      🛠️
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{booking.service}</h4>
                      <p className="text-sm text-slate-500 font-medium mt-0.5">
                        Worker: {booking.worker}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-medium">
                        <span>📅 {booking.date}</span>
                        <span>⏰ {booking.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-slate-900">{booking.price}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "Pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
              {bookings.length > 5 && (
                <div className="text-center pt-2">
                  <Link to="/bookings" className="text-sm font-semibold text-primary hover:underline">
                    View all bookings ({bookings.length})
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
