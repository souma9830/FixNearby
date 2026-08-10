import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useToast from "../hooks/useToast";
import {
  FaGithub,
  FaEnvelope,
  FaMapMarkerAlt,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaInstagram,
  FaArrowRight,
  FaPhoneAlt,
  FaClock,
  FaShieldAlt,
  FaSearch,
  FaTools,
  FaHeadset,
} from "react-icons/fa";

const Footer = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleSearch = () => {
    if (query.trim() !== "") {
      navigate(`/services?search=${query}`);
      setQuery("");
    }
  };

  const { showToast } = useToast();
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterEmail("");
    showToast("Thanks for subscribing! You'll hear from us soon. 🎉", "success");
  };

  const linkClass = (path) =>
    `transition-all duration-300 flex items-center gap-2 group ${
      location.pathname === path
        ? "text-blue-400 font-medium"
        : "text-gray-400 hover:text-blue-400"
    }`;

  return (
    <footer className="bg-gradient-to-b from-gray-950 via-black to-black text-gray-300 mt-auto border-t border-gray-800 relative overflow-hidden dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/10 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-500/10 blur-3xl rounded-full"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-10 items-start">

        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/15 border border-blue-500/20 p-3 rounded-2xl">
              <FaTools className="text-blue-400 text-2xl" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-wide">
              FixNearby
            </h2>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-gray-400 max-w-sm">
            {t("footer.tagline")}
          </p>

          <div className="mt-5 space-y-2.5 text-sm">
            <div className="flex items-center gap-3 text-gray-400">
              <FaMapMarkerAlt className="text-blue-400" />
              <span>{t("footer.availableArea")}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <FaClock className="text-blue-400" />
              <span>{t("footer.support247")}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <FaShieldAlt className="text-blue-400" />
              <span>{t("footer.verifiedTrusted")}</span>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            {[
              { icon: <FaTwitter />, link: "#" },
              { icon: <FaLinkedin />, link: "#" },
              { icon: <FaGithub />, link: "#" },
              { icon: <FaFacebook />, link: "#" },
              { icon: <FaInstagram />, link: "#" },
            ].map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300 hover:scale-105"
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4 text-lg">
            {t("footer.navigation")}
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/" className={linkClass("/")}>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                {t("nav.home")}
              </Link>
            </li>
            <li>
              <Link to="/services" className={linkClass("/services")}>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                {t("nav.services")}
              </Link>
            </li>
            <li>
              <Link to="/bookings" className={linkClass("/bookings")}>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                {t("nav.bookings")}
              </Link>
            </li>
            <li>
              <Link to="/worker/register" className={linkClass("/worker/register")}>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                {t("nav.joinAsPro")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4 text-lg">
            {t("footer.support")}
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/help" className={linkClass("/help")}>
                <FaHeadset className="text-xs" />
                {t("footer.support")}
              </Link>
            </li>
            <li>
              <Link to="/contact" className={linkClass("/contact")}>
                <FaEnvelope className="text-xs" />
                {t("footer.contact")}
              </Link>
            </li>
            <li>
              <Link to="/feedback" className={linkClass("/feedback")}>
                <FaArrowRight className="text-xs" />
                {t("footer.feedback")}
              </Link>
            </li>
          </ul>

          <div className="mt-5 space-y-2.5 text-sm">
            <div className="flex items-center gap-3 text-gray-400">
              <FaEnvelope className="text-blue-400" />
              support@fixnearby.com
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <FaPhoneAlt className="text-blue-400" />
              +91 98765 43210
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-white font-semibold mb-4 text-lg">
            {t("footer.stayUpdated")}
          </h3>

          <p className="text-sm text-gray-400 mb-4 max-w-sm leading-relaxed">
            {t("footer.newsletterDesc")}
          </p>

          <div className="mb-4">
            <div className="flex gap-2">
              <div className="relative w-full">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="text"
                  placeholder={t("footer.searchPlaceholder")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/90 border border-gray-700 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/20"
              >
                <FaSearch />
              </button>
            </div>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input
                type="email"
                placeholder={t("footer.emailPlaceholder")}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/90 border border-gray-700 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/20 whitespace-nowrap"
            >
              {t("footer.subscribe")}
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-gray-800 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-400">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} {t("footer.rights")}
          </p>
          <div className="flex items-center flex-wrap justify-center gap-5">
            <Link to="/privacy" className="hover:text-blue-400 transition">
              {t("footer.privacy")}
            </Link>
            <Link to="/terms" className="hover:text-blue-400 transition">
              {t("footer.terms")}
            </Link>
            <a
              href="https://github.com/souma9830/FixNearby"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-blue-400 transition"
            >
              <FaGithub />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;