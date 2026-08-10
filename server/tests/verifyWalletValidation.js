import mongoose from 'mongoose';
import { payWithWallet } from '../controllers/walletController.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Wallet from '../models/Wallet.js';

async function runTest() {
  console.log("--- STARTING WALLET PRICE VALIDATION TEST ---");
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fixnearby_test');
  
  const testUser = await User.create({
    name: 'Wallet Tester',
    email: `wallet_test_${Date.now()}@example.com`,
    password: 'password123',
    role: 'customer'
  });

  const testBooking = await Booking.create({
    userId: testUser._id,
    workerId: new mongoose.Types.ObjectId(),
    service: 'Plumbing Service',
    address: '123 Test Street',
    durationHours: 2,
    scheduledTime: new Date(Date.now() + 86400000),
    price: 150,
    status: 'Pending'
  });

  await Wallet.create({
    userId: testUser._id,
    balance: 500
  });

  // Test 1: Submitting payment under required price ($50 < $150)
  console.log("\nTest 1: Submitting underpaid amount ($50 for $150 booking)...");
  let resStatus1 = 0;
  let resJson1 = {};

  const req1 = {
    user: testUser,
    body: { bookingId: testBooking._id.toString(), amount: 50 }
  };
  const res1 = {
    status: (code) => {
      resStatus1 = code;
      return {
        json: (data) => { resJson1 = data; return data; }
      };
    }
  };

  await payWithWallet(req1, res1, (err) => console.error(err));

  console.log(`HTTP Status: ${resStatus1}`);
  console.log(`Response Payload: ${JSON.stringify(resJson1)}`);

  if (resStatus1 === 400 && resJson1.message?.includes("Invalid payment amount")) {
    console.log("\n=============================================");
    console.log("✅ SUCCESS: Underpaid wallet payment rejected with 400 Bad Request!");
    console.log("=============================================");
  } else {
    console.error("❌ FAILED: Underpaid payment was not properly rejected!");
  }

  // Cleanup
  await User.deleteOne({ _id: testUser._id });
  await Booking.deleteOne({ _id: testBooking._id });
  await Wallet.deleteOne({ userId: testUser._id });
  await mongoose.disconnect();
  process.exit(0);
}

runTest().catch(console.error);
