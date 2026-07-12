const { uploadToStorage, getPresignedDownloadUrl, deleteFromStorage, getStoredFile } = require('../services/s3Service');
const dynamoStore = require('../services/dynamoStore');
const crypto = require('crypto');

/**
 * @desc    Upload file to S3 and save metadata in DynamoDB
 * @route   POST /api/documents/upload
 * @access  Private
 */
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const { folderId } = req.body;
    let finalFolderId = 'null';

    if (folderId && folderId !== 'null' && folderId !== '') {
      const folder = await dynamoStore.findFolderById(folderId, req.user.id);
      if (!folder) {
        return res.status(400).json({ success: false, message: 'Invalid folder ID' });
      }
      finalFolderId = folderId;
    }

    const storageResult = await uploadToStorage(req.file, req.user.id);
    const document = await dynamoStore.createDocument({
      fileName: storageResult.s3Key.split('/').pop(),
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      size: req.file.size,
      s3Key: storageResult.s3Key,
      bucket: storageResult.bucket,
      uploadedBy: req.user.id,
      folder: finalFolderId === 'null' ? null : finalFolderId
    });

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      document: {
        _id: document._id,
        fileName: document.fileName,
        originalName: document.originalName,
        fileType: document.fileType,
        size: document.size,
        s3Key: document.s3Key,
        bucket: document.bucket,
        uploadedBy: document.uploadedBy,
        folderId: document.folder,
        shareToken: document.shareToken,
        shareExpiresAt: document.shareExpiresAt,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    console.error('Upload controller error:', error);
    return res.status(500).json({ success: false, message: 'File upload failed', error: error.message });
  }
};

/**
 * @desc    Get all documents for user, optionally filtered by folder and search query
 * @route   GET /api/documents
 * @access  Private
 */
const getDocuments = async (req, res) => {
  try {
    const { folderId, search } = req.query;
    const finalFolderId = (folderId === 'null' || folderId === '' || !folderId) ? null : folderId;

    let documents = await dynamoStore.listDocuments(req.user.id, finalFolderId);

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      documents = documents.filter(doc => searchRegex.test(doc.originalName));
    }

    return res.json({
      success: true,
      documents: documents.map(doc => ({
        _id: doc._id,
        fileName: doc.fileName,
        originalName: doc.originalName,
        fileType: doc.fileType,
        size: doc.size,
        s3Key: doc.s3Key,
        bucket: doc.bucket,
        uploadedBy: doc.uploadedBy,
        folderId: doc.folder,
        shareToken: doc.shareToken,
        shareExpiresAt: doc.shareExpiresAt,
        createdAt: doc.createdAt
      }))
    });
  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving documents' });
  }
};

/**
 * @desc    Get document details
 * @route   GET /api/documents/:id
 * @access  Private
 */
