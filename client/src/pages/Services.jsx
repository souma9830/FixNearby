import { useState } from "react";
import { Link } from "react-router-dom";

const Services = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const dummyWorkers = [
    { id: 1, name: "John Doe", profession: "Electrician", rating: 4.8, price: "$40/hr" },
    { id: 2, name: "Jane Smith", profession: "Plumber", rating: 4.9, price: "$50/hr" },
    { id: 3, name: "Mike Johnson", profession: "Carpenter", rating: 4.5, price: "$35/hr" },
  ];

  // 🔍 Filter Logic
  const filteredWorkers = dummyWorkers.filter((worker) => {
    return (
      (category === "All" || worker.profession === category) &&
      worker.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  const categories = ["All", "Electrician", "Plumber", "Carpenter"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Available Workers Nearby
      </h1>

      {/* 🔍 Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search for a service..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 🧩 Category Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-md border ${
              category === cat
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 🎴 Worker Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkers.map((worker) => (
          <div
            key={worker.id}
            className="bg-white rounded-lg shadow-md p-6 flex flex-col hover:shadow-xl transition"
          >
            <h3 className="text-xl font-semibold text-gray-900">
              {worker.name}
            </h3>
            <p className="text-blue-600 font-medium">
              {worker.profession}
            </p>

            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
              <span>⭐ {worker.rating}</span>
              <span>{worker.price}</span>
            </div>

            <Link
              to={`/worker/${worker.id}`}
              className="mt-6 w-full text-center bg-gray-100 hover:bg-blue-500 hover:text-white text-gray-800 font-medium py-2 px-4 rounded transition"
            >
              View Profile
            </Link>
          </div>
        ))}
      </div>

      {/* 🚫 Empty State */}
      {filteredWorkers.length === 0 && (
        <p className="text-center text-gray-500 mt-6">
          No services found
        </p>
      )}
    </div>
  );
};

export default Services;