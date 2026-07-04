import Course from '../models/Course.js';

export async function getPublishedCourses(_req, res) {
  try {
    const courses = await Course.find({ published: true }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function getCourse(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}