const getDocumentDetails = async (req, res) => {
  try {
    const document = await dynamoStore.findDocumentById(req.params.id);
    if (!document || document.uploadedBy !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    return res.json({
      success: true,
      document: {
        _id: document._id,
        fileName: document.fileName,
        originalName: document.originalName,
        fileType: document.fileType,
        size: document.size,
        s3Key: document.s3Key,
        bucket: document.bucket,
        uploadedBy: document.uploadedBy,
        folderId: document.folder,
        shareToken: document.shareToken,
        shareExpiresAt: document.shareExpiresAt,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    console.error('Get document details error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving document details' });
  }
};

/**
 * @desc    Generate a presigned S3 URL for downloading a document
 * @route   GET /api/documents/:id/download
 * @access  Private
 */
const downloadDocument = async (req, res) => {
  try {
    const document = await dynamoStore.findDocumentById(req.params.id);
    if (!document || document.uploadedBy !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const downloadUrl = await getPresignedDownloadUrl(document, 600);
    return res.json({
      success: true,
      downloadUrl,
      fileName: document.originalName
    });
  } catch (error) {
    console.error('Download controller error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate download URL' });
  }
};

/**
 * @desc    Delete a document from S3 and DynamoDB
 * @route   DELETE /api/documents/:id
 * @access  Private
 */
const deleteDocument = async (req, res) => {
  try {
    const document = await dynamoStore.findDocumentById(req.params.id);
    if (!document || document.uploadedBy !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    await deleteFromStorage(document);
    await dynamoStore.deleteDocument(req.params.id);

    return res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete controller error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete document', error: error.message });
  }
};

/**
 * @desc    Create a new folder
 * @route   POST /api/folders
 * @access  Private
 */
const createFolder = async (req, res) => {
  const { name, parentFolderId } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide a folder name' });
    }

    const finalParentFolderId = (parentFolderId && parentFolderId !== 'null') ? parentFolderId : null;

    const existingFolder = (await dynamoStore.listFolders(req.user.id, finalParentFolderId))
      .find((folder) => folder.name.toLowerCase() === name.toLowerCase());

    if (existingFolder) {
      return res.status(400).json({ success: false, message: 'A folder with this name already exists in this directory' });
    }

    const folder = await dynamoStore.createFolder({
      name,
      parentFolder: finalParentFolderId,
      owner: req.user.id
    });

    return res.status(201).json({
      success: true,
      folder: {
        _id: folder._id,
        name: folder.name,
        parentFolderId: folder.parentFolder,
        ownerId: folder.owner,
        createdAt: folder.createdAt
      }
    });
  } catch (error) {
    console.error('Create folder error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create folder' });
  }
};

/**
 * @desc    Get all folders for user, optionally filtered by parent folder
 * @route   GET /api/folders
 * @access  Private
 */
const getFolders = async (req, res) => {
  try {
    const { parentFolderId } = req.query;
    const finalParentFolderId = (parentFolderId === 'null' || parentFolderId === '' || !parentFolderId) ? null : parentFolderId;

    const folders = await dynamoStore.listFolders(req.user.id, finalParentFolderId);

    return res.json({
      success: true,
      folders: folders.map(folder => ({
        _id: folder._id,
        name: folder.name,
        parentFolderId: folder.parentFolder,
        ownerId: folder.owner,
        createdAt: folder.createdAt
      }))
    });
  } catch (error) {
    console.error('Get folders error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving folders' });
  }
};

/**
 * @desc    Generate a sharing link for a document (valid for 5 minutes)
 * @route   POST /api/documents/:id/share
 * @access  Private
 */
const shareDocument = async (req, res) => {
  try {
    const document = await dynamoStore.findDocumentById(req.params.id);
    if (!document || document.uploadedBy !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await dynamoStore.updateDocumentShare(req.params.id, token, expiresAt);

    return res.json({
      success: true,
      shareToken: token,
      expiresAt
    });
  } catch (error) {
    console.error('Share controller error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate share link' });
  }
};

/**
 * @desc    Access shared document without auth using secure token
 * @route   GET /api/shared/:token
 * @access  Public
 */
const getSharedDocument = async (req, res) => {
  try {
    const document = await dynamoStore.findSharedDocument(req.params.token);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Shared link is invalid or has expired' });
    }

    const isExpired = new Date(document.shareExpiresAt) < new Date();
    if (isExpired) {
      return res.status(404).json({ success: false, message: 'Shared link is invalid or has expired' });
    }

    const downloadUrl = await getPresignedDownloadUrl(document, 300);

    return res.json({
      success: true,
      document: {
        _id: document._id,
        originalName: document.originalName,
        fileType: document.fileType,
        size: document.size,
        createdAt: document.createdAt
      },
      downloadUrl
    });
  } catch (error) {
    console.error('Get shared document error:', error);
    return res.status(500).json({ success: false, message: 'Server error accessing shared document' });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentDetails,
  downloadDocument,
  deleteDocument,
  createFolder,
  getFolders,
  shareDocument,
  getSharedDocument
};
