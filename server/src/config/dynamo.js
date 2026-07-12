const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const region = process.env.AWS_REGION || 'ap-south-1';

let client;

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  client = new DynamoDBClient({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
} else {
  // Fallback to default credential provider chain (e.g. AWS CLI credentials)
  client = new DynamoDBClient({ region });
}

const dynamoClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true, // Auto-removes undefined values from payloads
    convertEmptyValues: true     // Auto-converts empty strings/blobs to null types
  }
});

module.exports = dynamoClient;
