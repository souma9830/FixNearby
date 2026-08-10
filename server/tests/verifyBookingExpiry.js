import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Booking from '../models/Booking.js';
import { expirePendingBookings } from '../services/bookingExpiryService.js';
import dotenv from 'dotenv';

dotenv.config();

async function runTests() {
  console.log("--- STARTING BOOKING AUTO-EXPIRY TESTS ---");
  await connectDB();

  const pastDate = new Date(Date.now() - 72 * 60 * 60 * 1000);
  const b = await Booking.create({
    userId: new mongoose.Types.ObjectId(),
    workerId: new mongoose.Types.ObjectId(),
    service: 'Painting',
    scheduledTime: new Date(),
    durationHours: 3,
    address: '456 Color Lane',
    price: 300,
    status: 'Pending',
    createdAt: pastDate
  });

  try {
    const expiredCount = await expirePendingBookings();
    console.log(`SUCCESS: Expired ${expiredCount} old pending bookings.`);
    const updated = await Booking.findById(b._id);
    if (updated.status !== 'Expired' && updated.status !== 'Cancelled') {
      throw new Error("Expired booking status was not updated to Expired or Cancelled.");
    }
    console.log("SUCCESS: Booking status set to Expired due to timeout.");
  } finally {
    await Booking.deleteOne({ _id: b._id });
    await mongoose.connection.close();
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error("BOOKING EXPIRY TESTS FAILED:", err);
  process.exit(1);
});
