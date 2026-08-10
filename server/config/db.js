import mongoose from 'mongoose';

mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI not set — skipping MongoDB connection (running in fallback/in-memory mode)');
      return;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 50,
      minPoolSize: 10,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.warn('Running without DB — controllers will use in-memory fallback');
  }
};

export default connectDB;

// Export helper for health checker
export const getDbStatusDetails = () => mongoose.connection.readyState;
