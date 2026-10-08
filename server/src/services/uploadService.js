const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure upload directory exists
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage strategy: Local Disk Storage
// Note: To adapt for AWS S3 / Cloud Storage, replace storage engine with multer-s3 or custom cloud adapter
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const randomHex = crypto.randomBytes(6).toString('hex');
    const safeBaseName = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomHex}-${safeBaseName}${ext}`);
  },
});

// File filter: PDF, DOC, DOCX
const allowedExtensions = ['.pdf', '.doc', '.docx'];
const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isExtAllowed = allowedExtensions.includes(ext);
  const isMimeAllowed = allowedMimeTypes.includes(file.mimetype) || file.mimetype === 'application/octet-stream';

  if (isExtAllowed && isMimeAllowed) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file format: ${ext || file.originalname}. Only PDF, DOC, and DOCX files are permitted.`
      ),
      false
    );
  }
};

// 5MB limit
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

/**
 * Storage adapter helper to abstract storage path/URL
 */
const getFileUrl = (req, filename) => {
  if (!filename) return null;
  // Cloud storage would return s3 URL or signed URL here
  return `/uploads/${filename}`;
};

module.exports = {
  upload,
  uploadDir,
  getFileUrl,
};
