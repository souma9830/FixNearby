import Referral from '../models/Referral.js';
import Reward from '../models/Reward.js';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import sendEmail from '../utils/sendEmail.js';
import sendSMS from '../utils/sendSMS.js';
import crypto from 'crypto';
import logger from '../utils/logger.js';

/**
 * Generate a unique referral code for a user/worker if they don't have one yet
 */
export const getOrCreateReferralCode = async (user) => {
  if (user.referralCode) return user.referralCode;

  const { sanitizeReferralCode } = await import('../services/referralTierEvaluatorService.js');
  const cleanName = (user.name || 'USER').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5);
  const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
  const code = sanitizeReferralCode(`REF-${cleanName}-${randomHex}`);

  user.referralCode = code;
  await user.save({ validateBeforeSave: false });
  return code;
};

/**
 * @desc    Send automated email/SMS invitation with UTM referral parameters
 * @route   POST /api/referrals/invite
 * @access  Private
 */
export const sendReferralInvite = async (req, res) => {
  try {
    const { referredEmail, referredPhone } = req.body;

    if (!referredEmail || !referredEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address is required' });
    }

    const normalizedEmail = referredEmail.toLowerCase().trim();

    if (normalizedEmail === req.user.email.toLowerCase()) {
      return res.status(400).json({ success: false, message: 'You cannot refer yourself' });
    }

    // Get or generate referral code for sender
    const referralCode = await getOrCreateReferralCode(req.user);

    // Check if invite already sent by this referrer to this email
    const existingReferral = await Referral.findOne({
      referrerId: req.user._id,
      referredEmail: normalizedEmail
    });

    if (existingReferral) {
      return res.status(400).json({
        success: false,
        message: 'An invitation has already been sent to this email address'
      });
    }

    // Build UTM-tracked share link
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const utmSource = 'fixnearby';
    const utmMedium = 'referral_program';
    const utmCampaign = 'invite_friends';
    const shareUrl = `${baseUrl}/register?ref=${referralCode}&utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`;

    // Determine model type of referrer
    const isWorker = !!req.user.category;
    const referrerModel = isWorker ? 'Worker' : 'User';

    // Create Referral record
    const referral = await Referral.create({
      referrerId: req.user._id,
      referrerModel,
      referralCode,
      referredEmail: normalizedEmail,
      referredPhone: referredPhone ? referredPhone.trim() : '',
      status: 'pending',
      rewardAmount: 500,
      utmSource,
      utmMedium,
      utmCampaign
    });

    // Send automated email invitation
    try {
      await sendEmail({
        toEmail: normalizedEmail,
        subject: `${req.user.name} invited you to FixNearby — Get ₹500 Discount Credit!`,
        htmlContent: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
            <div style="background-color: #2563eb; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">FixNearby Referral</h1>
            </div>
            <div style="background-color: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="color: #0f172a; font-size: 20px; margin-top: 0;">You've been invited by ${req.user.name}!</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #475569;">
                Join FixNearby today using <strong>${req.user.name}'s</strong> personal referral invitation to receive <strong>₹500 in FixNearby wallet credits</strong> for your first home repair service!
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${shareUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; font-weight: 700; text-decoration: none; border-radius: 8px; font-size: 16px; display: inline-block;">
                  Claim Your ₹500 Credit
                </a>
              </div>
              <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 20px;">
                Referral Code: <span style="font-family: monospace; font-weight: bold; color: #2563eb;">${referralCode}</span>
              </p>
            </div>
          </div>
        `
      });
    } catch (emailErr) {
      console.warn('[Referral] Email notification suppressed or failed:', emailErr.message);
    }

    // Send automated SMS invitation if phone number provided
    if (referredPhone) {
      try {
        await sendSMS({
          toPhone: referredPhone,
          message: `Hello! ${req.user.name} invited you to FixNearby. Register via ${shareUrl} to get ₹500 wallet credit for home repair services!`
        });
      } catch (smsErr) {
        console.warn('[Referral] SMS notification suppressed or failed:', smsErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: `Invitation successfully sent to ${normalizedEmail}`,
      referral,
      shareUrl
    });
  } catch (err) {
    logger.error({ err }, 'Failed to send referral invite');
    res.status(500).json({ success: false, message: 'Failed to send referral invitation' });
  }
};

/**
 * @desc    Get referrer performance stats, wallet balance, invite history & worker monthly milestone progress
 * @route   GET /api/referrals/stats
 * @access  Private
 */
export const getReferralStats = async (req, res) => {
  try {
    const referralCode = await getOrCreateReferralCode(req.user);

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const utmSource = 'fixnearby';
    const utmMedium = 'referral_program';
    const utmCampaign = 'invite_friends';
    const shareUrl = `${baseUrl}/register?ref=${referralCode}&utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`;

    const invites = await Referral.find({ referrerId: req.user._id })
      .populate('referredUserId', 'name email createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const totalInvites = invites.length;
    const joinedCount = invites.filter(i => i.status === 'joined').length;
    const creditedCount = invites.filter(i => i.status === 'credited').length;
    const totalEarnedCredits = creditedCount * 500;

    // Worker monthly job milestone calculations
    const isWorker = !!req.user.category;
    let workerMilestone = null;

    if (isWorker) {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      let reward = await Reward.findOne({ workerId: req.user._id, month: currentMonth });

      if (!reward) {
        reward = await Reward.create({
          workerId: req.user._id,
          month: currentMonth,
          jobsCompleted: req.user.monthlyCompletedJobs || 0,
          milestoneTarget: 10,
          bonusAmount: 1000,
          claimed: false,
          badgeEarned: 'Top Performer'
        });
      }

      workerMilestone = {
        month: currentMonth,
        jobsCompleted: reward.jobsCompleted,
        milestoneTarget: reward.milestoneTarget,
        bonusAmount: reward.bonusAmount,
        claimed: reward.claimed,
        badgeEarned: reward.badgeEarned,
        isTargetAchieved: reward.jobsCompleted >= reward.milestoneTarget,
        badgeUnlocked: req.user.topPerformerBadge || reward.jobsCompleted >= reward.milestoneTarget
      };
    }

    res.json({
      success: true,
      referralCode,
      shareUrl,
      stats: {
        totalInvites,
        joinedCount,
        creditedCount,
        totalEarnedCredits,
        walletBalance: req.user.walletBalance || 0
      },
      invites,
      workerMilestone
    });
  } catch (err) {
    logger.error({ err }, 'Failed to fetch referral stats');
    res.status(500).json({ success: false, message: 'Failed to fetch referral performance' });
  }
};

/**
 * @desc    Claim pending referral credits when a referred friend joins or completes booking
 * @route   POST /api/referrals/claim
 * @access  Private
 */
export const claimReferralReward = async (req, res) => {
  try {
    const { referralId } = req.body;

    const referral = await Referral.findOne({
      _id: referralId,
      referrerId: req.user._id
    });

    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral record not found' });
    }

    if (referral.status === 'credited') {
      return res.status(400).json({ success: false, message: 'Reward for this referral has already been claimed' });
    }

    // Update referral status
    referral.status = 'credited';
    referral.creditedAt = new Date();
    await referral.save();

    // Credit referrer's wallet balance
    req.user.walletBalance = (req.user.walletBalance || 0) + referral.rewardAmount;
    await req.user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: `Successfully claimed ₹${referral.rewardAmount} wallet credit!`,
      walletBalance: req.user.walletBalance,
      referral
    });
  } catch (err) {
    logger.error({ err }, 'Failed to claim referral reward');
    res.status(500).json({ success: false, message: 'Failed to claim reward' });
  }
};

/**
 * @desc    Validate referral code on registration
 * @route   GET /api/referrals/validate/:code
 * @access  Public
 */
export const validateReferralCode = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Referral code is required' });
    }

    // Check User model first
    let referrer = await User.findOne({ referralCode: code.toUpperCase() }).select('name email role');

    if (!referrer) {
      referrer = await Worker.findOne({ referralCode: code.toUpperCase() }).select('name email category');
    }

    if (!referrer) {
      return res.status(404).json({ success: false, valid: false, message: 'Invalid referral code' });
    }

    res.json({
      success: true,
      valid: true,
      referrerName: referrer.name,
      rewardCredit: 500
    });
  } catch (err) {
    logger.error({ err }, 'Failed to validate referral code');
    res.status(500).json({ success: false, message: 'Validation check failed' });
  }
};

/**
 * @desc    Claim monthly worker job milestone bonus (10+ jobs/month)
 * @route   POST /api/referrals/worker-bonus/claim
 * @access  Private (Worker)
 */
export const claimWorkerBonus = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const reward = await Reward.findOne({ workerId: req.user._id, month: currentMonth });

    if (!reward) {
      return res.status(404).json({ success: false, message: 'No monthly reward record found' });
    }

    if (reward.jobsCompleted < reward.milestoneTarget) {
      return res.status(400).json({
        success: false,
        message: `Milestone not yet reached. Complete ${reward.milestoneTarget - reward.jobsCompleted} more job(s) this month to unlock ₹${reward.bonusAmount} bonus.`
      });
    }

    if (reward.claimed) {
      return res.status(400).json({ success: false, message: 'Monthly bonus has already been claimed' });
    }

    reward.claimed = true;
    reward.claimedAt = new Date();
    await reward.save();

    // Credit worker wallet
    req.user.walletBalance = (req.user.walletBalance || 0) + reward.bonusAmount;
    req.user.topPerformerBadge = true;
    await req.user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: `Congratulations! You unlocked the 'Top Performer' badge and ₹${reward.bonusAmount} monthly bonus!`,
      walletBalance: req.user.walletBalance,
      reward
    });
  } catch (err) {
    logger.error({ err }, 'Failed to claim worker monthly bonus');
    res.status(500).json({ success: false, message: 'Failed to claim worker bonus' });
  }
};
