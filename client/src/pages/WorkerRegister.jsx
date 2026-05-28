import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

const WorkerRegister = () => {
  const { t, i18n } = useTranslation();
  const localizeDigits = (value) => {
    const text = String(value);
    if (i18n.language !== "hi") return text;
    const devanagariDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return text.replace(/\d/g, (d) => devanagariDigits[Number(d)]);
  };
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

  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});

  // VALIDATION MESSAGES
  const fieldMessages = {
    name: t("workerRegister.validation.enterFullName"),
    email: t("workerRegister.validation.enterEmail"),
    password: t("workerRegister.validation.enterPassword"),
    category: t("workerRegister.validation.selectCategory"),
    experience: t("workerRegister.validation.enterExperience"),
    location: t("workerRegister.validation.enterLocation"),
    contact: t("workerRegister.validation.enterValidContact"),
    bio: t("workerRegister.validation.enterBio"),
    profilePicture: t("workerRegister.validation.uploadProfilePicture"),
  };

  // PHONE VALIDATION
  const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);

  // PASSWORD STRENGTH
  const getPasswordStrength = (password) => {

    if (password.length < 6) {
      return "weak";
    }

    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;

    const mediumRegex =
      /^(?=.*[a-z])(?=.*[0-9])/;

    if (
      strongRegex.test(password) &&
      password.length >= 8
    ) {
      return "strong";
    }

    if (
      mediumRegex.test(password) &&
      password.length >= 6
    ) {
      return "medium";
    }

    return "weak";
  };

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

    // EMAIL VALIDATION
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          email: t("workerRegister.validation.enterValidEmail"),
        }));
      }
    }

    // PASSWORD VALIDATION
    if (name === "password" && value.length < 8) {
      setFieldErrors((prev) => ({
        ...prev,
        password: t("workerRegister.validation.passwordMin", { min: localizeDigits(8) }),
      }));
    }

    // PHONE VALIDATION
    if (name === "contact" && !validatePhone(value)) {
      setFieldErrors((prev) => ({
        ...prev,
        contact: t("workerRegister.validation.contactExactDigits", { digits: localizeDigits(10) }),
      }));
    }

    // BIO VALIDATION
    if (name === "bio" && value.length < 20) {
      setFieldErrors((prev) => ({
        ...prev,
        bio: t("workerRegister.validation.bioMin", { min: localizeDigits(20) }),
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
    }

    if (!validatePhone(formData.contact)) {
      errors.contact =
        t("workerRegister.validation.contactExactDigits", { digits: localizeDigits(10) });
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

      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
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
              {t("auth.becomeWorker")}
            </h2>

            <p className="text-gray-500 mt-2 text-sm">
              {t("auth.registerServiceProfile")}
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
                {t("workerRegister.accountCredentials")}
              </p>

              <div className="space-y-4">

                {/* NAME */}
                <div>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-4 text-gray-400" />

                    <input
                      type="text"
                      name="name"
                      placeholder={t("register.fullName")}
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
                      placeholder={t("register.emailAddress")}
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
                      placeholder={t("workerRegister.passwordMinChars", { min: localizeDigits(8) })}
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

                  {/* PASSWORD STRENGTH */}
                  {formData.password.length > 0 && (
                    <div className="mt-2">

                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">

                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            passwordStrength === "weak"
                              ? "bg-red-500 w-1/3"
                              : passwordStrength === "medium"
                              ? "bg-orange-400 w-2/3"
                              : "bg-green-500 w-full"
                          }`}
                        />

                      </div>

                      <p
                        className={`text-sm mt-2 font-medium ${
                          passwordStrength === "weak"
                            ? "text-red-500"
                            : passwordStrength === "medium"
                            ? "text-orange-500"
                            : "text-green-600"
                        }`}
                      >

                        {passwordStrength === "weak" &&
                          "Weak Strength Password"}

                        {passwordStrength === "medium" &&
                          "Medium Strength Password"}

                        {passwordStrength === "strong" &&
                          "Strong Password"}

                      </p>

                    </div>
                  )}

                </div>

              </div>
            </div>

            {/* PROFESSIONAL DETAILS */}
            <div>

              <p className="text-xs font-bold tracking-[2px] text-gray-400 uppercase mb-4">
                {t("workerRegister.professionalDetails")}
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
                        {t("workerRegister.selectServiceCategory")}
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
                      placeholder={t("workerRegister.yearsOfExperience")}
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
                      placeholder={t("workerRegister.location")}
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
                      placeholder={t("workerRegister.contactDigits", { digits: localizeDigits(10) })}
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
                      placeholder={t("workerRegister.bioAboutMe")}
                      value={formData.bio}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${inputClass} resize-none pt-3`}
                    />
                  </div>

                  <div className="text-right text-xs text-gray-400 mt-1">
                    {localizeDigits(formData.bio.length)} / {localizeDigits(250)}
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
                {t("workerRegister.iAgreeTo")} {" "}

                <span className="text-blue-600 font-medium cursor-pointer">
                  {t("workerRegister.termsAndConditions")}
                </span>

                {" "}{t("workerRegister.and")} {" "}

                <span className="text-blue-600 font-medium cursor-pointer">
                  {t("workerRegister.privacyPolicy")}
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
                ? t("workerRegister.registering")
                : t("workerRegister.registerAsWorker")}

            </button>

            {/* LOGIN */}
            <p className="text-center text-sm text-gray-400 pt-2">

              {t("register.alreadyHaveAccount")} {" "}

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
                    {t("register.signIn")}
                </button>

            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkerRegister;