import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";

import api from "../services/apiClient";
import { getEstimatorConfig } from "../utils/estimatorConfig";
import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Briefcase,
  Phone,
  MessageCircle,
  CalendarCheck,
  LayoutGrid,
  Calculator,
  MessageSquare,
  Image,
  Award,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Heart,
} from "lucide-react";

import SkeletonLoader from "../components/SkeletonLoader";
import BookingConfirmationModal from "../components/BookingConfirmationModal";
import SmartEstimator from "../components/SmartEstimator";
import EstimateWizard from "../components/EstimateWizard";
import ImageGallery from "../components/ImageGallery";
import { createBooking } from "../services/bookingService";
import WorkerBookingCalendar from "../components/WorkerBookingCalendar";
import { useAuth } from "../context/AuthContext";
import { getWorkerAvailability } from "../services/availabilityService";
import { getFavorites, toggleFavorite } from "../services/favoriteService";
import useToast from "../hooks/useToast";
import ReviewBadge from "../components/ReviewBadge";
import ReviewList from "../components/ReviewList";

/* ✅ Move data outside component */
const WORKERS = {
  1: {
    id: 1,
    name: "John Doe",
    profession: "Electrician",
    price: "$45/hr",
    rating: 4.8,
    experience: "10+ Years",
    location: "New York, USA",
    completedJobs: 240,
    bio: "Experienced electrician with 10+ years of expertise in residential and commercial projects.",
    portfolio: [
      {
        id: 1,
        image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=250&fit=crop",
        description: "Full apartment rewiring with safety inspection",
        completionDate: "March 2025",
        customerRating: 4.9,
        review: "Excellent work, very professional and clean.",
      },
      {
        id: 2,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
        description: "Installed new electrical panel and circuit breakers",
        completionDate: "January 2025",
        customerRating: 4.8,
        review: "Quick and efficient, highly recommend.",
      },
      {
        id: 3,
        image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=250&fit=crop",
        description: "Outdoor lighting setup for residential garden",
        completionDate: "November 2024",
        customerRating: 5.0,
        review: "Transformed our garden, amazing attention to detail.",
      },
    ],
  },
  2: {
    id: 2,
    name: "Jane Smith",
    profession: "Plumber",
    price: "$50/hr",
    rating: 4.9,
    experience: "15 Years",
    location: "California, USA",
    completedJobs: 310,
    bio: "Licensed plumber with extensive expertise in leak fixing and pipeline installation.",
    portfolio: [
      {
        id: 1,
        image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=250&fit=crop",
        description: "Full bathroom pipeline replacement and waterproofing",
        completionDate: "April 2025",
        customerRating: 5.0,
        review: "No leaks at all, superb finish and very tidy work.",
      },
      {
        id: 2,
        image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=250&fit=crop",
        description: "Kitchen sink installation and drain unclogging",
        completionDate: "February 2025",
        customerRating: 4.9,
        review: "Fast response and clean job, would hire again.",
      },
      {
        id: 3,
        image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=250&fit=crop",
        description: "Water heater installation for a 3-bedroom home",
        completionDate: "December 2024",
        customerRating: 4.8,
        review: "Professional and straightforward, great value.",
      },
    ],
  },
  3: {
    id: 3,
    name: "Mike Johnson",
    profession: "Carpenter",
    price: "$35/hr",
    rating: 4.5,
    experience: "7 Years",
    location: "Texas, USA",
    completedJobs: 180,
    bio: "Expert carpenter specializing in custom furniture and interior woodwork.",
    portfolio: [
      {
        id: 1,
        image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400&h=250&fit=crop",
        description: "Custom built-in bookshelf for a home library",
        completionDate: "April 2025",
        customerRating: 4.7,
        review: "Beautiful craftsmanship, exactly what I envisioned.",
      },
      {
        id: 2,
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=250&fit=crop",
        description: "Living room wooden furniture set — sofa frame and table",
        completionDate: "January 2025",
        customerRating: 4.5,
        review: "Solid build quality, very happy with the result.",
      },
      {
        id: 3,
        image: "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?w=400&h=250&fit=crop",
        description: "Bedroom wardrobe with sliding doors and interior shelving",
        completionDate: "October 2024",
        customerRating: 4.6,
        review: "Fits perfectly and looks amazing, great attention to detail.",
      },
    ],
  },
  4: {
    id: 4,
    name: "Maria Garcia",
    profession: "Painter",
    price: "$38/hr",
    rating: 4.9,
    experience: "12 Years",
    location: "Florida, USA",
    completedJobs: 275,
    bio: "Professional painter with a decade of experience in residential interiors, color consulting, and premium finishes.",
    portfolio: [
      {
        id: 1,
        image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=250&fit=crop",
        description: "Full interior repaint for a 4-bedroom family home",
        completionDate: "March 2025",
        customerRating: 5.0,
        review: "Flawless finish, completed on time and under budget!",
      },
      {
        id: 2,
        image: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=400&h=250&fit=crop",
        description: "Feature wall accent painting with textured design",
        completionDate: "January 2025",
        customerRating: 4.9,
        review: "Absolutely stunning. Maria has a great eye for color.",
      },
      {
        id: 3,
        image: "https://images.unsplash.com/photo-1572297773977-c6ce2cff0e1e?w=400&h=250&fit=crop",
        description: "Kitchen and dining area refresh with semi-gloss finish",
        completionDate: "November 2024",
        customerRating: 4.8,
        review: "Very tidy and professional. Will hire again!",
      },
    ],
  },
  5: {
    id: 5,
    name: "Sarah Lee",
    profession: "Cleaner",
    price: "$28/hr",
    rating: 4.7,
    experience: "5 Years",
    location: "Seattle, USA",
    completedJobs: 320,
    bio: "Reliable and thorough home cleaning specialist with expertise in deep cleaning, move-in/out cleans, and eco-friendly products.",
    portfolio: [
      {
        id: 1,
        image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=250&fit=crop",
        description: "Complete move-out deep clean for a 3-bedroom apartment",
        completionDate: "April 2025",
        customerRating: 5.0,
        review: "Left the apartment spotless. Got our full deposit back!",
      },
      {
        id: 2,
        image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&h=250&fit=crop",
        description: "Weekly recurring home cleaning service",
        completionDate: "March 2025",
        customerRating: 4.7,
        review: "Consistently excellent work, very dependable.",
      },
      {
        id: 3,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
        description: "Post-renovation cleanup for a renovated kitchen",
        completionDate: "January 2025",
        customerRating: 4.8,
        review: "Handled all the construction dust and debris perfectly.",
      },
    ],
  },
};

