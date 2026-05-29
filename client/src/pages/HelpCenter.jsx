import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaQuestionCircle,
  FaTools,
  FaUser,
  FaPhoneAlt,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaArrowRight,
  FaHeadset,
  FaClock,
  FaShieldAlt,
} from "react-icons/fa";

const helpCards = [
  {
    icon: <FaUser className="text-sky-500 text-3xl" />,
    title: "Account & Profile",
    desc: "Manage your account settings, update your profile, and keep your information secure.",
    link: "/profile",
  },
  {
    icon: <FaTools className="text-emerald-500 text-3xl" />,
    title: "Booking Services",
    desc: "Book trusted workers quickly and track all your services in one place.",
    link: "/services",
  },
  {
    icon: <FaQuestionCircle className="text-violet-500 text-3xl" />,
    title: "Common Questions",
    desc: "Find answers about payments, cancellations, refunds, and app usage.",
    link: "/faq",
  },
  {
    icon: <FaPhoneAlt className="text-rose-500 text-3xl" />,
    title: "Contact Support",
    desc: "Get help from our support team anytime you need assistance.",
    link: "/contact",
  },
];

const faqs = [
  {
    id: 1,
    q: "How do I book a service?",
    a: "Go to the Services page, select a worker based on ratings and availability, then click 'Book Now' to confirm your service request.",
  },
  {
    id: 2,
    q: "Can I cancel a booking?",
    a: "Yes. You can cancel your booking from your dashboard before the scheduled service time.",
  },
  {
    id: 3,
    q: "Are workers verified?",
    a: "Yes. Workers go through verification checks and are reviewed by customers through ratings and feedback.",
  },
  {
    id: 4,
    q: "How do I make payments?",
    a: "You can securely pay online using cards, UPI, wallets, or other supported payment methods.",
  },
  {
    id: 5,
    q: "How do I contact support?",
    a: "Visit the Contact Support section below or navigate to the Contact page for direct assistance.",
  },
];

const supportStats = [
  {
    icon: <FaHeadset />,
    title: "24/7 Support",
    desc: "Always available",
  },
  {
    icon: <FaClock />,
    title: "Quick Response",
    desc: "Average reply in minutes",
  },
  {
    icon: <FaShieldAlt />,
    title: "Trusted Platform",
    desc: "Safe & secure services",
  },
];

const HelpCenter = () => {
  const [search, setSearch] = useState("");
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [expandedSupport, setExpandedSupport] = useState(null);

  const filteredFaqs = useMemo(() => {
    return faqs.filter(
      (item) =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const toggleFAQ = (id) => {
    setActiveFAQ(activeFAQ === id ? null : id);
  };

  const toggleSupport = (idx) => {
    setExpandedSupport(expandedSupport === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-gray-800 overflow-hidden">
      
      {/* HERO */}
      <header className="relative bg-gray-950 text-white py-20 px-6">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_#3b82f6,_transparent_40%)]"></div>

        <div className="relative max-w-6xl mx-auto text-center">
          <span className="inline-flex items-center px-4 py-1 rounded-full border border-white/20 bg-white/10 text-sm backdrop-blur">
            Support Center
          </span>

          <h1 className="mt-6 text-4xl md:text-6xl font-extrabold">
            How can we help you today?
          </h1>

          <p className="mt-5 text-gray-300 max-w-2xl mx-auto">
            Browse FAQs and find quick solutions for FixNearby.
          </p>

          <div className="max-w-2xl mx-auto mt-10">
            <div className="bg-white/10 border border-white/20 backdrop-blur-lg rounded-2xl flex items-center px-5 py-4">
              <FaSearch className="text-gray-300 mr-3" />

              <input
                type="text"
                placeholder="Search FAQs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none text-white placeholder:text-gray-300"
              />
            </div>
          </div>
        </div>
      </header>

      {/* EXPANDABLE SUPPORT SECTION */}
      <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid md:grid-cols-3 gap-5">
          {supportStats.map((item, idx) => {
            const isOpen = expandedSupport === idx;

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border shadow-lg overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleSupport(idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                      {item.icon}
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>

                  {isOpen ? (
                    <FaChevronUp className="text-gray-500" />
                  ) : (
                    <FaChevronDown className="text-gray-500" />
                  )}
                </button>

                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "max-h-60 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6 text-gray-600 border-t">
                    <p className="pt-4">
                      {idx === 0 &&
                        "Our support team is available anytime to help with account issues, bookings, and technical assistance."}

                      {idx === 1 &&
                        "Most customer queries are answered within a few minutes for faster service resolution."}

                      {idx === 2 &&
                        "All services are protected with secure transactions, verified workers, and reliable customer support."}
                    </p>

                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2 mt-4 text-blue-600 font-medium hover:gap-3 transition-all"
                    >
                      Learn More
                      <FaArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HELP CARDS */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {helpCards.map((card, idx) => (
            <Link
              key={idx}
              to={card.link}
              className="group bg-white rounded-3xl p-6 border shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="mb-5">{card.icon}</div>

              <h3 className="text-xl font-bold">{card.title}</h3>

              <p className="mt-3 text-gray-500 text-sm leading-relaxed">
                {card.desc}
              </p>

              <div className="mt-6 flex items-center text-blue-600 font-medium gap-2 group-hover:gap-3 transition-all">
                Explore
                <FaArrowRight />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold">Frequently Asked Questions</h2>

          <p className="mt-4 text-gray-500">
            Quick answers to common customer questions.
          </p>
        </div>

        <div className="space-y-5">
          {filteredFaqs.length ? (
            filteredFaqs.map((item) => {
              const isOpen = activeFAQ === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white border rounded-2xl shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(item.id)}
                    className="w-full flex justify-between items-center p-6 text-left"
                  >
                    <span className="font-semibold text-lg">
                      {item.q}
                    </span>

                    {isOpen ? (
                      <FaChevronUp className="text-blue-600" />
                    ) : (
                      <FaChevronDown className="text-gray-500" />
                    )}
                  </button>

                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? "max-h-40 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="px-6 pb-6 text-gray-600 leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500">
              No matching FAQs found.
            </p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white text-center py-20 mt-20">
        <h3 className="text-3xl font-bold">Still need help?</h3>

        <p className="mt-4 text-blue-100">
          Contact our support team anytime.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/contact"
            className="px-6 py-3 bg-white text-blue-700 rounded-xl font-semibold hover:bg-slate-100 transition"
          >
            Contact Support
          </Link>

          <Link
            to="/faq"
            className="px-6 py-3 border border-white rounded-xl hover:bg-white/10 transition"
          >
            Browse FAQs
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;