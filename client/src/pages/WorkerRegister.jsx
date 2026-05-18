import { useState } from "react";
import { workerSignup } from "../services/workerService";
import useToast from "../hooks/useToast";

const WorkerRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    experience: "",
    location: "",
    contact: "",
  });
  const {showToast}=useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if(error) setError("");
    if(fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
  };

  const fieldMessages = {
    name: "Please enter your full name",
    category: "Please select a service category",
    experience: "Please enter your years of experience",
    location: "Please enter your location",
    contact: "Please enter your contact number",
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value.trim()) {
      setFieldErrors((prev) => ({ ...prev, [name]: fieldMessages[name] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const workerData = await workerSignup(formData);

      showToast("Worker registered successfully!");

      setFormData({
        name: "",
        category: "",
        experience: "",
        location: "",
        contact: "",
      });
      setFieldErrors({});

    } catch (err) {
      setError(err.message || "Worker Registration failed, Try again");
    } finally {
      setLoading(false);
    }
  };

  //                 INPUT STYLE
  const inputStyles = `appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`;

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Become a Worker
          </h2>

          <p className="mt-2 text-center text-sm text-gray-600">
            Register your service profile
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

          <div className="flex flex-col gap-4">

            {/* Name */}
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={inputStyles}
              />
              {fieldErrors.name && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={inputStyles}
              >
                <option value="">Select Service Category</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Painter">Painter</option>
                <option value="AC Technician">AC Technician</option>
                <option value="Cleaner">Cleaner</option>
                <option value="Mechanic">Mechanic</option>
                <option value="Gardener">Gardener</option>
                <option value="Appliance Repair">Appliance Repair</option>
                <option value="Pest Control">Pest Control</option>
              </select>
              {fieldErrors.category && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.category}</p>
              )}
            </div>

            {/* Experience */}
            <div>
              <input
                type="number"
                min="0"
                name="experience"
                placeholder="Experience (e.g. 3 years)"
                value={formData.experience}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={inputStyles}
              />
              {fieldErrors.experience && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.experience}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={inputStyles}
              />
              {fieldErrors.location && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.location}</p>
              )}
            </div>

            {/* Contact */}
            <div>
              <input
                type="tel"
                name="contact"
                placeholder="Contact Number"
                value={formData.contact}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={inputStyles}
              />
              {fieldErrors.contact && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.contact}</p>
              )}
            </div>

          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="text-green-600 text-sm text-center">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? "Registering..." : "Register as Worker"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default WorkerRegister;