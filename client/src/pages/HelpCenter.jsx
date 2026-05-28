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
                className="w-full bg-transparent outline-none text-white"
              />
            </div>
          </div>
        </div>
      </header>

      {/* STATS */}
      <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid md:grid-cols-3 gap-5">
          {supportStats.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-lg border flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                {item.icon}
              </div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="space-y-5">
          {filteredFaqs.length ? (
            filteredFaqs.map((item) => {
              const isOpen = activeFAQ === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white border rounded-2xl shadow-sm"
                >
                  <button
                    onClick={() => toggleFAQ(item.id)}
                    className="w-full flex justify-between p-6 text-left"
                  >
                    <span className="font-semibold">{item.q}</span>
                    {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </button>

                  <div
                    className={`overflow-hidden transition-all ${
                      isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="px-6 pb-6 text-gray-600">{item.a}</p>
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
      <section className="bg-blue-600 text-white text-center py-20">
        <h3 className="text-3xl font-bold">Still need help?</h3>
        <p className="mt-4 text-blue-100">
          Contact our support team anytime.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/contact"
            className="px-6 py-3 bg-white text-blue-700 rounded-xl font-semibold"
          >
            Contact Support
          </Link>

          <Link
            to="/faq"
            className="px-6 py-3 border border-white rounded-xl"
          >
            Browse FAQs
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;