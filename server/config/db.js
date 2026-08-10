import mongoose from 'mongoose';

// Ensure Mongoose operations fail fast if DB connection is offline
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI not set — skipping MongoDB connection (running in fallback/in-memory mode)');
      mongoose.set('bufferCommands', false);
      return;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.warn('Running without DB — controllers will use in-memory fallback');
    mongoose.set('bufferCommands', false);
  }
};

export default connectDB;

// Export status checker helper for diagnostic probes
export const getDbStatusDetails = () => mongoose.connection.readyState;
