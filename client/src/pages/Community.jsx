import { Link } from "react-router-dom";
import {
  Users,
  MessageCircle,
  Heart,
  Star,
  TrendingUp,
  Image,
  BadgeCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const Community = () => {
  const feeds = [
    {
      id: 1,
      user: "Amit Sharma",
      role: "Electrician",
      verified: true,
      post: "5 simple ways to reduce electricity bills during summer ⚡",
      likes: 124,
      comments: 32,
      trending: true,
    },
    {
      id: 2,
      user: "Ravi Kumar",
      role: "Plumber",
      verified: true,
      post: "Always check hidden leaks before monsoon season starts.",
      likes: 86,
      comments: 18,
      trending: false,
    },
    {
      id: 3,
      user: "Ananya Roy",
      role: "Customer",
      verified: false,
      post: "Booked a painter today and the service was excellent 👏",
      likes: 210,
      comments: 48,
      trending: true,
    },
  ];

  const communities = [
    {
      title: "Home Repair Experts",
      members: "12K Members",
      color: "from-blue-500 to-cyan-400",
    },
    {
      title: "Electrical Tips",
      members: "8K Members",
      color: "from-yellow-500 to-orange-400",
    },
    {
      title: "Plumbing Solutions",
      members: "6K Members",
      color: "from-emerald-500 to-green-400",
    },
  ];

  const leaderboard = [
    {
      name: "Amit Sharma",
      points: "2,450 pts",
    },
    {
      name: "Ravi Kumar",
      points: "2,120 pts",
    },
    {
      name: "Jane Smith",
      points: "1,980 pts",
    },
  ];

  return (
    <div className="bg-[#0B1020] text-white min-h-screen overflow-hidden">
      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-cyan-400/10 to-purple-500/20 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-xl px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span className="text-sm font-medium">
                  Community Powered Platform
                </span>
              </div>

              <h1 className="mt-8 text-5xl md:text-7xl font-black leading-tight">
                Connect With
                <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
                  {" "}
                  Skilled People
                </span>
              </h1>

              <p className="mt-8 text-lg text-slate-300 leading-relaxed max-w-2xl">
                Join thousands of homeowners and professionals sharing
                ideas, experiences, tips, and trusted recommendations.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <button className="bg-gradient-to-r from-blue-500 to-cyan-400 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition">
                  Join Community
                </button>

                <Link
                  to="/services"
                  className="border border-white/20 bg-white/5 backdrop-blur-xl px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition"
                >
                  Explore Services
                </Link>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-3 gap-4 mt-14">
                {[
                  { number: "24K+", label: "Members" },
                  { number: "8K+", label: "Daily Posts" },
                  { number: "99%", label: "Trusted" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5"
                  >
                    <h3 className="text-3xl font-black">
                      {item.number}
                    </h3>

                    <p className="text-slate-400 mt-1">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div className="relative">
              <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold">
                      Live Community Feed
                    </h3>

                    <p className="text-slate-400 mt-1">
                      Trending discussions today
                    </p>
                  </div>

                  <TrendingUp className="w-7 h-7 text-cyan-300" />
                </div>

                <div className="space-y-5">
                  {feeds.map((feed) => (
                    <div
                      key={feed.id}
                      className="bg-[#121933] border border-white/5 rounded-3xl p-5 hover:border-cyan-400/30 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold">
                            {feed.user.charAt(0)}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold">
                                {feed.user}
                              </h4>

                              {feed.verified && (
                                <BadgeCheck className="w-4 h-4 text-cyan-300" />
                              )}
                            </div>

                            <p className="text-sm text-slate-400">
                              {feed.role}
                            </p>
                          </div>
                        </div>

                        {feed.trending && (
                          <span className="bg-cyan-400/20 text-cyan-300 text-xs px-3 py-1 rounded-full">
                            Trending
                          </span>
                        )}
                      </div>

                      <p className="mt-5 text-slate-300 leading-relaxed">
                        {feed.post}
                      </p>

                      <div className="flex items-center gap-6 mt-6 text-slate-400">
                        <div className="flex items-center gap-2">
                          <Heart className="w-5 h-5" />
                          <span>{feed.likes}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-5 h-5" />
                          <span>{feed.comments}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Image className="w-5 h-5" />
                          <span>Photos</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FLOATING CARD */}
              <div className="absolute -bottom-8 -left-10 hidden lg:block bg-gradient-to-r from-blue-500 to-cyan-400 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-4 rounded-2xl">
                    <Users className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="text-3xl font-black">
                      24K+
                    </h4>

                    <p className="text-sm text-white/80">
                      Active Members
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITIES */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-5xl font-black">
                Explore Communities
              </h2>

              <p className="mt-4 text-slate-400 text-lg">
                Find discussions that match your interests.
              </p>
            </div>

            <button className="flex items-center gap-2 bg-white/10 border border-white/10 px-6 py-3 rounded-2xl hover:bg-white/15 transition">
              View All
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {communities.map((community, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 hover:scale-[1.02] transition"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${community.color} opacity-10`}
                />

                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center">
                    <Users className="w-10 h-10 text-cyan-300" />
                  </div>

                  <h3 className="mt-8 text-3xl font-black">
                    {community.title}
                  </h3>

                  <p className="mt-3 text-slate-400">
                    {community.members}
                  </p>

                  <button className="mt-8 bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold hover:bg-cyan-300 transition">
                    Join Group
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERBOARD */}
      <section className="py-24 bg-[#121933]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-5xl font-black">
              Community Leaders
            </h2>

            <p className="mt-4 text-slate-400 text-lg">
              Top contributors helping the community grow.
            </p>
          </div>

          <div className="mt-16 space-y-5">
            {leaderboard.map((user, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between hover:border-cyan-400/30 transition"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xl font-black">
                    {idx + 1}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">
                      {user.name}
                    </h3>

                    <p className="text-slate-400">
                      Top Community Expert
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-cyan-300 font-bold text-lg">
                  <Star className="w-5 h-5 fill-cyan-300" />
                  {user.points}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY PREVIEW */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* LEFT */}
            <div>
              <span className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold">
                Community Hub
              </span>

              <h2 className="mt-6 text-5xl font-extrabold leading-tight">
                Join Thousands Of Skilled Professionals
              </h2>

              <p className="mt-6 text-slate-300 text-lg leading-relaxed">
                Discover trending discussions, connect with experts,
                share experiences, and learn home maintenance tips
                from trusted workers and homeowners.
              </p>

              <div className="mt-10 flex gap-4 flex-wrap">
                <Link
                  to="/community"
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl font-bold transition"
                >
                  Explore Community
                </Link>

                <Link
                  to="/services"
                  className="border border-white/20 px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition"
                >
                  Browse Services
                </Link>
              </div>
            </div>

            {/* RIGHT */}
            <div className="grid gap-5">
              {[
                {
                  title: "Electrical Safety Tips",
                  desc: "Simple ways to keep your home safe from electrical issues.",
                  comments: "124 comments",
                },
                {
                  title: "Best Plumbing Fixes",
                  desc: "Learn quick plumbing solutions from verified experts.",
                  comments: "89 comments",
                },
                {
                  title: "Painting Inspiration",
                  desc: "Trending color combinations for modern homes.",
                  comments: "56 comments",
                },
              ].map((post, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-blue-400/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
                      Trending
                    </span>

                    <span className="text-sm text-slate-400">
                      {post.comments}
                    </span>
                  </div>

                  <h3 className="mt-5 text-2xl font-bold">
                    {post.title}
                  </h3>

                  <p className="mt-3 text-slate-300 leading-relaxed">
                    {post.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-r from-blue-600 to-cyan-500 p-16 text-center shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-white/5 backdrop-blur-xl" />

            <div className="relative">
              <ShieldCheck className="w-16 h-16 mx-auto mb-6" />

              <h2 className="text-5xl font-black">
                Join The Fastest Growing Community
              </h2>

              <p className="mt-6 text-lg text-blue-100 max-w-2xl mx-auto">
                Learn from experts, connect with homeowners, and build
                trusted relationships in one powerful platform.
              </p>

              <div className="mt-10 flex justify-center gap-4 flex-wrap">
                <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black hover:scale-105 transition">
                  Get Started
                </button>

                <button className="border border-white/30 px-8 py-4 rounded-2xl font-black hover:bg-white/10 transition">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Community;