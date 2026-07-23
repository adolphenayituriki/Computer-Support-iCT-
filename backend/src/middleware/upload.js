import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '../../public/uploads/courses');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = {
    thumbnail: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    resource: [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
    ],
  };
  const group = file.fieldname === 'thumbnail' ? 'thumbnail'
    : file.fieldname === 'video' || file.fieldname === 'introVideo' || file.fieldname === 'videoFile' ? 'video'
    : 'resource';
  if (allowed[group]?.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed for ${file.fieldname}`));
  }
};

const limits = {
  thumbnail: 5 * 1024 * 1024,
  video: 500 * 1024 * 1024,
  resource: 50 * 1024 * 1024,
};

export const uploadCourseFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 },
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'introVideo', maxCount: 1 },
  { name: 'videoFile', maxCount: 1 },
  { name: 'resourceFiles', maxCount: 20 },
]);

export function handleUpload(req, res, next) {
  uploadCourseFile(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large.' });
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}
