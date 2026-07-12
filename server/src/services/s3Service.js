const fs = require('fs');
const path = require('path');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const s3Client = require('../config/s3');

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const LOCAL_UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');
const storageMode = () => (process.env.STORAGE_DRIVER || process.env.STORAGE_MODE || '').toLowerCase();

const useS3 = (document) => {
  if (document && document.storageType) {
    return document.storageType === 's3';
  }

  if (document && document.bucket === 'local-storage') {
    return false;
  }

  if (storageMode() === 'local') {
    return false;
  }

  return Boolean(BUCKET_NAME);
};

const validateS3Config = () => {
  if (!BUCKET_NAME) {
    throw new Error('AWS_BUCKET_NAME is required for S3 uploads. Set STORAGE_DRIVER=local to use local uploads.');
  }

  const hasAccessKey = Boolean(process.env.AWS_ACCESS_KEY_ID);
  const hasSecretKey = Boolean(process.env.AWS_SECRET_ACCESS_KEY);
  if (hasAccessKey !== hasSecretKey) {
    throw new Error('Both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set together.');
  }
};

const ensureLocalUploadDir = (userId) => {
  const userDir = path.join(LOCAL_UPLOAD_ROOT, String(userId));
  fs.mkdirSync(userDir, { recursive: true });
  return userDir;
};

const uploadToStorage = async (file, userId) => {
  const fileHash = crypto.randomUUID();
  const safeName = `${fileHash}-${file.originalname.replace(/\s+/g, '_')}`;

  if (useS3()) {
    validateS3Config();
    const s3Key = `uploads/${userId}/${safeName}`;
    const params = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    try {
      console.log(`Uploading to S3 bucket ${BUCKET_NAME} with key ${s3Key}`);
      await s3Client.send(new PutObjectCommand(params));
      return { s3Key, bucket: BUCKET_NAME, storageType: 's3' };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('S3 upload failed: ' + error.message);
    }
  }

  const localDir = ensureLocalUploadDir(userId);
  const filePath = path.join(localDir, safeName);
  fs.writeFileSync(filePath, file.buffer);
  return { s3Key: filePath, bucket: 'local-storage', storageType: 'local' };
};

const getPresignedDownloadUrl = async (document, expiresIn = 300) => {
  if (useS3(document)) {
    validateS3Config();
    const params = {
      Bucket: BUCKET_NAME,
      Key: document.s3Key
    };

    try {
      const command = new GetObjectCommand(params);
      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new Error('Could not generate download link: ' + error.message);
    }
  }

  return `/api/files/${document._id || document.id}`;
};

const getStoredFile = async (document) => {
  if (useS3(document)) {
    validateS3Config();
    const params = {
      Bucket: BUCKET_NAME,
      Key: document.s3Key
    };

    const response = await s3Client.send(new GetObjectCommand(params));
    return {
      stream: response.Body,
      contentType: response.ContentType || 'application/octet-stream',
      fileName: document.originalName
    };
  }

  const filePath = document.s3Key;
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }

  return {
    stream: fs.createReadStream(filePath),
    contentType: document.fileType || 'application/octet-stream',
    fileName: document.originalName
  };
};

const deleteFromStorage = async (document) => {
  if (useS3(document)) {
    validateS3Config();
    const params = {
      Bucket: BUCKET_NAME,
      Key: document.s3Key
    };

    await s3Client.send(new DeleteObjectCommand(params));
    return true;
  }

  if (document.s3Key && fs.existsSync(document.s3Key)) {
    fs.unlinkSync(document.s3Key);
  }

  return true;
};

module.exports = {
  uploadToStorage,
  getPresignedDownloadUrl,
  deleteFromStorage,
  getStoredFile,
  useS3
};
