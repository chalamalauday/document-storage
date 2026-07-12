const { randomUUID } = require('crypto');
const {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand
} = require('@aws-sdk/lib-dynamodb');
const dynamoClient = require('../config/dynamo');

const USERS_TABLE = process.env.DYNAMO_USERS_TABLE || 'dms-users';
const FOLDERS_TABLE = process.env.DYNAMO_FOLDERS_TABLE || 'dms-folders';
const DOCUMENTS_TABLE = process.env.DYNAMO_DOCUMENTS_TABLE || 'dms-documents';
const ROOT_FOLDER = '__ROOT__';

const normalizeEmail = (email) => email.toLowerCase().trim();
const encodeFolder = (folderId) => folderId || ROOT_FOLDER;
const decodeFolder = (folderId) => (folderId === ROOT_FOLDER ? null : folderId);

const toApiUser = (user) => user ? { ...user, id: user._id } : null;

const toApiFolder = (folder) => folder ? {
  ...folder,
  id: folder._id,
  parentFolder: decodeFolder(folder.parentFolderId)
} : null;

const toApiDocument = (document) => document ? {
  ...document,
  id: document._id,
  folder: decodeFolder(document.folderId),
  shareToken: document.shareToken || null,
  shareExpiresAt: document.shareExpiresAt || null
} : null;

const createUser = async ({ name, email, password }) => {
  const now = new Date().toISOString();
  const emailLower = normalizeEmail(email);
  const user = {
    email: emailLower,
    _id: randomUUID(),
    name,
    password,
    createdAt: now
  };

  await dynamoClient.send(new PutCommand({
    TableName: USERS_TABLE,
    Item: user,
    ConditionExpression: 'attribute_not_exists(email)'
  }));

  return toApiUser(user);
};

const findUserByEmail = async (email) => {
  const result = await dynamoClient.send(new GetCommand({
    TableName: USERS_TABLE,
    Key: { email: normalizeEmail(email) }
  }));

  return toApiUser(result.Item);
};

const createFolder = async ({ name, parentFolder, owner }) => {
  const now = new Date().toISOString();
  const id = randomUUID();
  const folder = {
    id,
    _id: id,
    name,
    parentFolderId: encodeFolder(parentFolder),
    ownerId: owner,
    owner,
    createdAt: now
  };

  await dynamoClient.send(new PutCommand({
    TableName: FOLDERS_TABLE,
    Item: folder,
    ConditionExpression: 'attribute_not_exists(id)'
  }));

  return toApiFolder(folder);
};

const listFolders = async (owner, parentFolder) => {
  const result = await dynamoClient.send(new QueryCommand({
    TableName: FOLDERS_TABLE,
    IndexName: 'OwnerParentIndex',
    KeyConditionExpression: 'ownerId = :ownerId AND parentFolderId = :parentFolderId',
    ExpressionAttributeValues: {
      ':ownerId': owner,
      ':parentFolderId': encodeFolder(parentFolder)
    }
  }));

  return (result.Items || [])
    .map(toApiFolder)
    .sort((a, b) => a.name.localeCompare(b.name));
};

const findFolderById = async (id, ownerId) => {
  const result = await dynamoClient.send(new GetCommand({
    TableName: FOLDERS_TABLE,
    Key: { id }
  }));

  const folder = toApiFolder(result.Item);
  if (!folder || folder.ownerId !== ownerId) {
    return null;
  }

  return folder;
};

const createDocument = async ({ fileName, originalName, fileType, size, s3Key, bucket, uploadedBy, folder }) => {
  const now = new Date().toISOString();
  const id = randomUUID();
  const document = {
    id,
    _id: id,
    fileName,
    originalName,
    fileType,
    size,
    s3Key,
    bucket,
    uploadedBy,
    folderId: encodeFolder(folder),
    createdAt: now
  };

  await dynamoClient.send(new PutCommand({
    TableName: DOCUMENTS_TABLE,
    Item: document,
    ConditionExpression: 'attribute_not_exists(id)'
  }));

  return toApiDocument(document);
};

const listDocuments = async (owner, folderId) => {
  const result = await dynamoClient.send(new QueryCommand({
    TableName: DOCUMENTS_TABLE,
    IndexName: 'OwnerFolderIndex',
    KeyConditionExpression: 'uploadedBy = :uploadedBy AND folderId = :folderId',
    ExpressionAttributeValues: {
      ':uploadedBy': owner,
      ':folderId': encodeFolder(folderId)
    }
  }));

  return (result.Items || [])
    .map(toApiDocument)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const findDocumentById = async (id) => {
  const result = await dynamoClient.send(new GetCommand({
    TableName: DOCUMENTS_TABLE,
    Key: { id }
  }));

  return toApiDocument(result.Item);
};

const updateDocumentShare = async (id, token, expiresAt) => {
  const result = await dynamoClient.send(new UpdateCommand({
    TableName: DOCUMENTS_TABLE,
    Key: { id },
    UpdateExpression: 'SET shareToken = :shareToken, shareExpiresAt = :shareExpiresAt',
    ConditionExpression: 'attribute_exists(id)',
    ExpressionAttributeValues: {
      ':shareToken': token,
      ':shareExpiresAt': expiresAt
    },
    ReturnValues: 'ALL_NEW'
  }));

  return toApiDocument(result.Attributes);
};

const findSharedDocument = async (token) => {
  const result = await dynamoClient.send(new QueryCommand({
    TableName: DOCUMENTS_TABLE,
    IndexName: 'ShareTokenIndex',
    KeyConditionExpression: 'shareToken = :shareToken',
    ExpressionAttributeValues: {
      ':shareToken': token
    },
    Limit: 1
  }));

  return toApiDocument((result.Items || [])[0]);
};

const deleteDocument = async (id) => {
  await dynamoClient.send(new DeleteCommand({
    TableName: DOCUMENTS_TABLE,
    Key: { id }
  }));

  return true;
};

module.exports = {
  createUser,
  findUserByEmail,
  createFolder,
  listFolders,
  findFolderById,
  createDocument,
  listDocuments,
  findDocumentById,
  updateDocumentShare,
  findSharedDocument,
  deleteDocument
};
