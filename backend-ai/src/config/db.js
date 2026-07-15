import mongoose from 'mongoose';

export async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI_CLOUD || process.env.MONGO_URI;
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[AI Backend] Connected to MongoDB');
  } catch (err) {
    console.error('[AI Backend] MongoDB connection error:', err.message);
    process.exit(1);
  }
}
