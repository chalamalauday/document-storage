const dynamoStore = require('../services/dynamoStore');
const { getStoredFile } = require('../services/s3Service');

const streamDocument = async (req, res) => {
  try {
    const document = await dynamoStore.findDocumentById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const file = await getStoredFile(document);
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.fileName)}"`);
    file.stream.pipe(res);
  } catch (error) {
    console.error('Stream document error:', error);
    res.status(500).json({ success: false, message: 'Failed to stream document' });
  }
};

module.exports = { streamDocument };
