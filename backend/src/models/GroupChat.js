import mongoose from 'mongoose';

const groupMessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
}, { timestamps: true });

const groupChatSchema = new mongoose.Schema({
  name: { type: String, default: 'CS Hub Community' },
  messages: [groupMessageSchema],
  lastActivity: { type: Date, default: Date.now },
}, { timestamps: true });

groupChatSchema.pre('save', function () {
  this.lastActivity = new Date();
});

export default mongoose.model('GroupChat', groupChatSchema);