const REVIEWS = [
  {
    name: "User A",
    rating: 5,
    text: "Great service, arrived on time and fixed everything perfectly.",
  },
  {
    name: "User B",
    rating: 4.5,
    text: "Professional, polite, and highly knowledgeable.",
  },
  {
    name: "User C",
    rating: 4.8,
    text: "Affordable pricing and excellent work quality.",
  },
];

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "estimator", label: "Get Estimate", icon: Calculator },
  { id: "reviews", label: "Reviews", icon: MessageSquare },
  { id: "portfolio", label: "Portfolio", icon: Image },
];

/**
 * Parse a price string like "$45/hr" or a number into a numeric hourly price.
 * Used to send a server-validatable numeric price to the booking API instead
 * of the display string.
 */
const parsePriceToNumber = (price) => {
  if (typeof price === "number") return price;
  const match = String(price || "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const WorkerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab]          = useState("overview");
  const [showModal, setShowModal]           = useState(false);
  const [bookingDetails, setBookingDetails] = useState({});
  const [showQuickBookPrompt, setShowQuickBookPrompt] = useState(false);
  const [bookingError, setBookingError]     = useState("");
  const [submitting, setSubmitting]         = useState(false);

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showWizardModal, setShowWizardModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && id) {
      const checkSavedStatus = async () => {
        try {
          const favs = await getFavorites();
          const saved = favs.some((f) => String(f.worker._id || f.worker.id) === String(id));
          setIsSaved(saved);
        } catch (err) {
          console.error("Failed to load saved status:", err);
        }
      };
      checkSavedStatus();
    } else {
      setIsSaved(false);
    }
  }, [isAuthenticated, id]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      showToast("Please log in to save professionals to your favorites.", "error");
      return;
    }

    const previousSaved = isSaved;
    setIsSaved(!previousSaved);

    try {
      await toggleFavorite(id, previousSaved);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      setIsSaved(previousSaved);
      showToast("Failed to update favorite. Please try again.", "error");
    }
  };

  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const res = await getWorkerAvailability(id);
        if (res?.success && res.availableSlots) {
          setAvailableSlots(res.availableSlots);
          if (res.availableSlots.length > 0) {
            setSelectedSlot(res.availableSlots[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load worker slots", err);
      } finally {
        setSlotsLoading(false);
      }
    };
    if (id) {
      fetchSlots();
    }
  }, [id]);

  useEffect(() => {
    const loadWorker = async () => {
      setLoading(true);
      const workerId = Number(id);
      if (!isNaN(workerId) && WORKERS[workerId]) {
        setWorker(WORKERS[workerId]);
        setLoading(false);
      } else {
        // Fetch from backend
        try {
          const res = await api.get(`/workers/${id}`);
          const backendWorker = res.data.worker || res.data;
          
          setWorker({
            id: backendWorker._id || backendWorker.id,
            name: backendWorker.name,
            profession: backendWorker.category || backendWorker.profession,
            price: backendWorker.price ? (backendWorker.price.toString().startsWith('$') ? backendWorker.price : `$${backendWorker.price}/hr`) : "$30/hr",
            rating: backendWorker.rating || 4.5,
            experience: backendWorker.experience ? (backendWorker.experience.toString().toLowerCase().includes("year") ? backendWorker.experience : `${backendWorker.experience} Years`) : "3 Years",
            location: "Local Area",
            completedJobs: backendWorker.completedJobs || 12,
            bio: backendWorker.bio || `Licensed professional ${backendWorker.category?.toLowerCase() || 'service'} specialist ready to help.`,
            portfolio: backendWorker.portfolio || [
              {
                id: 1,
                image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=250&fit=crop",
                description: `Completed general ${backendWorker.category || 'service'} maintenance`,
                completionDate: "Recent",
                customerRating: 4.8,
                review: "Great job, very detail-oriented and responsive.",
              }
            ],
          });
        } catch (err) {
          console.error("Failed to load worker from backend", err);
          setWorker(null);
        } finally {
          setLoading(false);
        }
      }
    };
    loadWorker();
  }, [id]);

  /* Detect whether this profession has an estimator config */
  const hasEstimator = useMemo(
    () => worker && getEstimatorConfig(worker.profession) !== null,
    [worker]
  );

  // Auto-trigger quick booking when navigated here from Saved Workers.
  // Usage: /worker/:id?quickBook=1
  const [autoQuickBookStarted, setAutoQuickBookStarted] = useState(false);
  useEffect(() => {
    const shouldQuickBook = searchParams.get("quickBook") === "1";
    if (!shouldQuickBook) return;
    if (!worker) return;
    if (autoQuickBookStarted) return;

    // Once we have the worker and estimator readiness, kick off booking.
    setAutoQuickBookStarted(true);
    // handleBooking may redirect to /login when unauthenticated.
    handleBooking();
  }, [searchParams, worker, autoQuickBookStarted, hasEstimator]);

  /* ── Quick book — show estimate prompt if config exists, else book directly ── */

  const handleBooking = () => {
    if (!worker) return;
    // Booking is a server-side action tied to the authenticated user; bounce
    // unauthenticated visitors to login instead of silently failing.
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/worker/${id}` } });
      return;
    }
    if (hasEstimator) {
      setShowQuickBookPrompt(true);
      return;
    }
    confirmQuickBook();
  };

  /* ── Confirmed quick book (no estimate) ── */
  const confirmQuickBook = async () => {
    if (!worker || submitting) return;
    setShowQuickBookPrompt(false);
    setSubmitting(true);
    setBookingError("");

    try {
      const price = parsePriceToNumber(worker.price);
      const slotToBook = selectedSlot || (availableSlots.length > 0 ? availableSlots[0] : null);
      const scheduledTime = slotToBook ? slotToBook.start : new Date().toISOString();
      console.log(`[QuickBook] Selected slot starting time: ${scheduledTime}`);

      const response = await createBooking({
        workerId: worker.id,
        service: worker.profession,
        price,
        scheduledTime,
        durationHours: 2,
        address: "123 Main St, New York"
      });
      const saved = response.booking;

      const scheduledDate = new Date(scheduledTime);
      setBookingDetails({
        service: worker.profession,
        worker: worker.name,
        date: scheduledDate.toLocaleDateString(),
        time: scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: worker.price,
        bookingId: saved?._id,
      });
      setShowModal(true);

      // Refetch slots
      try {
        const res = await getWorkerAvailability(id);
        if (res?.success && res.availableSlots) {
          setAvailableSlots(res.availableSlots);
          if (res.availableSlots.length > 0) {
            setSelectedSlot(res.availableSlots[0]);
          } else {
            setSelectedSlot(null);
          }
        }
      } catch (err) {
        console.error("Failed to refetch slots", err);
      }
    } catch (err) {
      setBookingError(err.message || "Could not create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Estimate-based booking ── */
  const handleEstimateBooking = async (estimate) => {
    if (!worker || submitting) return;
    setSubmitting(true);
    setBookingError("");

    try {
      const slotToBook = selectedSlot || (availableSlots.length > 0 ? availableSlots[0] : null);
      const scheduledTime = slotToBook ? slotToBook.start : new Date().toISOString();

      const response = await createBooking({
        workerId: worker.id,
        service: worker.profession,
        price: estimate.totalCost,
        scheduledTime,
        durationHours: 2,
        address: "123 Main St, New York",
        // Carry the full estimate breakdown so the Bookings page can render
        // the cost split without a separate API round-trip.
        notes: JSON.stringify({
          summary: estimate.summary,
          materials: estimate.materials,
          laborHours: estimate.laborHours,
          laborCost: estimate.laborCost,
          materialCost: estimate.materialCost,
          totalCost: estimate.totalCost,
        }),
      });
      const saved = response.booking;

      const scheduledDate = new Date(scheduledTime);
      setBookingDetails({
        service: worker.profession,
        worker: worker.name,
        date: scheduledDate.toLocaleDateString(),
        time: scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: `$${estimate.totalCost.toFixed(2)}`,
        estimateSpecs: {
          summary: estimate.summary,
          materials: estimate.materials,
          laborHours: estimate.laborHours,
          laborCost: estimate.laborCost,
          materialCost: estimate.materialCost,
          totalCost: estimate.totalCost,
        },
        bookingId: saved?._id,
      });
      setShowModal(true);

      // Refetch slots
      try {
        const res = await getWorkerAvailability(id);
        if (res?.success && res.availableSlots) {
          setAvailableSlots(res.availableSlots);
          if (res.availableSlots.length > 0) {
            setSelectedSlot(res.availableSlots[0]);
          } else {
            setSelectedSlot(null);
          }
        }
      } catch (err) {
        console.error("Failed to refetch slots", err);
      }
    } catch (err) {
      setBookingError(err.message || "Could not create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <SkeletonLoader type="profile" />
      </div>
    );
  }

  /* ❗ Invalid Worker */
  if (!worker) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bold text-gray-800">
          Worker not found
        </h2>

        <p className="text-gray-500 mt-2">
          The worker profile you're looking for does not exist.
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <BookingConfirmationModal
        isOpen={showModal}
        onClose={closeModal}
        bookingDetails={bookingDetails}
      />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT PROFILE CARD */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-6">

            {/* Avatar */}
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-700">
                {worker.name.charAt(0)}
              </div>
              <div className="flex items-center gap-2 mt-4 justify-center">
                <h1 className="text-2xl font-bold">{worker.name}</h1>
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-all focus:outline-none"
                  title={isSaved ? "Remove from Saved" : "Save Professional"}
                >
                  <Heart
                    className={`h-5 w-5 transition-transform active:scale-125 ${
                      isSaved ? "fill-red-500 text-red-500" : "text-slate-400"
                    }`}
                  />
                </button>
              </div>
              <p className="text-blue-600 font-medium">{worker.profession}</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{worker.rating}</span>
                </div>
                <ReviewBadge rating={worker.rating} count={worker.completedJobs} />
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Briefcase size={18} />
                <span>{worker.completedJobs}+ Jobs Completed</span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Clock size={18} />
                <span>{worker.experience} Experience</span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <MapPin size={18} />
                <span>{worker.location}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <ShieldCheck size={18} />
                <span>Verified Professional</span>
              </div>
            </div>

            {/* Smart Estimate Badge */}
            {hasEstimator && (
              <div className="mt-6 flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl py-2.5 px-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-700">
                  Smart Estimate Available
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mt-4 bg-blue-50 rounded-2xl p-5 text-center">
              <p className="text-sm text-gray-500">
                Starting From
              </p>
              <h2 className="text-3xl font-bold text-blue-700 mt-1">
                {worker.price}
              </h2>
              {hasEstimator && (
                <p className="text-xs text-emerald-600 mt-1.5 font-medium">
                  Use Smart Estimator for exact pricing
                </p>
              )}
            </div>

            {/* Time Slot Picker */}
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Clock size={16} className="text-blue-600" />
                Select Appointment Slot
              </h3>
              {slotsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl p-3">
                  No slots available for the next 7 days.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot?.start === slot.start;
                    return (
                      <button
                        key={slot.start}
                        onClick={() => setSelectedSlot(slot)}
                        type="button"
                        className={`text-xs font-semibold py-2 px-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                            : "bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50/50"
                        }`}
                      >
                        {slot.label.split(",").map((part, i) => (
                          <div key={i} className={i === 1 ? "font-bold text-[10px] opacity-90" : ""}>
                            {part.trim()}
                          </div>
                        ))}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={handleBooking}
              disabled={submitting}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition text-white font-semibold py-3 rounded-2xl shadow-md flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Booking…
                </>
              ) : (
                "Quick Book"
              )}
            </button>

            {bookingError && (
              <p
                role="alert"
                className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2"
              >
                {bookingError}
              </p>
            )}
            {!isAuthenticated && (
              <p className="mt-3 text-xs text-gray-500 text-center">
                You'll need to sign in to complete a booking.
              </p>
            )}

            {/* Inline estimate prompt — shown after Quick Book tap */}
            {showQuickBookPrompt && (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 animate-slide-up">
                <p className="text-sm font-semibold text-amber-800 mb-1">
                  Want to know the exact cost first?
                </p>
                <p className="text-xs text-amber-600 mb-3">
                  Use the Smart Estimator to get a transparent breakdown before booking.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowQuickBookPrompt(false);
                      setActiveTab("estimator");
                    }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold py-2 rounded-xl transition flex items-center justify-center gap-1"
                  >
                    <Calculator size={13} />
                    Get Estimate
                  </button>
                  <button
                    onClick={confirmQuickBook}
                    className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold py-2 rounded-xl transition"
                  >
                    Skip, Book Now
                  </button>
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="flex gap-3 mt-4">
              <button className="flex-1 border border-gray-200 hover:bg-gray-100 py-3 rounded-2xl flex items-center justify-center gap-2 transition">
                <Phone size={18} />
                Call
              </button>

              <button className="flex-1 border border-gray-200 hover:bg-gray-100 py-3 rounded-2xl flex items-center justify-center gap-2 transition">
                <MessageCircle size={18} />
                Chat
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── TAB BAR ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                >
                  <Icon size={15} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* About */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold mb-4">About Worker</h2>
                <p className="text-gray-600 leading-8">{worker.bio}</p>
              </div>

              {/* Services */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold mb-6">Services Offered</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["Installation", "Maintenance", "Repair", "Emergency Service"].map((service, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-2xl p-4 hover:border-blue-500 transition"
                    >
                      <h3 className="font-semibold text-gray-800">{service}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Professional {worker.profession.toLowerCase()} service.
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white">
                <h2 className="text-2xl font-bold">Need urgent service?</h2>
                <p className="mt-2 text-blue-100">
                  This worker is available for emergency bookings and same-day service.
                </p>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleBooking}
                    className="bg-white text-blue-700 hover:bg-gray-100 font-semibold px-6 py-3 rounded-2xl transition"
                  >
                    Quick Book
                  </button>
                  {hasEstimator && (
                    <button
                      onClick={() => setShowWizardModal(true)}
                      className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-2xl transition flex items-center gap-2"
                    >
                      <Calculator size={16} />
                      Estimate First
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── ESTIMATOR TAB ── */}
          {activeTab === "estimator" && (
            <SmartEstimator
              profession={worker.profession}
              priceString={worker.price}
              onBookWithEstimate={handleEstimateBooking}
            />
          )}

          {/* ── REVIEWS TAB ── */}
          {activeTab === "reviews" && (
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <h2 className="mb-6 text-2xl font-bold dark:text-white">Customer Reviews</h2>
              <ReviewList reviews={reviews.map(r => ({
                _id: r.id,
                rating: r.rating,
                reviewText: r.text,
                createdAt: r.createdAt,
                isVerified: r.isVerified,
                images: r.images,
                user: { name: r.name }
              }))} />
            </div>
          )}

          {/* ── PORTFOLIO TAB ── */}
          {activeTab === "portfolio" && worker.portfolio && worker.portfolio.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 dark:bg-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Previous Works</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    A snapshot of completed projects
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                  {worker.portfolio.length} projects
                </span>
              </div>
              <ImageGallery images={worker.portfolio} columns={3} />
            </div>
          )}

      {showWizardModal && worker && (
        <EstimateWizard
          isOpen={showWizardModal}
          onClose={() => setShowWizardModal(false)}
          worker={worker}
        />
      )}
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
