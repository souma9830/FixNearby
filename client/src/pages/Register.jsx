import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaQuestionCircle,
  FaTools,
  FaUser,
  FaPhoneAlt,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaArrowRight,
  FaHeadset,
  FaClock,
  FaShieldAlt,
} from "react-icons/fa";

const helpCards = [
  {
    icon: <FaUser className="text-sky-500 text-3xl" />,
    title: "Account & Profile",
    desc: "Manage your account settings, update your profile, and keep your information secure.",
    link: "/profile",
  },
  {
    icon: <FaTools className="text-emerald-500 text-3xl" />,
    title: "Booking Services",
    desc: "Book trusted workers quickly and track all your services in one place.",
    link: "/services",
  },
  {
    icon: <FaQuestionCircle className="text-violet-500 text-3xl" />,
    title: "Common Questions",
    desc: "Find answers about payments, cancellations, refunds, and app usage.",
    link: "/faq",
  },
  {
    icon: <FaPhoneAlt className="text-rose-500 text-3xl" />,
    title: "Contact Support",
    desc: "Get help from our support team anytime you need assistance.",
    link: "/contact",
  },
];

const faqs = [
  {
    id: 1,
    q: "How do I book a service?",
    a: "Go to the Services page, select a worker based on ratings and availability, then click 'Book Now' to confirm your service request.",
  },
  {
    id: 2,
    q: "Can I cancel a booking?",
    a: "Yes. You can cancel your booking from your dashboard before the scheduled service time.",
  },
  {
    id: 3,
    q: "Are workers verified?",
    a: "Yes. Workers go through verification checks and are reviewed by customers through ratings and feedback.",
  },
  {
    id: 4,
    q: "How do I make payments?",
    a: "You can securely pay online using cards, UPI, wallets, or other supported payment methods.",
  },
  {
    id: 5,
    q: "How do I contact support?",
    a: "Visit the Contact Support section below or navigate to the Contact page for direct assistance.",
  },
];

const supportStats = [
  {
    icon: <FaHeadset />,
    title: "24/7 Support",
    desc: "Always available",
  },
  {
    icon: <FaClock />,
    title: "Quick Response",
    desc: "Average reply in minutes",
  },
  {
    icon: <FaShieldAlt />,
    title: "Trusted Platform",
    desc: "Safe & secure services",
  },
];

