import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LanguageToggle from "./LanguageToggle";
import { useAuth } from '../context/AuthContext';
import { useTranslation } from "react-i18next";

const WrenchIcon = () => (
  <svg
    className="w-4 h-4 text-white"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const desktopLinkCls = (path) =>
    `text-sm font-medium transition-colors duration-200 ${
      location.pathname === path
        ? 'text-primary'
        : 'text-slate-600 hover:text-primary'
    }`;

  const mobileLinkCls = (path) =>
    `block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
      location.pathname === path
        ? 'bg-blue-50 text-primary'
        : 'text-slate-700 hover:bg-slate-50'
    }`;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur shadow-sm border-b border-slate-200/80' : 'bg-white'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <WrenchIcon />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Fix<span className="text-primary">Nearby</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/#how-it-works"
              className="relative pb-0.5 text-sm font-medium text-slate-600 hover:text-primary transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200">
              {t("nav.howItWorks")}
            </a>
            <Link to="/services" className={desktopLinkCls('/services')}>{t("nav.services")}</Link>
            <LanguageToggle />
            {isAuthenticated ? (
              <>
                <Link to="/bookings" className={desktopLinkCls('/bookings')}>{t("nav.bookings")}</Link>
                <div className="relative group ml-1">
                  <button className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all duration-200 cursor-pointer">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>
                    <span className="text-sm font-medium text-slate-700 max-w-[80px] truncate">
                      {user?.name ?? 'Account'}
                    </span>
                    <svg className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      {t("nav.profile")}
                    </Link>
                    <Link to="/bookings" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {t("nav.myBookings")}
                    </Link>
                    <div className="my-1 border-t border-slate-100" />
                    <button onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                      </svg>
                      {t("nav.logout")}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5 ml-1">
                <Link to="/worker/register"
                  className="btn-outline text-sm font-semibold px-4 py-2.5">
                  {t("nav.joinAsPro")}
                </Link>
                <Link to="/register"
                  className="btn-primary text-sm font-semibold px-5 py-2.5">
                  {t("nav.getStarted")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pb-4 pt-2">
          <nav className="flex flex-col gap-1">
            <a href="/#how-it-works" className={mobileLinkCls('/#how-it-works')}>{t("nav.howItWorks")}</a>
            <Link to="/services" className={mobileLinkCls('/services')}>{t("nav.services")}</Link>
            {isAuthenticated ? (
              <>
                <Link to="/bookings" className={mobileLinkCls('/bookings')}>{t("nav.bookings")}</Link>
                <Link to="/profile" className={mobileLinkCls('/profile')}>{t("nav.profile")}</Link>
                <div className="my-1 border-t border-slate-100" />
                <button onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <div className="my-1 border-t border-slate-100" />
                <Link to="/register"
                  className="block text-center text-sm font-semibold text-white bg-primary hover:bg-blue-700 px-5 py-2.5 rounded-xl transition-all duration-200">
                  {t("nav.getStarted")}
                </Link>
                <Link to="/worker/register"
                  className="block text-center text-sm font-semibold text-primary border border-blue-200 bg-blue-50/70 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-all duration-200">
                  {t("nav.joinAsPro")}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </nav>
  );
};

export default Navbar;