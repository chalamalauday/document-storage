const multer = require('multer');

// Store files in memory to easily upload them directly to AWS S3
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // Limit file size to 50MB
  }
});

module.exports = upload;