const HelpCenter = () => {
  const [search, setSearch] = useState("");
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [expandedSupport, setExpandedSupport] = useState(null);

  const filteredFaqs = useMemo(() => {
    return faqs.filter(
      (item) =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const toggleFAQ = (id) => {
    setActiveFAQ(activeFAQ === id ? null : id);
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { signupUser } from "../services/authService";
import useToast from "../hooks/useToast";
import { FaEye, FaEyeSlash } from "react-icons/fa";


const Register = () => {
  const { t, i18n } = useTranslation();
  const localizeDigits = (value) => {
    const text = String(value);
    if (i18n.language !== "hi") return text;
    const devanagariDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return text.replace(/\d/g, (d) => devanagariDigits[Number(d)]);
  };
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [interacted, setInteracted] = useState({});
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ---------------- VALIDATION ----------------

  const validateFields = (name, value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    switch (name) {
      case "name":
        if (!value.trim()) return t("register.validation.usernameRequired");
        break;

      case "email":
        if (!value || !emailRegex.test(value)) {
          return t("register.validation.invalidEmail");
        }
        break;

      case "password":
        if (value.length < 6) {
          return t("register.validation.passwordMin", { min: localizeDigits(6) });
        }
        break;

      case "phone":
        if (value && !/^[0-9]{10}$/.test(value.trim())) {
          return t("register.validation.invalidPhone");
        }
        break;

      default:
        return "";
    }

    return "";
  };

  const toggleSupport = (idx) => {
    setExpandedSupport(expandedSupport === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-gray-800 overflow-hidden">
      
      {/* HERO */}
      <header className="relative bg-gray-950 text-white py-20 px-6">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_#3b82f6,_transparent_40%)]"></div>

        <div className="relative max-w-6xl mx-auto text-center">
          <span className="inline-flex items-center px-4 py-1 rounded-full border border-white/20 bg-white/10 text-sm backdrop-blur">
            Support Center
          </span>

          <h1 className="mt-6 text-4xl md:text-6xl font-extrabold">
            How can we help you today?
          </h1>

          <p className="mt-5 text-gray-300 max-w-2xl mx-auto">
            Browse FAQs and find quick solutions for FixNearby.
          </p>

          <div className="max-w-2xl mx-auto mt-10">
            <div className="bg-white/10 border border-white/20 backdrop-blur-lg rounded-2xl flex items-center px-5 py-4">
              <FaSearch className="text-gray-300 mr-3" />

              <input
                type="text"
                placeholder="Search FAQs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none text-white placeholder:text-gray-300"
              />
            </div>
          </div>
        </div>
      </header>

      {/* EXPANDABLE SUPPORT SECTION */}
      <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid md:grid-cols-3 gap-5">
          {supportStats.map((item, idx) => {
            const isOpen = expandedSupport === idx;

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border shadow-lg overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleSupport(idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                      {item.icon}
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>

                  {isOpen ? (
                    <FaChevronUp className="text-gray-500" />
                  ) : (
                    <FaChevronDown className="text-gray-500" />
                  )}
                </button>

                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "max-h-60 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6 text-gray-600 border-t">
                    <p className="pt-4">
                      {idx === 0 &&
                        "Our support team is available anytime to help with account issues, bookings, and technical assistance."}

                      {idx === 1 &&
                        "Most customer queries are answered within a few minutes for faster service resolution."}

                      {idx === 2 &&
                        "All services are protected with secure transactions, verified workers, and reliable customer support."}
                    </p>

                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2 mt-4 text-blue-600 font-medium hover:gap-3 transition-all"
                    >
                      Learn More
                      <FaArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HELP CARDS */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {helpCards.map((card, idx) => (
            <Link
              key={idx}
              to={card.link}
              className="group bg-white rounded-3xl p-6 border shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="mb-5">{card.icon}</div>

              <h3 className="text-xl font-bold">{card.title}</h3>

              <p className="mt-3 text-gray-500 text-sm leading-relaxed">
                {card.desc}
              </p>

              <div className="mt-6 flex items-center text-blue-600 font-medium gap-2 group-hover:gap-3 transition-all">
                Explore
                <FaArrowRight />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold">Frequently Asked Questions</h2>

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">

        {/* Heading */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {t("auth.createAccount")}
          </h2>
          <p className="mt-2 text-base sm:text-sm text-gray-600">
            {t("auth.joinFixNearby")}
          </p>
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {apiError}
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t("register.fullName")}
              className={inputStyles("name")}
            />
            <div className="min-h-[22px] mt-1 text-sm">
              {interacted.name && errors.name && (
                <span className="text-red-600">{errors.name}</span>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <input
              id="email-address"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t("register.emailAddress")}
              className={inputStyles("email")}
            />
            <div className="min-h-[22px] mt-1 text-sm">
              {interacted.email && errors.email && (
                <span className="text-red-600">{errors.email}</span>
              )}
            </div>
          </div>

          {/* Phone */}
          <div>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t("register.phoneNumber")}
              className={inputStyles("phone")}
            />
            <div className="min-h-[22px] mt-1 text-sm">
              {interacted.phone && errors.phone && (
                <span className="text-red-600">{errors.phone}</span>
              )}
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t("register.password")}
                className={`${inputStyles("password")} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="min-h-[22px] mt-1 text-sm">
              {interacted.password && errors.password && (
                <span className="text-red-600">{errors.password}</span>
              )}
            </div>
          </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/contact"
            className="px-6 py-3 bg-white text-blue-700 rounded-xl font-semibold hover:bg-slate-100 transition"
          >
            {loading ? t("register.creatingAccount") : t("register.createAccount")}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          {t("register.alreadyHaveAccount")} {" "}
          <Link
            to="/faq"
            className="px-6 py-3 border border-white rounded-xl hover:bg-white/10 transition"
          >
            {t("register.signIn")}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;