import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  MessageSquare,
  Send,
  ShieldCheck,
  ThumbsUp,
  Sparkles,
} from "lucide-react";

const Feedback = () => {
  const [form, setForm] = useState({
    name: "",
    rating: 5,
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.name === "rating"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Feedback submitted:", form);

    setSubmitted(true);

    setForm({
      name: "",
      rating: 5,
      message: "",
    });

    setTimeout(() => setSubmitted(false), 3500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">

      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 relative z-10">

          <div className="text-center max-w-3xl mx-auto">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Your opinion helps us improve
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Share Your Experience with{" "}
              <span className="text-primary">FixNearby</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed">
              Tell us about your experience with our professionals and services.
              Your feedback helps us build a more trusted platform.
            </p>

          </div>

        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="relative -mt-4 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid lg:grid-cols-2 gap-10 items-start">

            {/* LEFT INFO CARD */}
            <div className="space-y-6">

              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">

                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>

                <h2 className="text-3xl font-extrabold text-slate-900">
                  Why Your Feedback Matters
                </h2>

                <p className="mt-4 text-slate-600 leading-relaxed">
                  We use customer reviews to improve service quality,
                  verify professionals, and provide a better experience
                  for homeowners and workers.
                </p>

                <div className="mt-8 space-y-5">

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Trusted Platform
                      </h3>

                      <p className="text-slate-600 text-sm mt-1">
                        Reviews help users choose reliable and verified professionals.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center shrink-0">
                      <ThumbsUp className="w-6 h-6 text-yellow-600" />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Better Experience
                      </h3>

                      <p className="text-slate-600 text-sm mt-1">
                        Your suggestions directly influence future improvements.
                      </p>
                    </div>
                  </div>

                </div>

              </div>

              {/* QUICK STATS */}
              <div className="grid grid-cols-2 gap-5">

                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-center">
                  <h3 className="text-4xl font-extrabold text-slate-900">
                    4.9★
                  </h3>

                  <p className="mt-2 text-slate-500 font-medium">
                    Average Rating
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-center">
                  <h3 className="text-4xl font-extrabold text-slate-900">
                    10K+
                  </h3>

                  <p className="mt-2 text-slate-500 font-medium">
                    Happy Customers
                  </p>
                </div>

              </div>

            </div>

            {/* FEEDBACK FORM */}
            <div className="bg-white border border-slate-200 rounded-[32px] shadow-[0_20px_50px_rgba(15,23,42,0.08)] p-8 sm:p-10">

              <div className="mb-8">

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold mb-5">
                  <Send className="w-4 h-4" />
                  Feedback Form
                </div>

                <h2 className="text-3xl font-extrabold text-slate-900">
                  Tell Us What You Think
                </h2>

                <p className="mt-3 text-slate-600">
                  We appreciate honest feedback and suggestions.
                </p>

              </div>

              {submitted && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-700 font-medium">
                  🎉 Thank you! Your feedback has been submitted successfully.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* NAME */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Your Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-primary transition"
                  />
                </div>

                {/* RATING */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Your Rating
                  </label>

                  <div className="flex items-center gap-2">

                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() =>
                          setForm({ ...form, rating: star })
                        }
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-9 h-9 ${
                            star <= (hoveredStar || form.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}

                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Selected Rating:{" "}
                    <span className="font-semibold text-slate-700">
                      {form.rating}/5
                    </span>
                  </p>
                </div>

                {/* MESSAGE */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Your Feedback
                  </label>

                  <textarea
                    name="message"
                    placeholder="Share your experience with the service..."
                    value={form.message}
                    onChange={handleChange}
                    required
                    className="w-full h-36 resize-none rounded-2xl border border-slate-300 bg-white px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-primary transition"
                  />
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-white font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Send className="w-5 h-5" />
                  Submit Feedback
                </button>

              </form>

              {/* FOOTER */}
              <div className="mt-8 pt-6 border-t border-slate-200 text-center">

                <p className="text-sm text-slate-500">
                  Need help?{" "}
                  <Link
                    to="/contact"
                    className="font-semibold text-primary hover:underline"
                  >
                    Contact Support
                  </Link>
                </p>

              </div>

            </div>

          </div>

        </div>
      </section>
    </div>
  );
};

export default Feedback;