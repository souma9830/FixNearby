import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { lazyWithRetry } from "./utils/performance";

// ─── Layout Components (always loaded — tiny, needed immediately) ─────────────
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import LocationBanner from "./components/LocationBanner";
import BackToTop from "./components/BackToTop";
import SOSButton from "./components/SOSButton";
import useNetworkSync from "./hooks/useNetworkSync";
import ErrorBoundary from "./components/ErrorBoundary";
import SuspenseBoundary from "./components/SuspenseBoundary";
import AriaAnnouncer from "./components/AriaAnnouncer";

// ─── Lazy-loaded Pages (loaded only when the route is visited) ────────────────
const Home             = lazy(() => import('./pages/Home'));
const Login            = lazy(() => import('./pages/Login'));
const Register         = lazy(() => import('./pages/Register'));
const Dashboard        = lazy(() => import('./pages/Dashboard'));
const Services         = lazy(() => lazyWithRetry(() => import('./pages/Services')));
const WorkerProfile    = lazy(() => lazyWithRetry(() => import('./pages/WorkerProfile')));
const WorkerDashboard  = lazy(() => lazyWithRetry(() => import('./pages/WorkerDashboard')));
const Profile          = lazy(() => lazyWithRetry(() => import('./pages/Profile')));
const Bookings         = lazy(() => lazyWithRetry(() => import('./pages/Bookings')));
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
const CivicIssues         = lazy(() => import('./pages/CivicIssues'));
const ReportIssue         = lazy(() => import('./components/IssueSubmissionForm'));
const IssueDetail         = lazy(() => import('./pages/IssueDetail'));
const NotFound            = lazy(() => import('./pages/NotFound'));
const Notifications       = lazy(() => lazyWithRetry(() => import('./pages/Notifications')));

const AdminDashboard      = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers          = lazy(() => import('./pages/admin/AdminUsers'));

const ForgotPasswordUser = lazy(()=>import('./pages/ForgotPasswordUser'));
const ResetPasswordUser = lazy(()=>import('./pages/ResetPasswordUser'));
const ForgotPasswordWorker = lazy(()=>import('./pages/ForgotPasswordWorker'));
const ResetPasswordWorker = lazy(()=>import('./pages/ResetPasswordWorker'));


// ─── Route Definitions ────────────────────────────────────────────────────────
// Grouped for clarity and easy future additions
// ---------------- Auth Guard ----------------
// User-protected routes (client-side guard).
// Backend still enforces authorization via JWT middleware.
function RequireAuth({ children }) {
  const { isAuthenticated, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? children : <Login />;
}

const ROUTES = [
  // Core
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/dashboard", element: <Dashboard /> },

  // auth - forgot and reset password routes
  { path: "/forgot-password", element: <ForgotPasswordUser /> },
  { path: "/reset-password/:token", element: <ResetPasswordUser /> },
  { path: "/worker/forgot-password", element: <ForgotPasswordWorker /> },
  { path: "/worker/reset-password/:token", element: <ResetPasswordWorker /> },

  // Workers & Services
  { path: '/services',          element: <Services /> },
  { path: '/worker/register',   element: <WorkerRegister /> },
  { path: '/worker/login',      element: <WorkerLogin /> },
  { path: '/worker/dashboard',    element: <WorkerDashboard /> }, 
  { path: '/worker/:id',        element: <WorkerProfile /> },
  { path: '/saved-workers',     element: <SavedWorkers /> },
  { path: '/recommendations',   element: <Recommendations /> }, // ✨ NEW
  { path: '/civic-issues',           element: <CivicIssues /> },
  { path: '/civic-issues/report',    element: <ReportIssue /> },
  { path: '/civic-issues',     element: <CivicIssues /> },
  { path: '/admin',            element: <AdminDashboard /> },
  { path: '/admin/users',      element: <AdminUsers /> },
  // User (protected)
  {
    path: "/profile",
    element: (
      <RequireAuth>
        <Profile />
      </RequireAuth>
    ),
  },
  {
    path: "/bookings",
    element: (
      <RequireAuth>
        <Bookings />
      </RequireAuth>
    ),
  },
  {
    path: "/notifications",
    element: (
      <RequireAuth>
        <Notifications />
      </RequireAuth>
    ),
  },

  // Info & Support
  { path: "/help", element: <HelpCenter /> },
  { path: "/faq", element: <FAQ /> },
  { path: "/terms", element: <TermsOfService /> },
  { path: "/privacy", element: <PrivacyPolicy /> },
  { path: "/contact", element: <Contact /> },
  { path: "/community", element: <Community /> },
  { path: "/feedback", element: <Feedback /> },

  // Fallback
  { path: "*", element: <NotFound /> },
];

// ─── Page Loader (shown while lazy chunks load) ───────────────────────────────
const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0056D2]" />
      <p className="text-sm font-medium text-slate-400">Loading...</p>
    </div>
  </div>
);

// ─── App Content ──────────────────────────────────────────────────────────────
function AppContent() {
  const location = useLocation();
  useNetworkSync();

  // Hide LocationBanner on Home — it has its own live-location section
  const showLocationBanner = location.pathname !== "/";

  return (
    <div className="flex flex-col min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>
      <AriaAnnouncer />
      <Navbar />
      {showLocationBanner && <LocationBanner />}
      <Toast />

      <main id="main-content" className="flex-grow bg-gray-50 dark:bg-slate-900" tabIndex={-1}>
        <ErrorBoundary>
          <SuspenseBoundary>
            <Routes>
              {ROUTES.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
            </Routes>
          </SuspenseBoundary>        </ErrorBoundary>
      </main>
      <BackToTop />
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
