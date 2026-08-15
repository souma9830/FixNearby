import { useState, useEffect } from "react";
import {
  Lightbulb,

  ThumbsUp,
  Clock,




  Search,
} from "lucide-react";
import {

  getMyRequests,
  upvoteRequest,
} from "../services/serviceRequestService";
import QuoteRequestWizard from "../components/QuoteRequestWizard";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  reviewed: "bg-blue-100 text-blue-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  fulfilled: "bg-purple-100 text-purple-700",
};

const RequestService = () => {
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [upvotingId, setUpvotingId] = useState(null);

  // Load user's previous requests
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyRequests({ limit: 20 });
        if (data.success) {
          setMyRequests(data.requests || []);
        }
      } catch {
        // Silently fail — the list is supplementary
      } finally {
        setLoadingRequests(false);
      }
    };
    load();
  }, []);

  const handleUpvote = async (id) => {
    setUpvotingId(id);
    try {
      const data = await upvoteRequest(id);
      if (data.success && data.request) {
        setMyRequests((prev) =>
          prev.map((r) =>
            r._id === id ? { ...r, voteCount: data.request.voteCount } : r
          )
        );
      }
    } catch {
      // ignore — vote count is best-effort
    } finally {
      setUpvotingId(null);
    }
  };

  const handleWizardComplete = (newRequest) => {
    if (newRequest) {
      setMyRequests((prev) => [newRequest, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0056D2]/5 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-4">
              <Lightbulb className="w-4 h-4" />
              Interactive Multi-Step Quote Assistant
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Request a Custom Service Quote
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Answer a few guided questions, attach photos, and receive exact, qualified pricing offers from top local professionals.
            </p>
          </div>
        </div>
      </section>

      <section className="relative pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            {/* Interactive Quote Wizard */}
            <div className="lg:col-span-8">
              <QuoteRequestWizard onComplete={handleWizardComplete} />
            </div>

            {/* Right sidebar — previous requests */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Search className="w-4 h-4 text-slate-400" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Your Requests
                  </h3>
                </div>

                {loadingRequests ? (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-xl border border-slate-100 p-4 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-2/3" />
                        <div className="h-3 bg-slate-100 rounded w-full" />
                      </div>
                    ))}
                  </div>
                ) : myRequests.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">
                    You haven't submitted any requests yet.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {myRequests.map((req) => (
                      <div
                        key={req._id}
                        className="rounded-xl border border-slate-100 p-4 space-y-2 hover:shadow-sm transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-800 leading-tight">
                            {req.categoryName}
                          </h4>
                          <span
                            className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              STATUS_STYLES[req.status] || "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {req.description}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpvote(req._id)}
                            disabled={upvotingId === req._id}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#0056D2] disabled:opacity-50 transition"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            {req.voteCount || 0}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RequestService;
