import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaHardHat,
} from "react-icons/fa";

import useToast from "../hooks/useToast";
import { workerLogin } from "../services/workerService";

const WorkerLogin = () => {

  const navigate = useNavigate();

  const { showToast } = useToast();

  const submitLock = useRef(false);

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // VALIDATION MESSAGES
  const fieldMessages = {
    email: "Please enter your email address",
    password: "Please enter your password",
  };

  // HANDLE CHANGE
  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // CLEAR FIELD ERROR
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: "",
      });
    }
  };

  // HANDLE BLUR
  const handleBlur = (e) => {

    const { name, value } = e.target;

    // EMPTY VALIDATION
    if (!value.trim()) {

      setFieldErrors((prev) => ({
        ...prev,
        [name]: fieldMessages[name],
      }));

      return;
    }

    // EMAIL VALIDATION
    if (name === "email") {

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(value)) {

        setFieldErrors((prev) => ({
          ...prev,
          email: "Please enter a valid email address",
        }));
      }
    }

    // PASSWORD VALIDATION
    if (
      name === "password" &&
      value.length < 8
    ) {

      setFieldErrors((prev) => ({
        ...prev,
        password:
          "Password must be at least 8 characters",
      }));
    }
  };

  // HANDLE SUBMIT
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (submitLock.current) return;

    const errors = {};

    // EMAIL
    if (!formData.email.trim()) {
      errors.email = fieldMessages.email;
    }

    // PASSWORD
    if (!formData.password.trim()) {
      errors.password = fieldMessages.password;
    }

    // SHOW ERRORS
    if (Object.keys(errors).length > 0) {

      setFieldErrors(errors);

      return;
    }

    try {

      submitLock.current = true;

      setLoading(true);

      setError("");

      // LOGIN API
      const response = 
        await workerLogin(formData);

      // STORE SESSION under the canonical key used by apiClient & AuthContext
      if (response?.token && response?.worker) {

        localStorage.setItem(
          "fixnearby_user",
          JSON.stringify({
            _id: response.worker._id,
            name: response.worker.name,
            email: response.worker.email,
            phone: response.worker.phone,
            token: response.token,
          })
        );
      }

      showToast("Worker login successful!");

      // REDIRECT
      if (response?.worker?._id) {

        navigate(`/worker/${response.worker._id}`);

      } else {

        navigate("/dashboard");
      }

    } catch (err) {

      setError(
        err.message || "Invalid email or password"
      );

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
        <div className="h-2 bg-blue-600 w-full" />

        <div className="p-8">

          {/* HEADER */}
          <div className="text-center mb-8">

            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">

              <FaHardHat className="text-blue-600 text-3xl" />

            </div>

            <h2 className="text-4xl font-extrabold text-[#111827]">
              Worker Login
            </h2>

            <p className="text-gray-500 mt-2 text-sm">
              Login to manage your worker profile
            </p>

          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

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
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass}
                />

                <button
                  type="button"
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

              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.password}
                </p>
              )}

            </div>

            {/* FORGOT PASSWORD */}
            <div className="flex justify-end">

              <button
                type="button"
                className="
                  text-sm
                  text-blue-600
                  hover:text-blue-700
                  font-medium
                  transition-all
                "
              >
                Forgot Password?
              </button>

            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
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
                ? "Logging in..."
                : "Login as Worker"}

            </button>

            {/* REGISTER */}
            <p className="text-center text-sm text-gray-400 pt-2">

              Don't have a worker account?{" "}

              <span
                onClick={() =>
                  navigate("/worker/register")
                }
                className="
                  text-blue-600
                  font-semibold
                  hover:text-blue-700
                  transition-all
                  duration-200
                  cursor-pointer
                "
              >
                Register
              </span>

            </p>

          </form>

        </div>
      </div>
    </div>
  );
};

export default WorkerLogin;