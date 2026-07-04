import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';

export async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI_CLOUD || process.env.MONGO_URI;
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const hashed = await bcrypt.hash('password123', 10);
      const adminHashed = await bcrypt.hash('admin123', 10);
      const student = await User.create({ name: 'John Doe', email: 'student@test.com', password: hashed, isAdmin: false });
      await User.create({ name: 'Admin', email: 'admin@cshub.rw', password: adminHashed, isAdmin: true });
      await Ticket.create([
        { userId: student._id, userName: 'John Doe', title: 'Laptop running very slow', description: 'My laptop takes ages to boot and apps keep freezing. Need help cleaning it up.', category: 'hardware', status: 'open' },
        { userId: student._id, userName: 'John Doe', title: 'Need Microsoft Office installed', description: 'I have a school project due next week and need Word and Excel installed.', category: 'software', status: 'open' },
      ]);
      console.log('Test user: student@test.com / password123');
      console.log('Admin user: admin@cshub.rw / admin123');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}
