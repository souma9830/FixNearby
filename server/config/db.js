import mongoose from 'mongoose';

// Ensure Mongoose operations fail fast if DB connection is offline
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('[DB]: MONGODB_URI environment variable not configured — using graceful fallback');
      return;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 50,
      minPoolSize: 10,
      socketTimeoutMS: 45000,
    });
    console.log(`[DB]: MongoDB Connected successfully to host ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DB Error]: Initial MongoDB connection failed — ${error.message}`);
    console.warn('[DB]: Proceeding with active request fallback handling');
  }
};

export default connectDB;

// Export status checker helper for diagnostic probes
export const getDbStatusDetails = () => mongoose.connection.readyState;
