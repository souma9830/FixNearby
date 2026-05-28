import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// ─── Layout Components (always loaded — tiny, needed immediately) ─────────────
import Navbar          from './components/Navbar';
import Footer          from './components/Footer';
import Toast           from './components/Toast';
import LocationBanner  from './components/LocationBanner';
import BackToTop       from './components/BackToTop';
import SOSButton       from './components/SOSButton';

// ─── Lazy-loaded Pages (loaded only when the route is visited) ────────────────
const Home             = lazy(() => import('./pages/Home'));
const Login            = lazy(() => import('./pages/Login'));
const Register         = lazy(() => import('./pages/Register'));
const Dashboard        = lazy(() => import('./pages/Dashboard'));
const Services         = lazy(() => import('./pages/Services'));
const WorkerProfile    = lazy(() => import('./pages/WorkerProfile'));
const Profile          = lazy(() => import('./pages/Profile'));
const Bookings         = lazy(() => import('./pages/Bookings'));
const WorkerRegister   = lazy(() => import('./pages/WorkerRegister'));
const WorkerLogin      = lazy(() => import('./pages/WorkerLogin'));
const HelpCenter       = lazy(() => import('./pages/HelpCenter'));
const TermsOfService   = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy    = lazy(() => import('./pages/PrivacyPolicy'));
const Contact          = lazy(() => import('./components/Contact'));
const Community        = lazy(() => import('./pages/Community'));
const Feedback         = lazy(() => import('./pages/Feedback'));
const FAQ              = lazy(() => import('./pages/FAQ'));
const SavedWorkers     = lazy(() => import('./pages/SavedWorkers'));
const Recommendations  = lazy(() => import('./pages/Recommendations')); // ✨ NEW
const NotFound         = lazy(() => import('./pages/NotFound'));

// ─── Route Definitions ────────────────────────────────────────────────────────
// Grouped for clarity and easy future additions
const ROUTES = [
  // Core
  { path: '/',                  element: <Home /> },
  { path: '/login',             element: <Login /> },
  { path: '/register',          element: <Register /> },
  { path: '/dashboard',         element: <Dashboard /> },

  // Workers & Services
  { path: '/services',          element: <Services /> },
  { path: '/worker/register',   element: <WorkerRegister /> },
  { path: '/worker/login',      element: <WorkerLogin /> },
  { path: '/worker/:id',        element: <WorkerProfile /> },
  { path: '/saved-workers',     element: <SavedWorkers /> },
  { path: '/recommendations',   element: <Recommendations /> }, // ✨ NEW

  // User
  { path: '/profile',           element: <Profile /> },
  { path: '/bookings',          element: <Bookings /> },

  // Info & Support
  { path: '/help',              element: <HelpCenter /> },
  { path: '/faq',               element: <FAQ /> },
  { path: '/terms',             element: <TermsOfService /> },
  { path: '/privacy',           element: <PrivacyPolicy /> },
  { path: '/contact',           element: <Contact /> },
  { path: '/community',         element: <Community /> },
  { path: '/feedback',          element: <Feedback /> },

  // Fallback
  { path: '*',                  element: <NotFound /> },
];

// ─── Page Loader (shown while lazy chunks load) ───────────────────────────────
const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      <p className="text-sm font-medium text-slate-400">Loading...</p>
    </div>
  </div>
);

// ─── App Content ──────────────────────────────────────────────────────────────
function AppContent() {
  const location = useLocation();

  // Hide LocationBanner on Home — it has its own live-location section
  const showLocationBanner = location.pathname !== '/';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {showLocationBanner && <LocationBanner />}
      <Toast />

      <main className="flex-grow bg-gray-50">
        {/* Suspense wraps all lazy routes — shows PageLoader during chunk fetch */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {ROUTES.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Routes>
        </Suspense>
      </main>

      <BackToTop />
      {/* SOS stays fixed on every page for emergency bookings */}
      <SOSButton />
      <Footer />
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;