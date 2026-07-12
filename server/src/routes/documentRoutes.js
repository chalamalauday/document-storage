const express = require('express');
const {
  uploadDocument,
  getDocuments,
  getDocumentDetails,
  downloadDocument,
  deleteDocument,
  createFolder,
  getFolders,
  shareDocument,
  getSharedDocument
} = require('../controllers/documentController');
const { streamDocument } = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Folder Routes
router.post('/folders', protect, createFolder);
router.get('/folders', protect, getFolders);

// Document Routes
router.post('/documents/upload', protect, upload.single('file'), uploadDocument);
router.get('/documents', protect, getDocuments);
router.get('/documents/:id', protect, getDocumentDetails);
router.get('/documents/:id/download', protect, downloadDocument);
router.delete('/documents/:id', protect, deleteDocument);
router.post('/documents/:id/share', protect, shareDocument);

// Public Shared Document Route
router.get('/shared/:token', getSharedDocument);
router.get('/files/:id', streamDocument);

module.exports = router;
