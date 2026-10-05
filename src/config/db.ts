import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/carehub';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.info(`\n💡 TIP FOR ATLAS: Set MONGODB_URI in carehub-backend/.env to your MongoDB Atlas connection string.\n`);
    // In production we exit, in dev we don't crash the server so other endpoints/mock routes remain active
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
