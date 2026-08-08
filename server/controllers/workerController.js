import jwt from "jsonwebtoken";
import Worker from "../models/Worker.js";
import mongoose from "mongoose";
import { calculateKarmaScores } from "../utils/karmaScheduler.js";
import { validatePassword } from "../utils/validatePassword.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import { computeSpatialWorkerClusters } from "../services/spatialClusterService.js";


const WORKER_AVAILABILITY_STATUSES = ["available", "busy", "offline"];

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

export const registerWorker = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      category,
      experience,
      location,
      contact,
      bio,
      slaResponseMins,
      serviceCoverage,
      cancellationPolicy,
      refundPolicy,
      verificationStatus,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !category ||
      !experience ||
      !location ||
      !contact ||
      !bio
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;

        if (!emailRegex.test(normalizedEmail)) {
          return res.status(400).json({
            success: false,
            message: "Invalid email format",
          });
        }

      const passwordCheck = validatePassword(password);
      if (!passwordCheck.valid) {
        return res.status(400).json({
          success: false,
          message: passwordCheck.message,
        });
      }

      // Validations for new SLA/Policy fields
      if (slaResponseMins !== undefined) {
        const mins = Number(slaResponseMins);
        if (isNaN(mins) || mins <= 0) {
          return res.status(400).json({
            success: false,
            message: "Response SLA must be a positive number of minutes",
          });
        }
      }
      if (serviceCoverage !== undefined) {
        if (!Array.isArray(serviceCoverage) && typeof serviceCoverage !== 'string') {
          return res.status(400).json({
            success: false,
            message: "Service coverage must be an array or string",
          });
        }
        const coverageArray = Array.isArray(serviceCoverage)
          ? serviceCoverage
          : serviceCoverage.split(',').map(s => s.trim());
        if (coverageArray.some(item => typeof item !== 'string' || item.trim().length === 0)) {
          return res.status(400).json({
            success: false,
            message: "Service coverage items must be valid non-empty strings",
          });
        }
      }
      if (cancellationPolicy !== undefined) {
        if (typeof cancellationPolicy !== 'string' || cancellationPolicy.trim().length === 0) {
          return res.status(400).json({
            success: false,
            message: "Cancellation policy must be a valid non-empty string",
          });
        }
      }
      if (refundPolicy !== undefined) {
        if (typeof refundPolicy !== 'string' || refundPolicy.trim().length === 0) {
          return res.status(400).json({
            success: false,
            message: "Refund policy must be a valid non-empty string",
          });
        }
      }
      if (verificationStatus !== undefined) {
        if (!['unverified', 'pending', 'verified'].includes(verificationStatus)) {
          return res.status(400).json({
            success: false,
            message: "Invalid verification status value",
          });
        }
      }

      const existingWorker =
        await Worker.findOne({
          email: normalizedEmail,
     });

    if (existingWorker) {
      return res.status(400).json({
        success: false,
        message: "Worker already exists",
      });
    }

    const worker = await Worker.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      category: category.trim(),
      experience: experience.trim(),
      location: (typeof location === "string" && location.startsWith("{")) ? JSON.parse(location) : (typeof location === "object" ? location : { type: "Point", coordinates: [0, 0] }),
      contact: contact.trim(),
      bio: bio.trim(),
      profilePicture: req.file?.path || "",
      slaResponseMins: slaResponseMins !== undefined ? Number(slaResponseMins) : undefined,
      serviceCoverage: serviceCoverage !== undefined ? (Array.isArray(serviceCoverage) ? serviceCoverage : serviceCoverage.split(',').map(s => s.trim())) : undefined,
      cancellationPolicy,
      refundPolicy,
      verificationStatus,
    });

    res.status(201).json({
      success: true,
      message: "Worker registered successfully",
      token: generateToken(worker._id),
      worker: {
        id: worker._id,
        name: worker.name,
        email: worker.email,
      },
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });

  }
};

export const loginWorker = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email and password",
      });
    }
    const normalizedEmail = email.toLowerCase().trim();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const worker = await Worker.findOne({email: normalizedEmail,});

    if (
      !worker ||
      !(await worker.matchPassword(password))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (worker.twoFactorEnabled) {
      return res.status(200).json({
        success: true,
        require2FA: true,
        userId: worker._id,
        userType: 'Worker',
        message: '2FA authentication code required to complete login',
      });
    }

    res.status(200).json({
      success: true,
      token: generateToken(worker._id),
      twoFactorEnabled: !!worker.twoFactorEnabled,
      worker: {
        id: worker._id,
        name: worker.name,
        email: worker.email,
      },
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });

  }
};

