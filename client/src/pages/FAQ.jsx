// FAQ.jsx

import { useState } from "react";

const faqs = [
  {
    question: "How do I book a worker?",
    answer:
      "Simply browse professionals, view their profile, and click on the 'Book Now' button to schedule a service.",
  },
  {
    question: "Are all workers verified?",
    answer:
      "Yes, FixNearby verifies worker identity, experience, and service quality before approval.",
  },
  {
    question: "Can I cancel a booking?",
    answer:
      "Yes, bookings can be canceled before the scheduled service time from your dashboard.",
  },
  {
    question: "How do payments work?",
    answer:
      "You can pay securely online or directly to the worker depending on the service option.",
  },
  {
    question: "Do workers provide emergency services?",
    answer:
      "Many professionals offer emergency and same-day services depending on availability.",
  },
  {
    question: "Can I become a professional on FixNearby?",
    answer:
      "Yes! You can register as a worker from the 'Become a Pro' page and start receiving jobs.",
  },
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* HERO */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-6">
            ❓ Frequently Asked Questions
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
            Need Help?
          </h1>

          <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
            Find answers to common questions about bookings, workers,
            payments, and services on FixNearby.
          </p>
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
                  className={`grid transition-all duration-300 ease-in-out ${
                    activeIndex === index
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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