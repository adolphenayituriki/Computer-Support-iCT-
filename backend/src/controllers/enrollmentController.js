import Enrollment from '../models/Enrollment.js';
import CourseProgress from '../models/CourseProgress.js';
import Course from '../models/Course.js';

export async function enrollInCourse(req, res) {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const existing = await Enrollment.findOne({ userId: req.user.id, courseId });
    if (existing) return res.status(400).json({ error: 'Already enrolled in this course.' });

    const enrollment = await Enrollment.create({ userId: req.user.id, courseId, status: 'enrolled' });
    await CourseProgress.create({ userId: req.user.id, courseId });

    res.status(201).json({ enrollment, message: 'Enrolled successfully.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function unenrollFromCourse(req, res) {
  try {
    const { courseId } = req.params;
    const enrollment = await Enrollment.findOneAndDelete({ userId: req.user.id, courseId });
    if (!enrollment) return res.status(404).json({ error: 'Not enrolled in this course.' });

    await CourseProgress.findOneAndDelete({ userId: req.user.id, courseId });
    res.json({ message: 'Unenrolled successfully.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function getMyEnrollments(req, res) {
  try {
    const enrollments = await Enrollment.find({ userId: req.user.id }).populate('courseId', 'title description category difficulty estimatedTime thumbnail author');
    const progressDocs = await CourseProgress.find({ userId: req.user.id });

    const progressMap = {};
    progressDocs.forEach((p) => { progressMap[p.courseId.toString()] = p; });

    const result = enrollments.map((e) => {
      const progress = progressMap[e.courseId.toString()];
      return {
        enrollment: e,
        progress: progress ? { progress: progress.progress, completed: progress.completed, sections: progress.sections } : null,
      };
    });

    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function getCourseProgress(req, res) {
  try {
    const { courseId } = req.params;
    const progress = await CourseProgress.findOne({ userId: req.user.id, courseId });
    if (!progress) return res.status(404).json({ error: 'No progress found.' });
    res.json(progress);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function markSectionComplete(req, res) {
  try {
    const { courseId } = req.params;
    const { section, resourceId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const enrollment = await Enrollment.findOne({ userId: req.user.id, courseId });
    if (!enrollment) return res.status(400).json({ error: 'Not enrolled in this course.' });

    let progress = await CourseProgress.findOne({ userId: req.user.id, courseId });
    if (!progress) {
      progress = await CourseProgress.create({ userId: req.user.id, courseId });
    }

    switch (section) {
      case 'content':
        progress.sections.contentRead = true;
        break;
      case 'video':
        progress.sections.videoWatched = true;
        break;
      case 'introVideo':
        progress.sections.introVideoWatched = true;
        break;
      case 'resource':
        if (resourceId && !progress.sections.resourcesChecked.includes(resourceId)) {
          progress.sections.resourcesChecked.push(resourceId);
        }
        break;
      default:
        return res.status(400).json({ error: 'Invalid section.' });
    }

    progress.calculateProgress(course);
    await progress.save();

    if (progress.completed && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
      await enrollment.save();
    }

    res.json({ progress: progress.progress, completed: progress.completed, sections: progress.sections });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function getMyCourseProgress(req, res) {
  try {
    const enrollments = await Enrollment.find({ userId: req.user.id }).select('courseId status completedAt');
    const progressDocs = await CourseProgress.find({ userId: req.user.id }).select('courseId progress completed sections');

    const progressMap = {};
    progressDocs.forEach((p) => { progressMap[p.courseId.toString()] = p; });

    const result = enrollments.map((e) => ({
      courseId: e.courseId,
      enrolled: true,
      status: e.status,
      completedAt: e.completedAt,
      progress: progressMap[e.courseId.toString()] || { progress: 0, completed: false, sections: {} },
    }));

    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
}
