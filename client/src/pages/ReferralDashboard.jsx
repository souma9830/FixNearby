import { useState, useEffect } from 'react';
import {
  Gift,
  Copy,
  Check,
  Send,
  Wallet,
  Users,
  Award,
  TrendingUp,
  Mail,
  Phone,
  Clock,
  Sparkles,
  RefreshCw,
  Share2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import {
  getReferralStats,
  sendReferralInvite,
  claimReferralReward,
  claimWorkerBonus
} from '../services/referralService';
import toast from 'react-hot-toast';

const ReferralDashboard = () => {
  useDocumentTitle('Referral & Rewards Program');

  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [statsData, setStatsData] = useState(null);

  // Invite Form State
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  // Claim Loading
  const [claimingId, setClaimingId] = useState(null);
  const [claimingBonus, setClaimingBonus] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getReferralStats();
      if (data.success) {
        setStatsData(data);
      }
    } catch (err) {
      console.error('Failed to load referral stats:', err);
      toast.error('Failed to load referral dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyLink = () => {
    if (!statsData?.shareUrl) return;
    navigator.clipboard.writeText(statsData.shareUrl);
    setCopied(true);
    toast.success('Referral link with UTM tracking copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter an email address');

    setSendingInvite(true);
    try {
      const res = await sendReferralInvite({ referredEmail: email, referredPhone: phone });
      if (res.success) {
        toast.success(`Invitation email successfully sent to ${email}`);
        setEmail('');
        setPhone('');
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send referral invite');
    } finally {
      setSendingInvite(false);
    }
  };

  const handleClaimReferral = async (referralId) => {
    setClaimingId(referralId);
    try {
      const res = await claimReferralReward(referralId);
      if (res.success) {
        toast.success(res.message);
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to claim reward');
    } finally {
      setClaimingId(null);
    }
  };

  const handleClaimWorkerBonus = async () => {
    setClaimingBonus(true);
    try {
      const res = await claimWorkerBonus();
      if (res.success) {
        toast.success(res.message);
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to claim worker bonus');
    } finally {
      setClaimingBonus(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="font-semibold text-sm">Loading your Referral & Rewards dashboard...</p>
      </div>
    );
  }

  const { referralCode, shareUrl, stats, invites, workerMilestone } = statsData || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="h-4 w-4 text-amber-300" />
            Invite Friends & Earn ₹500
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Referral & Rewards Program
          </h1>
          <p className="text-blue-100 text-sm sm:text-base mt-2 leading-relaxed">
            Invite your friends to FixNearby! When they register or book a service, you both receive <strong>₹500 in FixNearby wallet credits</strong>. Workers also earn monthly milestone bonuses and badges!
          </p>
        </div>
      </div>

      {/* Referral Link & Share Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
          <Share2 className="text-blue-600" size={20} />
          Your Unique Referral Link & Code
        </h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
          Share this link with friends. UTM tracking parameters are automatically embedded to record your referrals.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full flex-1">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full pl-4 pr-24 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-mono text-gray-800 dark:text-slate-200 focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold text-[10px] rounded-lg">
              {referralCode}
            </span>
          </div>

          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-sm whitespace-nowrap"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied Link!' : 'Copy Referral Link'}
          </button>
        </div>
      </div>

      {/* Stat Summaries Grid - Glassmorphism & Trend Indicator Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Wallet Balance", value: `₹${stats?.walletBalance?.toLocaleString() || 0}`, trend: "Ready for Cashout", trendColor: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: <Wallet className="h-6 w-6" />, accent: "from-blue-600 to-indigo-600" },
          { label: "Total Credits Earned", value: `₹${stats?.totalEarnedCredits?.toLocaleString() || 0}`, trend: "+₹1,500 this month", trendColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: <TrendingUp className="h-6 w-6" />, accent: "from-emerald-600 to-teal-600" },
          { label: "Total Invites Sent", value: stats?.totalInvites || 0, trend: "+24% outreach", trendColor: "bg-purple-500/20 text-purple-300 border-purple-500/30", icon: <Users className="h-6 w-6" />, accent: "from-purple-600 to-pink-600" },
          { label: "Friends Joined", value: stats?.joinedCount || 0, trend: "+12% conversion rate", trendColor: "bg-amber-500/20 text-amber-300 border-amber-500/30", icon: <CheckCircle2 className="h-6 w-6" />, accent: "from-amber-500 to-orange-500" },
        ].map((item) => (
          <div
            key={item.label}
            className="relative overflow-hidden rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 text-white shadow-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-indigo-500/10 hover:border-slate-700 group"
          >
            <div className={`absolute top-0 right-0 h-24 w-24 rounded-full bg-gradient-to-br ${item.accent} opacity-10 blur-2xl group-hover:opacity-25 transition-opacity`} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">{item.label}</p>
                <h3 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">{item.value}</h3>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold border backdrop-blur-md shadow-xs">
                  <span className={item.trendColor}>{item.trend}</span>
                </div>
              </div>
              <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${item.accent} text-white shadow-lg shadow-indigo-500/20`}>
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Grid: Invite Form & Worker Monthly Job Milestone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Send Email/SMS Invite Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
            <Mail className="text-purple-600" size={20} />
            Send Direct Referral Invitation
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-6">
            Enter your friend's email and phone number. We'll send an automated invitation email and SMS containing your referral code and ₹500 credit offer.
          </p>

          <form onSubmit={handleSendInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Friend's Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  placeholder="friend@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Mobile Number (Optional for SMS invite)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={sendingInvite}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm transition shadow-sm disabled:opacity-50"
            >
              <Send size={16} />
              {sendingInvite ? 'Sending Invitation...' : 'Send Referral Invitation'}
            </button>
          </form>
        </div>

        {/* Worker Monthly Job Milestone Card (if Worker) or How it Works Banner */}
        {workerMilestone ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Award className="text-amber-500" size={22} />
                  Worker Monthly Job Milestone Reward
                </h2>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 rounded-full text-xs font-bold">
                  {workerMilestone.month}
                </span>
              </div>

              <p className="text-xs text-gray-500 dark:text-slate-400 mb-6">
                Complete <strong>{workerMilestone.milestoneTarget} jobs</strong> this month to unlock a <strong>₹{workerMilestone.bonusAmount} bonus</strong> and the exclusive <strong>"{workerMilestone.badgeEarned}"</strong> profile badge!
              </p>

              {/* Progress Bar */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-600 dark:text-slate-300">Jobs Completed Progress</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{workerMilestone.jobsCompleted} / {workerMilestone.milestoneTarget} Jobs</span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, (workerMilestone.jobsCompleted / workerMilestone.milestoneTarget) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-amber-500 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            </div>

            <div>
              {workerMilestone.isTargetAchieved ? (
                <button
                  onClick={handleClaimWorkerBonus}
                  disabled={workerMilestone.claimed || claimingBonus}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition shadow-sm disabled:opacity-50"
                >
                  {workerMilestone.claimed ? 'Monthly Bonus Claimed (₹1,000)' : claimingBonus ? 'Claiming...' : 'Claim ₹1,000 Milestone Bonus'}
                </button>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-medium text-center border border-amber-100 dark:border-amber-500/20">
                  Complete {workerMilestone.milestoneTarget - workerMilestone.jobsCompleted} more job(s) this month to unlock bonus & badge!
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Gift className="text-emerald-600" size={20} />
                How the Referral Reward System Works
              </h2>
              <div className="space-y-4 text-xs text-gray-600 dark:text-slate-300">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-bold flex items-center justify-center shrink-0">1</div>
                  <p><strong className="text-gray-900 dark:text-white">Share Your Unique Referral Link:</strong> Send your personalized link with embedded UTM parameters via email, SMS, or social media.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 font-bold flex items-center justify-center shrink-0">2</div>
                  <p><strong className="text-gray-900 dark:text-white">Friend Registers & Books:</strong> Your friend gets ₹500 discount credit upon signing up with your referral code.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0">3</div>
                  <p><strong className="text-gray-900 dark:text-white">Get Credited ₹500:</strong> Once your friend completes a booking, ₹500 is automatically credited to your FixNearby Wallet!</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-xs text-blue-700 dark:text-blue-300 font-semibold text-center border border-blue-100 dark:border-blue-500/20">
              No limit on referral earnings — invite as many friends as you like!
            </div>
          </div>
        )}
      </div>

      {/* Invites History Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700/60 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="text-gray-500" size={18} />
            Referral Invitations History
          </h2>
          <span className="text-xs text-gray-400">{invites?.length || 0} Total Invites</span>
        </div>

        {!invites || invites.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Mail className="h-10 w-10 mx-auto mb-2 opacity-30 text-gray-400" />
            <p className="font-semibold text-gray-700 dark:text-slate-300">No referral invites sent yet</p>
            <p className="text-xs text-gray-400 mt-1">Use the invite form above to start earning wallet credits</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/80 dark:bg-slate-900/50 text-xs text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3">Recipient Email</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Reward</th>
                  <th className="px-6 py-3">Sent Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {invites.map((invite) => (
                  <tr key={invite._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {invite.referredEmail}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        invite.status === 'credited' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        invite.status === 'joined' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      }`}>
                        {invite.status === 'credited' && <CheckCircle2 size={12} />}
                        {invite.status === 'joined' && <CheckCircle2 size={12} />}
                        {invite.status === 'pending' && <Clock size={12} />}
                        {invite.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-slate-200">
                      ₹{invite.rewardAmount}
                    </td>

                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(invite.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {invite.status === 'joined' && (
                        <button
                          onClick={() => handleClaimReferral(invite._id)}
                          disabled={claimingId === invite._id}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                        >
                          {claimingId === invite._id ? 'Claiming...' : 'Claim ₹500 Credit'}
                        </button>
                      )}
                      {invite.status === 'credited' && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Credited to Wallet</span>
                      )}
                      {invite.status === 'pending' && (
                        <span className="text-xs text-gray-400">Awaiting signup</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralDashboard;
