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

export async function likeCourse(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    const userId = req.user.id;
    const idx = course.likes.findIndex((id) => id.toString() === userId);
    if (idx === -1) {
      course.likes.push(userId);
    } else {
      course.likes.splice(idx, 1);
    }
    await course.save();
    res.json({ likes: course.likes, likesCount: course.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function commentOnCourse(req, res) {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Comment text is required.' });
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    course.comments.push({ userId: req.user.id, userName: req.user.name, text: text.trim() });
    await course.save();
    res.status(201).json({ comments: course.comments });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}
