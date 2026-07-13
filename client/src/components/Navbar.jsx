import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import NavLanguageToggle from "./NavLanguageToggle";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from '../context/AuthContext';
import { useTranslation } from "react-i18next";
import { getUnreadCount } from '../services/notificationService';

// Navigation Bar Component. Handles routing layouts. (Ref: ReviewBadge)

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
  const { isAuthenticated, user, logout, authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const authenticated = authLoading ? false : isAuthenticated;

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  const dropdownRef = useRef(null);

  // Fetch unread notification count when authenticated
  useEffect(() => {
    if (!authenticated) return;
    let cancelled = false;
    const fetchCount = async () => {
      try {
        const data = await getUnreadCount();
        if (!cancelled) setNotifCount(data.count || 0);
      } catch {
        // silently ignore — badge just won't show
      }
    };
    fetchCount();
    // Poll every 60s for fresh count
    const interval = setInterval(fetchCount, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [authenticated]);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu and dropdown on route change
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (path) => location.pathname === path;

  // Desktop nav link — animated underline on active
  const desktopLinkCls = (path) =>
    `relative text-sm font-medium transition-colors duration-200 pb-0.5
     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-sm
     after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-[#0056D2] after:transition-transform after:duration-250
     ${isActive(path)
       ? 'text-[#0056D2] after:scale-x-100'
       : 'text-slate-600 hover:text-[#0056D2] after:scale-x-0 hover:after:scale-x-100'
     }`;

  // Mobile nav link
  const mobileLinkCls = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150
     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600
     ${isActive(path)
       ? 'bg-blue-50 text-[#0056D2] font-semibold dark:bg-blue-900/30 dark:text-blue-400'
       : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
     }`;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:font-semibold"
      >
        Skip to main content
      </a>

      {/* ── Main navbar ── */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 dark:bg-slate-900/95 dark:border-slate-700/80'
            : 'bg-white dark:bg-slate-900'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0056D2] group-hover:scale-105 transition-transform duration-200">
                <WrenchIcon />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                Fix<span className="text-[#0056D2]">Nearby</span>
              </span>
            </Link>

            {/* ── Desktop nav ── */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="/#how-it-works"
                className={`relative text-sm font-medium transition-colors duration-200 pb-0.5
                  text-slate-600 hover:text-[#0056D2]
                  after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5
                  after:rounded-full after:bg-[#0056D2] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-250`}
              >
                {t("nav.howItWorks")}
              </a>

              <Link to="/services" className={desktopLinkCls('/services')}>
                {t("nav.services")}
              </Link>

              <Link to="/civic-issues" className={desktopLinkCls('/civic-issues')}>
                Civic Issues
              </Link>

              <ThemeToggle />
              <NavLanguageToggle />

              {authenticated ? (
                <>
                  <Link to="/bookings" className={desktopLinkCls('/bookings')}>
                    {t("nav.bookings")}
                  </Link>

                  {/* Notification bell */}
                  <Link
                    to="/notifications"
                    className="relative p-2 rounded-xl text-slate-500 hover:text-[#0056D2] hover:bg-blue-50 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell size={20} />
                    {notifCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold px-1">
                        {notifCount > 9 ? "9+" : notifCount}
                      </span>
                    )}
                  </Link>

                  {/* User dropdown */}
                  <div className="relative ml-1" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen((prev) => !prev)}
                      aria-haspopup="true"
                      aria-expanded={dropdownOpen}
                      aria-label="User Account Menu"
                      className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0056D2] to-cyan-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                      </div>
                      <span className="text-sm font-medium text-slate-700 max-w-[80px] truncate">
                        {user?.name ?? 'Account'}
                      </span>
                      <svg
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown panel */}
                    <div
                      className={`absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl
                        transition-all duration-200 origin-top-right
                        ${dropdownOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
                      role="menu"
                    >
                      {/* User info header */}
                      <div className="px-4 py-2.5 border-b border-slate-100 mb-1">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        role="menuitem"
                      >
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        {t("nav.profile")}
                      </Link>

                      <Link
                        to="/bookings"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        role="menuitem"
                      >
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        {t("nav.myBookings")}
                      </Link>

                      <Link
                        to="/saved-workers"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        role="menuitem"
                      >
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                        </svg>
                        Saved Workers
                      </Link>

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        role="menuitem"
                      >
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
                  <Link
                    to="/worker/register"
                    className="text-sm font-semibold px-4 py-2 rounded-xl border border-[#0056D2]/30 text-[#0056D2] bg-blue-50/70 hover:bg-blue-100 transition-all duration-200"
                  >
                    {t("nav.joinAsPro")}
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-semibold px-5 py-2 rounded-xl bg-[#0056D2] text-white hover:bg-[#0047AF] shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {t("nav.getStarted")}
                  </Link>
                </div>
              )}
            </div>

            {/* ── Mobile: hamburger ── */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>

          </div>
        </div>
      </nav>

      {/* ── Mobile full-height drawer ── */}
      {/* Backdrop */}
      <div
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer panel — slides in from the right */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl md:hidden dark:bg-slate-900 dark:border-l dark:border-slate-700
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0056D2]">
              <WrenchIcon />
            </div>
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              Fix<span className="text-[#0056D2]">Nearby</span>
            </span>
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User info strip (when authenticated) */}
        {authenticated && (
          <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-100 dark:bg-slate-800 dark:border-slate-700">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0056D2] to-cyan-400 flex items-center justify-center text-white font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate dark:text-white">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
          <p className="px-4 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</p>

          <a
            href="/#how-it-works"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-150"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            {t("nav.howItWorks")}
          </a>

          <Link
            to="/services"
            onClick={() => setMenuOpen(false)}
            className={mobileLinkCls('/services')}
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
            {t("nav.services")}
          </Link>

          <Link
            to="/civic-issues"
            onClick={() => setMenuOpen(false)}
            className={mobileLinkCls('/civic-issues')}
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Civic Issues
          </Link>

          {authenticated ? (
            <>
              <Link
                to="/bookings"
                onClick={() => setMenuOpen(false)}
                className={mobileLinkCls('/bookings')}
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                {t("nav.bookings")}
              </Link>

              <Link
                to="/notifications"
                onClick={() => setMenuOpen(false)}
                className={mobileLinkCls('/notifications')}
              >
                <Bell size={16} className="text-slate-400" />
                <span className="flex-1">Notifications</span>
                {notifCount > 0 && (
                  <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold px-1">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>

              <Link
                to="/saved-workers"
                onClick={() => setMenuOpen(false)}
                className={mobileLinkCls('/saved-workers')}
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
                Saved Workers
              </Link>

              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className={mobileLinkCls('/profile')}
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                {t("nav.profile")}
              </Link>
            </>
          ) : null}

          <div className="flex items-center gap-3 px-3 py-2">
            <ThemeToggle />
            <NavLanguageToggle />
          </div>
        </nav>

        {/* Drawer footer: CTA or Logout */}
        <div className="px-4 pb-6 pt-3 border-t border-slate-100 flex flex-col gap-2">
          {authenticated ? (
            <button
              onClick={() => { setMenuOpen(false); handleLogout(); }}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              {t("nav.logout")}
            </button>
          ) : (
            <>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="block text-center text-sm font-semibold text-white bg-[#0056D2] hover:bg-[#0047AF] px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm"
              >
                {t("nav.getStarted")}
              </Link>
              <Link
                to="/worker/register"
                onClick={() => setMenuOpen(false)}
                className="block text-center text-sm font-semibold text-[#0056D2] border border-[#0056D2]/25 bg-blue-50/70 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-all duration-200"
              >
                {t("nav.joinAsPro")}
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;