// FIX #571: Optimized getWorkers with pagination, field projection, and .lean()
export const getWorkers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const workers = await Worker.find()
      .select("name email category experience location contact availabilityStatus isAvailableNow profilePicture lastActive averageRating reviewCount slaResponseMins serviceCoverage cancellationPolicy refundPolicy verificationStatus")
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Worker.countDocuments();

    res.status(200).json({
      success: true,
      workers,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error",
    });

  }
};

export const getWorkerById = async (req, res) => {
  try {

    // CHECK INVALID OBJECT ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid worker ID",
      });
    }

    const worker = await Worker.findById(req.params.id)
      .select("-password");

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    res.status(200).json({
      success: true,
      worker,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });

  }
};

export const getWorkerProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    worker: req.worker,
  });
};

export const updateAvailableNowStatus = async (req, res) => {
  try {
    const { isAvailableNow } = req.body;
    
    if (typeof isAvailableNow !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "isAvailableNow must be a boolean",
      });
    }

    const worker = await Worker.findByIdAndUpdate(
      req.worker._id,
      {
        isAvailableNow,
        lastActive: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("isAvailableNow lastActive");

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    res.status(200).json({
      success: true,
      isAvailableNow: worker.isAvailableNow,
      lastActive: worker.lastActive,
    });
  } catch (error) {
    console.error("Error updating available now status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateWorkerProfile = async (req, res) => {
  try {
    const worker = await Worker.findById(req.worker._id);
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    const {
      name,
      category,
      experience,
      location,
      contact,
      bio,
      slaResponseMins,
      serviceCoverage,
      cancellationPolicy,
      refundPolicy,
      verificationStatus
    } = req.body;

    // Validate fields if they are provided
    if (slaResponseMins !== undefined) {
      const mins = Number(slaResponseMins);
      if (isNaN(mins) || mins <= 0) {
        return res.status(400).json({ success: false, message: "Response SLA must be a positive number of minutes" });
      }
      worker.slaResponseMins = mins;
    }

    if (serviceCoverage !== undefined) {
      if (!Array.isArray(serviceCoverage) && typeof serviceCoverage !== 'string') {
        return res.status(400).json({ success: false, message: "Service coverage must be an array or string" });
      }
      const coverageArray = Array.isArray(serviceCoverage) 
        ? serviceCoverage 
        : serviceCoverage.split(',').map(s => s.trim());
      if (coverageArray.some(item => typeof item !== 'string' || item.trim().length === 0)) {
        return res.status(400).json({ success: false, message: "Service coverage items must be valid non-empty strings" });
      }
      worker.serviceCoverage = coverageArray;
    }

    if (cancellationPolicy !== undefined) {
      if (typeof cancellationPolicy !== 'string' || cancellationPolicy.trim().length === 0) {
        return res.status(400).json({ success: false, message: "Cancellation policy must be a valid non-empty string" });
      }
      worker.cancellationPolicy = cancellationPolicy;
    }

    if (refundPolicy !== undefined) {
      if (typeof refundPolicy !== 'string' || refundPolicy.trim().length === 0) {
        return res.status(400).json({ success: false, message: "Refund policy must be a valid non-empty string" });
      }
      worker.refundPolicy = refundPolicy;
    }

    if (verificationStatus !== undefined) {
      if (!['unverified', 'pending', 'verified'].includes(verificationStatus)) {
        return res.status(400).json({ success: false, message: "Invalid verification status value" });
      }
      worker.verificationStatus = verificationStatus;
    }

    if (name) worker.name = name.trim();
    if (category) worker.category = category.trim();
    if (experience) worker.experience = experience.trim();
    if (location) {
      worker.location = (typeof location === "string" && location.startsWith("{")) 
        ? JSON.parse(location) 
        : (typeof location === "object" ? location : worker.location);
    }
    if (contact) worker.contact = contact.trim();
    if (bio) worker.bio = bio.trim();

    await worker.save();

    res.status(200).json({
      success: true,
      message: "Worker profile updated successfully",
      worker: {
        id: worker._id,
        name: worker.name,
        email: worker.email,
        category: worker.category,
        experience: worker.experience,
        location: worker.location,
        contact: worker.contact,
        bio: worker.bio,
        slaResponseMins: worker.slaResponseMins,
        serviceCoverage: worker.serviceCoverage,
        cancellationPolicy: worker.cancellationPolicy,
        refundPolicy: worker.refundPolicy,
        verificationStatus: worker.verificationStatus,
      }
    });
  } catch (error) {
    console.error("Error updating worker profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateWorkerAvailabilityStatus = async (req, res) => {
  try {
    const { availabilityStatus } = req.body;

    if (!WORKER_AVAILABILITY_STATUSES.includes(availabilityStatus)) {
      return res.status(400).json({
        success: false,
        message: "Availability status must be available, busy, or offline",
      });
    }

    const worker = await Worker.findByIdAndUpdate(
      req.worker._id,
      {
        availabilityStatus,
        lastActive: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("availabilityStatus lastActive");

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    res.status(200).json({
      success: true,
      availabilityStatus: worker.availabilityStatus,
      lastActive: worker.lastActive,
    });
  } catch (error) {
    console.error("Error updating worker availability status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getWorkerAvailabilityStatus = async (req, res) => {
  try {
    const { workerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(workerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid worker ID",
      });
    }

    const worker = await Worker.findById(workerId)
      .select("availabilityStatus lastActive")
      .lean();

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    res.status(200).json({
      success: true,
      availabilityStatus: worker.availabilityStatus,
      lastActive: worker.lastActive,
    });
  } catch (error) {
    console.error("Error fetching worker availability status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getNearbyWorkers = async (req, res) => {
  try {
    const { lat, lng, maxDistance, category, availabilityStatus, page = 1, limit = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Please provide both lat (latitude) and lng (longitude) query parameters."
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude coordinates."
      });
    }

    const matchQuery = {};
    if (category) {
      matchQuery.category = category;
    }
    if (availabilityStatus) {
      matchQuery.availabilityStatus = availabilityStatus;
    }

    const unitStr = (req.query.unit || req.query.distanceUnit || '').toLowerCase();
    const isMiles = unitStr === 'miles' || unitStr === 'mile' || unitStr === 'mi';

    const rawDist = maxDistance ? parseFloat(maxDistance) : 10000;
    let maxDistMeters = rawDist;
    if (isMiles) {
      maxDistMeters = rawDist * 1609.344;
    }

    const pipeline = [
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "distance",
          spherical: true,
          maxDistance: maxDistMeters,
          query: matchQuery
        }
      },
      {
        $sort: {
          distance: 1,
          averageRating: -1,
          availabilityStatus: 1
        }
      }
    ];

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    pipeline.push(
      { $skip: skipNum },
      { $limit: limitNum }
    );

    const workers = await Worker.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: workers.length,
      page: pageNum,
      limit: limitNum,
      workers
    });
  } catch (error) {
    console.error("Error finding nearby workers:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
};

export const recalculateKarmaScoresController = async (req, res) => {
  try {
    await calculateKarmaScores();
    res.status(200).json({
      success: true,
      message: "Karma/Reliability scores recalculated successfully for all workers"
    });
  } catch (error) {
    console.error("Error recalculating karma scores:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
};

export const getWorkerAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const dateRange = parseInt(req.query.dateRange) || 7; // default 7 days ahead

    if (!mongoose.Types.ObjectId.isValid(id)) {
      // Fallback to generating mock slots for mock workers with numeric/invalid IDs
      const mockSlots = [];
      const now = new Date();
      const slotHours = [9, 11, 13, 15]; // 9 AM, 11 AM, 1 PM, 3 PM
      const slotDurationMs = 2 * 3600000;
      let count = 0;
      for (let dayOffset = 0; dayOffset < dateRange; dayOffset++) {
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() + dayOffset);
        for (const hour of slotHours) {
          const slotStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hour, 0, 0, 0);
          const slotEnd = new Date(slotStart.getTime() + slotDurationMs);
          if (slotStart <= now) continue;

          // Book some slots deterministically based on worker ID to look dynamic
          const isBooked = (parseInt(id || "0") + hour + dayOffset) % 3 === 0;
          if (!isBooked) {
            let label = "";
            const isToday = slotStart.toDateString() === now.toDateString();
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const isTomorrow = slotStart.toDateString() === tomorrow.toDateString();
            const timeString = slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            if (isToday) {
              label = `Today, ${timeString}`;
            } else if (isTomorrow) {
              label = `Tomorrow, ${timeString}`;
            } else {
              const options = { weekday: 'short', month: 'short', day: 'numeric' };
              label = `${slotStart.toLocaleDateString([], options)}, ${timeString}`;
            }
            mockSlots.push({
              start: slotStart.toISOString(),
              end: slotEnd.toISOString(),
              label
            });
            count++;
            if (count >= 5) break;
          }
        }
        if (count >= 5) break;
      }
      return res.status(200).json({
        success: true,
        workerId: id,
        availableSlots: mockSlots
      });
    }

    const worker = await Worker.findById(id);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found"
      });
    }

    // Fetch active bookings in range
    const now = new Date();
    const endPeriod = new Date(now.getTime() + dateRange * 24 * 3600000);

    const bookings = await Booking.find({
      workerId: id,
      status: { $in: ['Accepted', 'In-Progress'] },
      scheduledTime: { $gte: new Date(now.getTime() - 24 * 3600000), $lte: endPeriod }
    });

    const availableSlots = [];
    const slotHours = [9, 11, 13, 15]; // 9 AM, 11 AM, 1 PM, 3 PM
    const slotDurationMs = 2 * 3600000;

    for (let dayOffset = 0; dayOffset < dateRange; dayOffset++) {
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + dayOffset);

      for (const hour of slotHours) {
        const slotStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hour, 0, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + slotDurationMs);

        if (slotStart <= now) {
          continue;
        }

        // Check overlap with bookings
        const isOverlapping = bookings.some(booking => {
          const bookingStart = new Date(booking.scheduledTime).getTime();
          const bookingEnd = bookingStart + booking.durationHours * 3600000;
          return slotStart.getTime() < bookingEnd && bookingStart < slotEnd.getTime();
        });

        if (!isOverlapping) {
          let label = "";
          const isToday = slotStart.toDateString() === now.toDateString();
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const isTomorrow = slotStart.toDateString() === tomorrow.toDateString();
          const timeString = slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (isToday) {
            label = `Today, ${timeString}`;
          } else if (isTomorrow) {
            label = `Tomorrow, ${timeString}`;
          } else {
            const options = { weekday: 'short', month: 'short', day: 'numeric' };
            label = `${slotStart.toLocaleDateString([], options)}, ${timeString}`;
          }

          availableSlots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            label
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      workerId: id,
      availableSlots: availableSlots.slice(0, 5)
    });
  } catch (error) {
    console.error("Error fetching worker availability:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
};

export const getWorkerReviews = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      // Fallback for mock workers (e.g. numeric ID)
      const mockReviews = [
        {
          _id: "mock-r1",
          rating: 5,
          reviewText: "Excellent work! Quick turnaround and extremely professional.",
          user: { name: "Alice Johnson" },
          createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString()
        },
        {
          _id: "mock-r2",
          rating: 4.5,
          reviewText: "Very skilled, polite, and clean. Solved the problem on the first visit.",
          user: { name: "Robert Miller" },
          createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString()
        }
      ];
      return res.status(200).json({
        success: true,
        count: mockReviews.length,
        reviews: mockReviews
      });
    }

    const worker = await Worker.findById(id);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found"
      });
    }

    const reviews = await Review.find({ worker: id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error("Error fetching worker reviews:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
};

export const getWorkersBatch = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of worker IDs' });
    }
    if (ids.length > 10) {
      return res.status(400).json({ success: false, message: 'Maximum 10 workers per batch request' });
    }

    const workers = await Worker.find({ _id: { $in: ids } })
      .select('-password')
      .lean();

    const ordered = ids.map(id => workers.find(w => w._id.toString() === id)).filter(Boolean);

    res.json({ success: true, workers: ordered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWorkersByBounds = async (req, res) => {
  try {
    const { north, south, east, west, category, availabilityStatus, minRating, maxPrice } = req.query;

    if (!north || !south || !east || !west) {
      return res.status(400).json({ success: false, message: 'Please provide bounding box coordinates (north, south, east, west)' });
    }

    const query = {
      'location.coordinates': {
        $geoWithin: {
          $box: [
            [parseFloat(west), parseFloat(south)],
            [parseFloat(east), parseFloat(north)]
          ]
        }
      }
    };

    if (category) query.category = category;
    if (availabilityStatus) query.availabilityStatus = availabilityStatus;
    if (minRating) query.averageRating = { $gte: parseFloat(minRating) };

    const workers = await Worker.find(query)
      .select('name category experience location averageRating availabilityStatus isAvailableNow profilePicture price bio')
      .limit(100)
      .lean();

    res.json({ success: true, count: workers.length, workers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWorkerClusters = async (req, res) => {
  try {
    const { north, south, east, west } = req.query;

    if (!north || !south || !east || !west) {
      return res.status(400).json({ success: false, message: 'Please provide bounding box coordinates' });
    }

    const workers = await Worker.find({
      'location.coordinates': {
        $geoWithin: {
          $box: [
            [parseFloat(west), parseFloat(south)],
            [parseFloat(east), parseFloat(north)]
          ]
        }
      }
    })
    .select('name category location availabilityStatus averageRating')
    .lean();

    const clusterSize = 0.01;
    const clusters = {};

    workers.forEach(w => {
      if (w.location && w.location.coordinates) {
        const lat = w.location.coordinates[1];
        const lng = w.location.coordinates[0];
        const key = `${Math.round(lat / clusterSize)},${Math.round(lng / clusterSize)}`;

        if (!clusters[key]) {
          clusters[key] = {
            lat: Math.round(lat / clusterSize) * clusterSize,
            lng: Math.round(lng / clusterSize) * clusterSize,
            count: 0,
            avgRating: 0,
            categories: new Set()
          };
        }
        clusters[key].count++;
        clusters[key].avgRating += w.averageRating || 0;
        clusters[key].categories.add(w.category);
      }
    });

    const result = Object.values(clusters).map(c => ({
      ...c,
      avgRating: c.count > 0 ? Math.round((c.avgRating / c.count) * 10) / 10 : 0,
      categories: Array.from(c.categories)
    }));

    res.json({ success: true, clusters: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Add a service to the worker's service catalog
 * @route POST /api/workers/services
 */
export const addService = async (req, res) => {
  try {
    const { name, description, price, duration, isActive } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Service name and price are required',
      });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a non-negative number',
      });
    }

    const worker = await Worker.findById(req.worker._id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const newService = {
      name: name.trim(),
      description: description?.trim() || '',
      price: Number(price),
      duration: duration !== undefined ? Number(duration) : 60,
      isActive: isActive !== undefined ? isActive : true,
    };

    worker.services.push(newService);
    await worker.save();

    res.status(201).json({
      success: true,
      message: 'Service added successfully',
      service: worker.services[worker.services.length - 1],
    });
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update a service in the worker's service catalog
 * @route PUT /api/workers/services/:serviceId
 */
export const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { name, description, price, duration, isActive } = req.body;

    const worker = await Worker.findById(req.worker._id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const service = worker.services.id(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (name !== undefined) service.name = name.trim();
    if (description !== undefined) service.description = description.trim();
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ success: false, message: 'Price must be a non-negative number' });
      }
      service.price = Number(price);
    }
    if (duration !== undefined) service.duration = Number(duration);
    if (isActive !== undefined) service.isActive = isActive;

    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      service,
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Remove a service from the worker's service catalog
 * @route DELETE /api/workers/services/:serviceId
 */
export const removeService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const worker = await Worker.findById(req.worker._id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const service = worker.services.id(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    service.deleteOne();
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Service removed successfully',
    });
  } catch (error) {
    console.error('Error removing service:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get all services for the authenticated worker
 * @route GET /api/workers/services
 */
export const getMyServices = async (req, res) => {
  try {
    const worker = await Worker.findById(req.worker._id).select('services hourlyRate');
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    res.status(200).json({
      success: true,
      services: worker.services,
      hourlyRate: worker.hourlyRate,
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update the worker's hourly rate
 * @route PUT /api/workers/hourly-rate
 */
export const updateHourlyRate = async (req, res) => {
  try {
    const { hourlyRate } = req.body;

    if (hourlyRate === undefined || typeof hourlyRate !== 'number' || hourlyRate < 0) {
      return res.status(400).json({
        success: false,
        message: 'Hourly rate must be a non-negative number',
      });
    }

    const worker = await Worker.findByIdAndUpdate(
      req.worker._id,
      { hourlyRate: Number(hourlyRate) },
      { new: true, runValidators: true }
    ).select('hourlyRate');

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Hourly rate updated successfully',
      hourlyRate: worker.hourlyRate,
    });
  } catch (error) {
    console.error('Error updating hourly rate:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get services for a specific worker by ID (public)
 * @route GET /api/workers/:id/services
 */
export const getWorkerServices = async (req, res) => {
  try {
    const { id } = req.params;

    const worker = await Worker.findById(id).select('services hourlyRate name');
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const activeServices = worker.services.filter(s => s.isActive);

    res.status(200).json({
      success: true,
      services: activeServices,
      hourlyRate: worker.hourlyRate,
      workerName: worker.name,
    });
  } catch (error) {
    console.error('Error fetching worker services:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getWorkerDashboardStats = async (req, res) => {
  try {
    const workerId = req.worker._id;
    const totalJobs = await Booking.countDocuments({ workerId });
    const activeJobs = await Booking.countDocuments({ workerId, status: { $in: ['Pending', 'Confirmed', 'Accepted', 'In-Progress'] } });
    const completedJobs = await Booking.countDocuments({ workerId, status: 'Completed' });
    
    res.status(200).json({
      success: true,
      totalJobs,
      activeJobs,
      completedJobs,
      rating: req.worker.averageRating || 5.0
    });
  } catch (error) {
    console.error("Error fetching worker dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
