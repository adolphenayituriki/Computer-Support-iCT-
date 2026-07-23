import mongoose from 'mongoose';

const liveSessionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hostName: { type: String, required: true },
  jitsiRoomId: { type: String, required: true, unique: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 60 },
  status: { type: String, enum: ['scheduled', 'live', 'ended', 'cancelled'], default: 'scheduled' },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    joinedAt: { type: Date, default: Date.now },
    leftAt: Date,
  }],
  settings: {
    maxParticipants: { type: Number, default: 100 },
    enableChat: { type: Boolean, default: true },
    enableScreenShare: { type: Boolean, default: true },
    enableRecording: { type: Boolean, default: false },
    muteParticipants: { type: Boolean, default: false },
  },
}, { timestamps: true });

liveSessionSchema.index({ status: 1, scheduledAt: 1 });
liveSessionSchema.index({ host: 1 });

export default mongoose.model('LiveSession', liveSessionSchema);
