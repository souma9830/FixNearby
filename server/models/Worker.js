import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    experience: {
      type: String,
      required: true,
      trim: true,
    },

    serviceRadiusKm: {
      type: Number,
      default: 10,
    },

    complianceStatus: {
      type: String,
      enum: ['UNVERIFIED', 'PARTIALLY_COMPLIANT', 'FULLY_COMPLIANT'],
      default: 'UNVERIFIED',
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified'],
      default: 'unverified',
    },
    backgroundCheckDate: {
      type: Date,
      default: null,
    },
    insuranceExpiryDate: {
      type: Date,
      default: null,
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    averageRating: {
      type: Number,
      default: 0
    },

    contact: {
      type: String,
      required: true,
      trim: true,
    },

    bio: {
      type: String,
      required: true,
      trim: true,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    availabilityStatus: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "offline",
    },

    isAvailableNow: {
      type: Boolean,
      default: false,
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },
    responsiveness: {
      type: Number,
      default: 100,
    },
    karmaScore: {
      type: Number,
      default: 100,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    verificationBadge: {
      type: String,
      default: '',
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    referralCode: {
      type: String,
      sparse: true,
    },
    monthlyCompletedJobs: {
      type: Number,
      default: 0,
    },
    topPerformerBadge: {
      type: Boolean,
      default: false,
    },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    certifications: {
      type: [String],
      default: []
    },
    portfolio: [
      {
        image: { type: String, default: "" },
        description: { type: String, default: "" },
        completionDate: { type: String, default: "" },
        customerRating: { type: Number, default: 5 },
        review: { type: String, default: "" }
      }
    ],
    faqs: [
      {
        question: { type: String, default: "" },
        answer: { type: String, default: "" }
      }
    ],
    slaResponseMins: {
      type: Number,
      default: 30
    },
    serviceCoverage: {
      type: [String],
      default: ['Local Metro Area']
    },
    cancellationPolicy: {
      type: String,
      default: 'Free cancellation up to 24 hours prior to slot.'
    },
    refundPolicy: {
      type: String,
      default: 'Full refund guaranteed if response SLA is missed.'
    },
    recurringAvailability: [{
      dayOfWeek: {
        type: Number,
        min: 0,
        max: 6
      },
      startTime: {
        type: String
      },
      endTime: {
        type: String
      }
    }],
    // Service catalog with per-service pricing
    services: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          default: '',
          trim: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        duration: {
          type: Number, // duration in minutes
          default: 60,
          min: 0,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // Flat hourly rate for quick filtering and fallback pricing
    hourlyRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    blockedSlots: [{
      date: {
        type: Date
      },
      startTime: {
        type: String
      },
      endTime: {
        type: String
      },
      reason: {
        type: String,
        default: ''
      }
    }],
    payoutMethods: [{
      type: {
        type: String,
        enum: ['bank_account', 'upi', 'stripe_connect'],
        required: true
      },
      isDefault: {
        type: Boolean,
        default: false
      },
      details: {
        accountNumber: { type: String, default: '' },
        ifscCode: { type: String, default: '' },
        bankName: { type: String, default: '' },
        accountHolderName: { type: String, default: '' },
        upiId: { type: String, default: '' },
        stripeAccountId: { type: String, default: '' }
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    stripeConnectAccountId: {
      type: String,
      default: ''
    },
    passwordChangedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
  }
);

// HASH PASSWORD BEFORE SAVE
workerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(
      this.password,
      salt
    );

    next();

  } catch (error) {
    next(error);
  }
});

// PASSWORD MATCH METHOD
workerSchema.methods.matchPassword =
  async function (enteredPassword) {

    return await bcrypt.compare(
      enteredPassword,
      this.password
    );
  };

workerSchema.index({ location: "2dsphere" });
workerSchema.index({ category: 1, availabilityStatus: 1 });
workerSchema.index({ category: 1, location: 1 });
workerSchema.index({ location: 1, averageRating: -1 });
workerSchema.index({ availabilityStatus: 1, averageRating: -1 });
workerSchema.index({ email: 1 }, { unique: true });
workerSchema.index({ karmaScore: -1 });
workerSchema.index({ isAvailableNow: 1 });

const Worker = mongoose.model(
  "Worker",
  workerSchema
);

export default Worker;