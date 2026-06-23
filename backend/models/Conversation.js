import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['admin', 'user'], required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  messages: [messageSchema],
  lastActivity: { type: Date, default: Date.now },
}, { timestamps: true });

conversationSchema.pre('save', function (next) {
  this.lastActivity = new Date();
  next();
});

export default mongoose.model('Conversation', conversationSchema);
