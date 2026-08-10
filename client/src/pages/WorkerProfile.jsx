import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useMemo, useState, useEffect, useCallback } from "react";

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
  Share2,
  DollarSign,
  CheckCircle,
  Download,
} from "lucide-react";

import SkeletonLoader from "../components/SkeletonLoader";
import BookingConfirmationModal from "../components/BookingConfirmationModal";
import WorkerVerificationBadge from "../components/WorkerVerificationBadge";
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
import { shareWorkerProfile } from "../utils/shareWorkerProfile";
import { getWorkerServices } from "../services/workerService";
import { downloadWorkerVCard } from "../utils/workerVCard";
import MultiLocationGeofenceCard from "../components/MultiLocationGeofenceCard";


/* ✅ Move data outside component */
const WORKERS = {
  1: {
    id: 1,
    name: "John Doe",
    profession: "Electrician",
    isAvailableNow: true,
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

const ReviewList = ({ reviews, isOwnProfile, workerName, onReplyAdded }) => {
  const { showToast } = useToast();
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const handleSubmitReply = async (reviewId) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await api.post(`/reviews/${reviewId}/response`, { responseText: replyText });
      if (res.data?.success) {
        showToast("Response posted successfully!", "success");
        setReplyText("");
        setReplyingToId(null);
        if (onReplyAdded) onReplyAdded();
      }
    } catch (err) {
      console.error("Failed to post reply:", err);
      showToast(err.response?.data?.message || "Failed to post reply.", "error");
    } finally {
      setSubmittingReply(false);
    }
  };

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews).toFixed(1)
    : 0;

  const distribution = [0, 0, 0, 0, 0];
  reviews.forEach(r => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating || 0)));
    distribution[star - 1]++;
  });

  return (
    <div className="space-y-8">
      {totalReviews > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-700">
          <div className="text-center">
            <p className="text-5xl font-black text-blue-600 dark:text-blue-400">{averageRating}</p>
            <div className="flex justify-center gap-1 my-2 text-yellow-400 text-lg">
              {"★".repeat(Math.round(averageRating)) + "☆".repeat(5 - Math.round(averageRating))}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Based on {totalReviews} reviews</p>
          </div>
          
          <div className="md:col-span-2 space-y-2">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = distribution[stars - 1];
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-sm">
                  <span className="w-12 font-medium text-slate-600 dark:text-slate-400">{stars} Star</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right font-medium text-slate-600 dark:text-slate-400">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
          <p className="text-slate-500 dark:text-slate-400 font-medium">No reviews yet for this professional.</p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review._id || review.id} className="border border-slate-150 dark:border-slate-700 rounded-3xl p-6 bg-white dark:bg-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800 dark:text-white">{review.user?.name || "Verified Customer"}</h4>
                  {review.isVerified && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      ✓ Verified Hire
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex text-yellow-400 text-sm">
                    {"★".repeat(Math.round(review.rating || 0)) + "☆".repeat(5 - Math.round(review.rating || 0))}
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {new Date(review.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{review.reviewText}</p>

            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {review.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhoto(img.startsWith('http') || img.startsWith('/') ? img : `${api.defaults.baseURL || 'http://localhost:5000'}${img}`)}
                    className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 hover:border-blue-500 transition active:scale-95"
                  >
                    <img
                      src={img.startsWith('http') || img.startsWith('/') ? img : `${api.defaults.baseURL || 'http://localhost:5000'}${img}`}
                      alt="Review attachment"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {review.replyText ? (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 ml-4 sm:ml-8 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Response from {workerName}
                  </h5>
                  <span className="text-[10px] text-slate-400">
                    {new Date(review.repliedAt).toLocaleDateString([], { dateStyle: 'medium' })}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-450 leading-relaxed">
                  {review.replyText}
                </p>
              </div>
            ) : (
              isOwnProfile && (
                <div className="pt-2">
                  {replyingToId === (review._id || review.id) ? (
                    <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Respond as {workerName}
                      </h5>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your response to this customer review..."
                        maxLength={1000}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 resize-none min-h-[100px]"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToId(null);
                            setReplyText("");
                          }}
                          className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-white dark:hover:bg-slate-700 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={submittingReply || !replyText.trim()}
                          onClick={() => handleSubmitReply(review._id || review.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition disabled:opacity-50"
                        >
                          {submittingReply ? "Posting..." : "Post Response"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingToId(review._id || review.id);
                        setReplyText("");
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      💬 Respond to Review
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 cursor-zoom-out"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl">
            <img src={selectedPhoto} alt="Review attachment full resolution" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};

const WorkerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { isAuthenticated, user } = useAuth();
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

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [workerServices, setWorkerServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const res = await api.get(`/workers/${id}/reviews`);
      if (res.data?.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error("Failed to fetch worker reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Fetch worker's service catalog
  useEffect(() => {
    const fetchServices = async () => {
      if (!id) return;
      setServicesLoading(true);
      try {
        const data = await getWorkerServices(id);
        if (data?.success && data.services) {
          setWorkerServices(data.services);
        }
      } catch (err) {
        console.error('Failed to fetch worker services:', err);
      } finally {
        setServicesLoading(false);
      }
    };
    // Only fetch for non-mock workers (valid ObjectId)
    if (id && !/^\d+$/.test(id)) {
      fetchServices();
    }
  }, [id]);

  const isOwnProfile = isAuthenticated && user && String(user._id || user.id) === String(id);

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

  const handleShareProfile = async () => {
    try {
      const result = await shareWorkerProfile({ worker });
      showToast(
        result === 'copied' ? 'Profile link copied to clipboard.' : 'Profile shared successfully.',
        'success',
      );
    } catch (error) {
      if (error.name !== 'AbortError') {
        showToast(error.message || 'Unable to share this profile.', 'error');
      }
    }
  };

  const handleSaveContact = () => {
    downloadWorkerVCard(worker, window.location.href);
    showToast('Professional contact card downloaded.', 'success');
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
        const mockW = WORKERS[workerId];
        setWorker({
          ...mockW,
          slaResponseMins: mockW.slaResponseMins || 20,
          serviceCoverage: mockW.serviceCoverage || ["Local Metro Area"],
          cancellationPolicy: mockW.cancellationPolicy || "Free cancellation up to 24 hours prior to slot.",
          refundPolicy: mockW.refundPolicy || "Full refund guaranteed if response SLA is missed.",
          verificationStatus: mockW.verificationStatus || "verified",
        });
        setLoading(false);
      } else {
        // Fetch from backend
        try {
          const res = await api.get(`/workers/${id}`);
          const backendWorker = res.data?.worker || res.data;
          
          setWorker({
            id: backendWorker._id || backendWorker.id,
            name: backendWorker.name,
            profession: backendWorker.category || backendWorker.profession,
            isAvailableNow: backendWorker.isAvailableNow === true,
            price: backendWorker.price ? (backendWorker.price.toString().startsWith('$') ? backendWorker.price : `$${backendWorker.price}/hr`) : "$30/hr",
            rating: backendWorker.rating || 4.5,
            experience: backendWorker.experience ? (backendWorker.experience.toString().toLowerCase().includes("year") ? backendWorker.experience : `${backendWorker.experience} Years`) : "3 Years",
            location: backendWorker.location || "Local Area",
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
            slaResponseMins: backendWorker.slaResponseMins,
            serviceCoverage: backendWorker.serviceCoverage,
            cancellationPolicy: backendWorker.cancellationPolicy,
            refundPolicy: backendWorker.refundPolicy,
            verificationStatus: backendWorker.verificationStatus || 'verified',
            topPerformerBadge: backendWorker.topPerformerBadge || false,
            monthlyCompletedJobs: backendWorker.monthlyCompletedJobs || 0,
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

      <div className="max-w-6xl mx-auto flex flex-wrap justify-end gap-2 mb-4 px-2">
        <button
          type="button"
          onClick={handleSaveContact}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 border border-gray-200 rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Save ${worker.name} as a contact`}
        >
          <Download className="w-5 h-5" />
          Save Contact
        </button>
        <button
          type="button"
          onClick={handleShareProfile}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 border border-gray-200 rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Share ${worker.name}'s profile`}
        >
          <Share2 className="w-5 h-5" />
          Share Profile
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT PROFILE CARD */}
        <div className="lg:col-span-1">
          <div className={`bg-white dark:bg-slate-800 rounded-3xl shadow-lg border p-6 sticky top-6 transition-all duration-300 ${
            worker.isAvailableNow
              ? "border-emerald-400/80 dark:border-emerald-500/60 shadow-emerald-500/10 ring-2 ring-emerald-500/20"
              : "border-amber-300/80 dark:border-amber-500/50 shadow-amber-500/10 ring-2 ring-amber-400/20"
          }`}>

            {/* Avatar */}
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-4xl font-black text-blue-700 dark:text-blue-400 shadow-inner">
                  {worker.name.charAt(0)}
                </div>
                {worker.isAvailableNow && (
                  <span className="absolute bottom-2 right-2 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-2 border-white dark:border-slate-800"></span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-4 justify-center">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">{worker.name}</h1>
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-all focus:outline-none"
                  title={isSaved ? "Remove from Saved" : "Save Professional"}
                >
                  <Heart
                    className={`h-5 w-5 transition-transform active:scale-125 ${
                      isSaved ? "fill-red-500 text-red-500" : "text-slate-400"
                    }`}
                  />
                </button>
              </div>
              <p className="text-blue-600 dark:text-blue-400 font-extrabold text-sm tracking-wide mt-0.5">{worker.profession}</p>
              <div className="flex items-center gap-2 mt-3">
                {/* High-Contrast Floating Rating Pill */}
                <div className="flex items-center gap-1.5 bg-amber-400 dark:bg-amber-500 px-3.5 py-1.5 rounded-full shadow-md shadow-amber-500/20 border border-amber-300/50 backdrop-blur-md">
                  <Star size={16} className="fill-slate-950 text-slate-950" />
                  <span className="font-black text-slate-950 text-xs">{worker.rating}</span>
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
                <ShieldCheck size={18} className={worker.verificationStatus === 'verified' ? "text-emerald-500" : "text-amber-500"} />
                <span className="capitalize">{worker.verificationStatus || 'Verified'} Professional</span>
              </div>

              {/* Top Performer Milestone Reward Badge */}
              {(worker.topPerformerBadge || (worker.monthlyCompletedJobs && worker.monthlyCompletedJobs >= 10)) && (
                <div className="mt-3 flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl p-3 shadow-md border border-amber-400/30">
                  <div className="p-1.5 bg-white/20 rounded-xl">
                    <Award size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider">Top Performer</p>
                    <p className="text-[11px] text-amber-100 font-medium">{worker.monthlyCompletedJobs || 10}+ jobs completed this month</p>
                  </div>
                </div>
              )}
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

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate("/login", { state: { from: `/worker/${id}` } });
                  return;
                }
                navigate("/chat");
              }}
              className="w-full mt-2.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 hover:border-blue-200 transition font-semibold py-3 rounded-2xl flex items-center justify-center gap-2"
            >
              <MessageSquare size={18} />
              Chat with Professional
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Services & Pricing</h2>
                  {servicesLoading && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </span>
                  )}
                </div>
                {workerServices.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {workerServices.map((service, index) => (
                      <div
                        key={service._id || index}
                        className="border border-gray-200 rounded-2xl p-4 hover:border-blue-500 hover:shadow-sm transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate">{service.name}</h3>
                            {service.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg font-bold text-blue-600">${Number(service.price).toFixed(2)}</p>
                            <p className="text-[10px] text-gray-400">{service.duration || 60} min</p>
                          </div>
                        </div>
                        {service.isActive && (
                          <div className="mt-2 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-[10px] font-medium text-green-600">Available</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
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
                )}
              </div>

              {/* Trust, SLA & Policies */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold mb-6">Trust, SLA & Policies</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Response SLA */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Response SLA</h4>
                      <p className="text-sm text-gray-600 mt-1">Replies within {worker.slaResponseMins || 30} minutes</p>
                    </div>
                  </div>

                  {/* Coverage Area */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Service Coverage</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {Array.isArray(worker.serviceCoverage) ? worker.serviceCoverage.join(', ') : worker.serviceCoverage || 'Local Metro Area'}
                      </p>
                    </div>
                  </div>

                  {/* Cancellation Policy */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Cancellation Policy</h4>
                      <p className="text-sm text-gray-600 mt-1">{worker.cancellationPolicy || 'Free cancellation up to 24 hours prior to slot.'}</p>
                    </div>
                  </div>

                  {/* Refund Policy */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                      <Award size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Refund Policy</h4>
                      <p className="text-sm text-gray-600 mt-1">{worker.refundPolicy || 'Full refund guaranteed if response SLA is missed.'}</p>
                    </div>
                  </div>
                </div>

                {/* Compliance / Verification Alert */}
                <div className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs text-gray-500 font-medium">
                    This service provider's credentials, business license, and identification are <span className="text-emerald-600 font-bold capitalize">{worker.verificationStatus || 'verified'}</span> by our compliance team.
                  </p>
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
              <ReviewList
                reviews={reviews}
                isOwnProfile={isOwnProfile}
                workerName={worker?.name || "Professional"}
                onReplyAdded={fetchReviews}
              />
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
