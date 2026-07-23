import mongoose from 'mongoose';

const courseProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  sections: {
    contentRead: { type: Boolean, default: false },
    videoWatched: { type: Boolean, default: false },
    introVideoWatched: { type: Boolean, default: false },
    resourcesChecked: [{ type: mongoose.Schema.Types.ObjectId }],
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  lastAccessedAt: { type: Date, default: Date.now },
}, { timestamps: true });

courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
courseProgressSchema.index({ userId: 1, completed: 1 });

courseProgressSchema.methods.calculateProgress = function (course) {
  let total = 0;
  let done = 0;

  if (course.content) {
    total += 40;
    if (this.sections.contentRead) done += 40;
  }
  if (course.videoUrl) {
    total += 30;
    if (this.sections.videoWatched) done += 30;
  }
  if (course.introVideo) {
    total += 15;
    if (this.sections.introVideoWatched) done += 15;
  }
  if (course.resources && course.resources.length > 0) {
    const resTotal = 15;
    const resDone = this.sections.resourcesChecked.length;
    total += resTotal;
    done += Math.round((resDone / course.resources.length) * resTotal);
  }

  if (total === 0) {
    this.progress = 100;
  } else {
    this.progress = Math.min(100, Math.round((done / total) * 100));
  }

  if (this.progress >= 100 && !this.completed) {
    this.completed = true;
    this.completedAt = new Date();
  } else if (this.progress < 100) {
    this.completed = false;
    this.completedAt = null;
  }

  this.lastAccessedAt = new Date();
  return this.progress;
};

export default mongoose.model('CourseProgress', courseProgressSchema);
