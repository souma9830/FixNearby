import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaBriefcase,
  FaStar,
  FaMapMarkerAlt,
  FaPhone,
  FaFileAlt,
  FaCamera,
} from "react-icons/fa";

import { workerSignup } from "../services/workerService";
import useToast from "../hooks/useToast";
import { validateEmail, validatePassword, getPasswordStrength } from "../utils/clientValidation";

const WorkerRegister = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const submitLock = useRef(false);

  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    category: "",
    experience: "",
    location: "",
    contact: "",
    bio: "",
    profilePicture: null,
    termsAccepted: false,
  });

  const [loading, setLoading] = useState(false);
  const [docVerificationStatus, setDocVerificationStatus] = useState("pending");

  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});

  // VALIDATION MESSAGES
  const fieldMessages = {
    name: "Please enter your full name",
    email: "Please enter your email address",
    password: "Please enter your password",
    category: "Please select a service category",
    experience: "Please enter your years of experience",
    location: "Please enter your location",
    contact: "Please enter a valid 10-digit phone number",
    bio: "Please enter your bio",
    profilePicture: "Please upload your profile picture",
  };

  const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);

  const passwordStrength = getPasswordStrength(formData.password);

  // HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    // FILE
    if (type === "file") {
      const file = files[0];

      setFormData({
        ...formData,
        profilePicture: file,
      });

      if (file) {
        setImagePreview(URL.createObjectURL(file));

        setFieldErrors((prev) => ({
          ...prev,
          profilePicture: "",
        }));
      }

      return;
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: "",
      });
    }
  };

  // HANDLE BLUR
  const handleBlur = (e) => {
    const { name, value, type, files } = e.target;

    // FILE VALIDATION
    if (type === "file") {
      if (!files[0]) {
        setFieldErrors((prev) => ({
          ...prev,
          profilePicture: fieldMessages.profilePicture,
        }));
      }

      return;
    }

    // EMPTY VALIDATION
    if (!value.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: fieldMessages[name],
      }));

      return;
    }

    if (name === "email") {
      const msg = validateEmail(value);
      if (msg) {
        setFieldErrors((prev) => ({ ...prev, email: msg }));
      }
    }

    if (name === "password") {
      const msg = validatePassword(value);
      if (msg) {
        setFieldErrors((prev) => ({ ...prev, password: msg }));
      }
    }

    // PHONE VALIDATION
    if (name === "contact" && !validatePhone(value)) {
      setFieldErrors((prev) => ({
        ...prev,
        contact: "Phone number must contain exactly 10 digits",
      }));
    }

    // BIO VALIDATION
    if (name === "bio" && value.length < 20) {
      setFieldErrors((prev) => ({
        ...prev,
        bio: "Bio should contain at least 20 characters",
      }));
    }
  };

  // HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitLock.current) return;

    // FINAL VALIDATION
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = fieldMessages.name;
    }

    if (!formData.email.trim()) {
      errors.email = fieldMessages.email;
    }

    if (!formData.password.trim()) {
      errors.password = fieldMessages.password;
    }

    if (!formData.category.trim()) {
      errors.category = fieldMessages.category;
    }

    if (!formData.experience.trim()) {
      errors.experience = fieldMessages.experience;
    }

    if (!formData.location.trim()) {
      errors.location = fieldMessages.location;
    } else if (formData.location.includes(",")) {
      const parts = formData.location.split(",").map((p) => parseFloat(p.trim()));
      if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
        errors.location = "If entering coordinates, use format: latitude, longitude";
      } else {
        const [lat, lng] = parts;
        if (!isValidCoordinates(lat, lng)) {
          errors.location = "Invalid coordinates. Latitude [-90, 90], Longitude [-180, 180]";
        }
      }
    }

    if (!validatePhone(formData.contact)) {
      errors.contact =
        "Phone number must contain exactly 10 digits";
    }

    if (!formData.bio.trim()) {
      errors.bio = fieldMessages.bio;
    }

    if (!formData.profilePicture) {
      errors.profilePicture =
        fieldMessages.profilePicture;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      submitLock.current = true;

      setLoading(true);

      setError("");

      const payload = new FormData();

      let finalLocation = formData.location;
      if (formData.location.includes(",")) {
        const [lat, lng] = formData.location.split(",").map((p) => parseFloat(p.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          finalLocation = JSON.stringify({
            type: "Point",
            coordinates: [lng, lat],
          });
        }
      }

      Object.keys(formData).forEach((key) => {
        if (key === "location") {
          payload.append(key, finalLocation);
        } else {
          payload.append(key, formData[key]);
        }
      });

      await workerSignup(payload);

      showToast("Worker registered successfully!");

      navigate("/dashboard");

    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
      submitLock.current = false;
    }
  };

  // INPUT STYLE
  const inputClass = `
    w-full
    bg-gray-50
    border
    border-gray-200
    rounded-xl
    py-3
    pl-12
    pr-4
    text-sm
    text-gray-700
    focus:outline-none
    focus:ring-2
    focus:ring-blue-500
    transition-all
    duration-200
  `;

  return (
    <div className="min-h-screen bg-[#f4f7fc] flex items-center justify-center px-4 py-12">

      <div className="w-full max-w-md bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">

        {/* TOP BAR */}
        <div className="h-2 bg-blue-500 w-full" />

        <div className="p-7">

          {/* HEADER */}
          <div className="text-center mb-7">
            <h2 className="text-4xl font-extrabold text-[#111827]">
              Become a Worker
            </h2>

            <p className="text-gray-500 mt-2 text-sm">
              Register your service profile on FixNearby
            </p>
          </div>

          {/* IMAGE UPLOAD */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">

            <div className="flex items-center gap-4">

              {/* IMAGE PREVIEW */}
              <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-white">

                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-gray-300 text-2xl" />
                )}

              </div>

              {/* BUTTON */}
              <div>
                <label className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl cursor-pointer flex items-center gap-2 text-sm font-semibold hover:bg-blue-100 transition-all">

                  <FaCamera />

                  Upload Photo

                  <input
                    type="file"
                    accept="image/*"
                    name="profilePicture"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    hidden
                  />
                </label>

                <p className="text-xs text-gray-400 mt-2">
                  JPG, PNG — up to 5 MB
                </p>

                {fieldErrors.profilePicture && (
                  <p className="text-red-500 text-xs mt-2">
                    {fieldErrors.profilePicture}
                  </p>
                )}

              </div>

            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ACCOUNT SECTION */}
            <div>

              <p className="text-xs font-bold tracking-[2px] text-gray-400 uppercase mb-4">
                Account Credentials
              </p>

              <div className="space-y-4">

                {/* NAME */}
                <div>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-4 text-gray-400" />

                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass}
                    />
                  </div>

                  {fieldErrors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* EMAIL */}
                <div>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-4 text-gray-400" />

                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass}
                    />
                  </div>

                  {fieldErrors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* PASSWORD */}
                <div>

                  <div className="relative">
                    <FaLock className="absolute left-4 top-4 text-gray-400" />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password (min. 6 chars)"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass}
                    />

                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-4 top-4 text-gray-400"
                    >
                      {showPassword
                        ? <FaEyeSlash />
                        : <FaEye />}
                    </button>
                  </div>

                  {fieldErrors.password ? (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.password}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-[11px] mt-1">
                      Must contain at least 6 characters, including 1 uppercase, 1 lowercase and 1 number.
                    </p>
                  )}

                  {formData.password.length > 0 && (
                    <div className="mt-2">
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`} />
                      </div>
                      <p className={`text-sm mt-2 font-medium ${passwordStrength.color.split(' ')[0]}`}>
                        {passwordStrength.label} Password
                      </p>
                    </div>
                  )}

                </div>

              </div>
            </div>

            {/* PROFESSIONAL DETAILS */}
            <div>

              <p className="text-xs font-bold tracking-[2px] text-gray-400 uppercase mb-4">
                Professional Details
              </p>

              <div className="space-y-4">

                {/* CATEGORY */}
                <div>
                  <div className="relative">
                    <FaBriefcase className="absolute left-4 top-4 text-gray-400" />

                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="">
                        Select Service Category
                      </option>

                      <option value="Electrician">
                        Electrician
                      </option>

                      <option value="Plumber">
                        Plumber
                      </option>

                      <option value="Carpenter">
                        Carpenter
                      </option>

                      <option value="Painter">
                        Painter
                      </option>

                      <option value="Cleaner">
                        Cleaner
                      </option>

                    </select>
                  </div>

                  {fieldErrors.category && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.category}
                    </p>
                  )}
                </div>

                {/* EXPERIENCE */}
                <div>
                  <div className="relative">
                    <FaStar className="absolute left-4 top-4 text-gray-400" />

                    <input
                      type="number"
                      name="experience"
                      placeholder="Years of Experience"
                      value={formData.experience}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass}
                    />
                  </div>

                  {fieldErrors.experience && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.experience}
                    </p>
                  )}
                </div>

                {/* LOCATION */}
                <div>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-4 top-4 text-gray-400" />

                    <input
                      type="text"
                      name="location"
                      placeholder="Location"
                      value={formData.location}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass}
                    />
                  </div>

                  {fieldErrors.location && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.location}
                    </p>
                  )}
                </div>

                {/* CONTACT */}
                <div>
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-4 text-gray-400" />

                    <input
                      type="tel"
                      name="contact"
                      placeholder="Contact Number (10 digits)"
                      value={formData.contact}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass}
                    />
                  </div>

                  {fieldErrors.contact && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.contact}
                    </p>
                  )}
                </div>

                {/* BIO */}
                <div>

                  <div className="relative">
                    <FaFileAlt className="absolute left-4 top-4 text-gray-400" />

                    <textarea
                      name="bio"
                      rows="4"
                      maxLength="250"
                      placeholder="Bio / About Me"
                      value={formData.bio}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${inputClass} resize-none pt-3`}
                    />
                  </div>

                  <div className="text-right text-xs text-gray-400 mt-1">
                    {formData.bio.length} / 250
                  </div>

                  {fieldErrors.bio && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.bio}
                    </p>
                  )}

                </div>

              </div>
            </div>

            {/* TERMS */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-start gap-3">

              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="mt-1"
              />

              <p className="text-sm text-gray-600 leading-relaxed">
                I agree to the{" "}

                <span className="text-blue-600 font-medium cursor-pointer">
                  Terms & Conditions
                </span>

                {" "}and{" "}

                <span className="text-blue-600 font-medium cursor-pointer">
                  Privacy Policy
                </span>

              </p>

            </div>

            {/* GLOBAL ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading || !formData.termsAccepted}
              className="
                w-full
                bg-blue-600
                hover:bg-blue-700
                text-white
                font-semibold
                py-4
                rounded-2xl
                transition-all
                duration-300
                shadow-lg
                hover:shadow-xl
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >

              {loading
                ? "Registering..."
                : "Register as Worker"}

            </button>

            {/* LOGIN */}
            <p className="text-center text-sm text-gray-400 pt-2">

              Already have an account?{" "}

              <button
                    type="button"
                    onClick={() => navigate("/worker/login")}
                    className="
                      text-blue-600
                      font-semibold
                      hover:text-blue-700
                      transition-all
                      duration-200
                      cursor-pointer
                    "
                  >
                    Sign in
                </button>

            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkerRegister;