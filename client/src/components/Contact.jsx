import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";

const Contact = () => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Message sent successfully!");

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const socialLinks = [
    {
      icon: <FaFacebookF />,
      url: "https://facebook.com",
      color: "hover:bg-blue-600",
      label: "Facebook",
    },
    {
      icon: <FaTwitter />,
      url: "https://twitter.com",
      color: "hover:bg-sky-500",
      label: "Twitter",
    },
    {
      icon: <FaLinkedinIn />,
      url: "https://linkedin.com",
      color: "hover:bg-blue-700",
      label: "LinkedIn",
    },
    {
      icon: <FaGithub />,
      url: "https://github.com",
      color: "hover:bg-gray-800",
      label: "GitHub",
    },
  ];

  const contactCards = [
    {
      icon: <FaEnvelope />,
      title: "Email Us",
      text: "support@fixnearby.com",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: <FaPhoneAlt />,
      title: "Call Us",
      text: "+91 98765 43210",
      bg: "bg-green-100 dark:bg-green-900/30",
      color: "text-green-600 dark:text-green-400",
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Office Address",
      text: "Siliguri, West Bengal, India",
      bg: "bg-orange-100 dark:bg-orange-900/30",
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      icon: <FaClock />,
      title: "Working Hours",
      text: "Mon - Sat : 9:00 AM - 7:00 PM",
      bg: "bg-purple-100 dark:bg-purple-900/30",
      color: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="bg-white text-gray-900 transition-colors duration-300 dark:bg-[#0f172a] dark:text-white">
      <Toaster position="top-right" />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-white blur-3xl"></div>

          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-cyan-300 blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium backdrop-blur-md"
          >
            💬 We're Here To Help
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mt-6 text-5xl font-black tracking-tight md:text-7xl"
          >
            Contact Us
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-blue-100 md:text-xl"
          >
            Have questions, feedback, or need support? Reach out to the
            FixNearby team anytime — we’d love to hear from you.
          </motion.p>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="bg-gray-50 py-24 dark:bg-[#111827]">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2">
          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              Get In Touch
            </div>

            <h2 className="mt-5 text-4xl font-black leading-tight md:text-5xl">
              We'd Love To{" "}
              <span className="text-blue-600 dark:text-blue-400">
                Hear From You
              </span>
            </h2>

            <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              Whether you're looking for support, partnership opportunities,
              worker registration help, or general inquiries — our team is
              always ready to assist you.
            </p>

            {/* CONTACT CARDS */}
            <div className="mt-10 space-y-5">
              {contactCards.map((card, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -4 }}
                  className="flex items-start gap-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-2xl hover:shadow-blue-500/10 dark:border-gray-700 dark:bg-[#1e293b]"
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl ${card.bg} ${card.color}`}
                  >
                    {card.icon}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {card.title}
                    </h3>

                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                      {card.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* SOCIAL LINKS */}
            <div className="mt-12">
              <h3 className="mb-5 text-lg font-bold dark:text-white">
                Follow Us
              </h3>

              <div className="flex gap-4">
                {socialLinks.map((item, index) => (
                  <a
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 transition-all duration-300 hover:scale-110 hover:text-white dark:border-gray-700 dark:bg-[#1e293b] dark:text-gray-300 ${item.color}`}
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* MAP */}
            <div className="mt-12 overflow-hidden rounded-3xl border border-gray-200 shadow-xl dark:border-gray-700">
              <iframe
                title="Google Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114839.94736605542!2d88.35548875000001!3d26.727101!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e44114f28f5df1%3A0xdeb5c4702063edff!2sSiliguri%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
                className="h-80 w-full border-0"
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </motion.div>

          {/* RIGHT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="rounded-[2rem] border border-white/10 bg-white p-8 shadow-2xl backdrop-blur-xl dark:border-gray-700 dark:bg-[#1e293b] lg:p-10"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-black dark:text-white">
                Send a Message
              </h2>

              <p className="mt-3 text-gray-600 dark:text-gray-300">
                Fill out the form and our team will get back to you shortly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your name"
                    className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-[#0f172a] dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:ring-blue-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-[#0f172a] dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:ring-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Subject
                </label>

                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Enter subject"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-[#0f172a] dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Message
                </label>

                <textarea
                  rows="6"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Write your message..."
                  className="w-full resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-[#0f172a] dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:ring-blue-900"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.01] hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative overflow-hidden bg-[#020617] py-24 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-blue-600 blur-3xl"></div>

          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-600 blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto max-w-4xl px-6 text-center"
        >
          <h2 className="text-4xl font-black md:text-5xl">
            Need Immediate Assistance?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-300">
            Browse trusted professionals near you and book services instantly.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-5 sm:flex-row">
            <Link
              to="/services"
              className="rounded-2xl bg-blue-600 px-8 py-4 font-bold transition-all duration-300 hover:scale-105 hover:bg-blue-700"
            >
              Browse Services
            </Link>

            <Link
              to="/register"
              className="rounded-2xl border border-white/20 px-8 py-4 font-bold transition-all duration-300 hover:scale-105 hover:bg-white/10"
            >
              Become a Pro
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Contact;