// FAQ.jsx

import { useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaHeadset,
} from "react-icons/fa";

const faqs = [
  {
    category: "Booking",
    question: "How do I book a worker?",
    answer:
      "Simply browse professionals, view their profile, and click on the 'Book Now' button to schedule a service.",
  },
  {
    category: "Verification",
    question: "Are all workers verified?",
    answer:
      "Yes, FixNearby verifies worker identity, experience, and service quality before approval.",
  },
  {
    category: "Booking",
    question: "Can I cancel a booking?",
    answer:
      "Yes, bookings can be canceled before the scheduled service time from your dashboard.",
  },
  {
    category: "Payments",
    question: "How do payments work?",
    answer:
      "You can pay securely online or directly to the worker depending on the service option.",
  },
  {
    category: "Services",
    question: "Do workers provide emergency services?",
    answer:
      "Many professionals offer emergency and same-day services depending on availability.",
  },
  {
    category: "Professional",
    question: "Can I become a professional on FixNearby?",
    answer:
      "Yes! You can register as a worker from the 'Become a Pro' page and start receiving jobs.",
  },
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [search, setSearch] = useState("");

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen">
      {/* HERO */}
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-6">
            ❓ Frequently Asked Questions
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
            Need Help?
          </h1>

          <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
            Find answers to common questions about bookings, workers,
            payments, and services on FixNearby.
          </p>

          {/* SEARCH BAR */}
          <div className="mt-10 max-w-xl mx-auto relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search FAQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0056D2]"
            />
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-5">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between text-left px-6 py-5"
                >
                  <h3 className="text-lg font-semibold text-slate-900">
                    {faq.question}
                  </h3>

                  <span className="text-2xl font-bold text-primary">
                    {activeIndex === index ? "−" : "+"}
                  </span>
                </button>

                <div
                  key={index}
                  className={`group rounded-3xl border transition-all duration-300 overflow-hidden ${
                    activeIndex === index
                      ? "border-blue-200 shadow-lg bg-blue-50/40"
                      : "border-slate-200 bg-white hover:shadow-md"
                  }`}
                >
                  {/* QUESTION */}
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-6 text-left"
                  >
                    <div>
                      <span className="inline-block text-xs font-semibold uppercase tracking-wide bg-slate-100 text-slate-500 px-3 py-1 rounded-full mb-3">
                        {faq.category}
                      </span>

                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                        {faq.question}
                      </h3>
                    </div>

                    <div
                      className={`min-w-[45px] h-[45px] rounded-xl flex items-center justify-center transition ${
                        activeIndex === index
                          ? "bg-[#0056D2] text-white"
                          : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                      }`}
                    >
                      {activeIndex === index ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </div>
                  </button>

                  {/* ANSWER */}
                  <div
                    className={`grid transition-all duration-500 ease-in-out ${
                      activeIndex === index
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6 text-slate-600 leading-relaxed text-[15px]">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 border border-dashed border-slate-300 rounded-3xl bg-white">
                <p className="text-slate-500 text-lg">
                  No FAQs found for your search.
                </p>
              </div>
            )}
          </div>

          {/* SUPPORT CARD */}
          <div className="mt-16 bg-primary rounded-3xl p-10 text-center text-white shadow-xl">
            <h2 className="text-3xl font-extrabold mb-4">
              Still have questions?
            </h2>

            <p className="text-white/80 text-lg mb-8">
              Our support team is here to help you anytime.
            </p>

            <button className="bg-white text-primary px-8 py-3 rounded-xl font-semibold hover:bg-slate-100 transition">
              Contact Support
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;