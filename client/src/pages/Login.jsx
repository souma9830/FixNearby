import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authService";
import useToast from "../hooks/useToast";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaSpinner,
} from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [interacted, setInteracted] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ---------------- VALIDATION ----------------

  const validateFields = (name, value) => {
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    switch (name) {
  
    const validateFields=(name,value)=>{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    switch(name){
      case "email":
        if (!value.trim()) return "Email is required";
        if (!emailRegex.test(value))
          return "Please enter a valid email";
        break;

      case "password":
        if (!value.trim()) return "Password is required";
        if (value.length < 6)
          return "Password must be at least 6 characters";
        break;

      default:
        return "";
    }

    return "";
  };

  // ---------------- HANDLE CHANGE ----------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (interacted[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateFields(name, value),
      }));
    }

    if (apiError) setApiError("");
  };

  // ---------------- HANDLE BLUR ----------------

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setInteracted((prev) => ({
      ...prev,
      [name]: true,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateFields(name, value),
    }));
  };

  // ---------------- HANDLE SUBMIT ----------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const touchedFields = {};

    Object.keys(formData).forEach((key) => {
      touchedFields[key] = true;

      const error = validateFields(key, formData[key]);

      if (error) {
        newErrors[key] = error;
      }
    });

    setInteracted(touchedFields);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setApiError("");

    try {
      const userData = await loginUser(formData);

      login(userData);

      showToast("Logged in successfully");

      setFormData({
        email: "",
        password: "",
      });

      navigate("/dashboard");
    } catch (error) {
      setApiError(
        error?.response?.data?.message ||
          error?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------- INPUT STYLES ----------------

  const inputStyles = (field) =>
    `w-full rounded-xl border bg-gray-50 px-12 py-3 text-sm text-gray-800
    transition-all duration-200 outline-none
    placeholder:text-gray-400
    ${
      interacted[field] && errors[field]
        ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100"
        : "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-gray-100">
        {/* Logo / Heading */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white text-2xl font-bold shadow-lg">
            F
          </div>

          <h2 className="text-3xl font-bold text-gray-900">
            Welcome Back
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to continue to your account
          </p>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {apiError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email Address
            </label>

            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your email"
                className={inputStyles("email")}
              />
            </div>

            <div className="min-h-[22px] pt-1 text-sm">
              {interacted.email && errors.email && (
                <span className="text-red-600">
                  {errors.email}
                </span>
              )}
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                className={`${inputStyles("password")} pr-12`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>
            </div>

            <div className="min-h-[22px] pt-1 text-sm">
              {interacted.password && errors.password && (
                <span className="text-red-600">
                  {errors.password}
                </span>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Register */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;