terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type        = string
  default     = "ap-south-1"
  description = "AWS Region to deploy resources"
}

variable "project_name" {
  type        = string
  default     = "dms-storage"
  description = "Project name prefix"
}

variable "s3_uploader_user_name" {
  type        = string
  default     = "dms-s3-uploader"
  description = "IAM user used by the app server to upload, download, and delete S3 documents"
}

resource "random_id" "bucket_suffix" {
  byte_length = 6
}

# --- AWS S3 Bucket ---
resource "aws_s3_bucket" "dms_bucket" {
  bucket        = "${var.project_name}-${random_id.bucket_suffix.hex}"
  force_destroy = true

  tags = {
    Name        = "Document Storage S3 Bucket"
    Environment = "Dev"
    Project     = var.project_name
  }
}

resource "aws_s3_bucket_public_access_block" "dms_bucket_public_block" {
  bucket = aws_s3_bucket.dms_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "dms_bucket_cors" {
  bucket = aws_s3_bucket.dms_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"] # Adjust to specific origins in production
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# --- IAM permissions for app S3 uploads ---
resource "aws_iam_user_policy" "dms_s3_uploader_policy" {
  name = "${var.project_name}-s3-uploader"
  user = var.s3_uploader_user_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ListDocumentUploads"
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = aws_s3_bucket.dms_bucket.arn
        Condition = {
          StringLike = {
            "s3:prefix" = [
              "uploads/*"
            ]
          }
        }
      },
      {
        Sid    = "ManageDocumentUploads"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.dms_bucket.arn}/uploads/*"
      },
      {
        Sid    = "ManageDynamoMetadata"
        Effect = "Allow"
        Action = [
          "dynamodb:DeleteItem",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem"
        ]
        Resource = [
          aws_dynamodb_table.users_table.arn,
          aws_dynamodb_table.folders_table.arn,
          "${aws_dynamodb_table.folders_table.arn}/index/*",
          aws_dynamodb_table.documents_table.arn,
          "${aws_dynamodb_table.documents_table.arn}/index/*"
        ]
      }
    ]
  })
}

# --- DynamoDB: Users Table ---
resource "aws_dynamodb_table" "users_table" {
  name         = "dms-users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "email"

  attribute {
    name = "email"
    type = "S"
  }

  tags = {
    Environment = "Dev"
    Project     = var.project_name
  }
}

# --- DynamoDB: Folders Table ---
resource "aws_dynamodb_table" "folders_table" {
  name         = "dms-folders"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "ownerId"
    type = "S"
  }

  attribute {
    name = "parentFolderId"
    type = "S"
  }

  # Global Secondary Index to query all folders owned by a user inside a specific parent folder
  global_secondary_index {
    name            = "OwnerParentIndex"
    hash_key        = "ownerId"
    range_key       = "parentFolderId"
    projection_type = "ALL"
  }

  tags = {
    Environment = "Dev"
    Project     = var.project_name
  }
}

# --- DynamoDB: Documents Table ---
resource "aws_dynamodb_table" "documents_table" {
  name         = "dms-documents"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "uploadedBy"
    type = "S"
  }

  attribute {
    name = "folderId"
    type = "S"
  }

  attribute {
    name = "shareToken"
    type = "S"
  }

  # Global Secondary Index to query documents owned by a user in a specific folder
  global_secondary_index {
    name            = "OwnerFolderIndex"
    hash_key        = "uploadedBy"
    range_key       = "folderId"
    projection_type = "ALL"
  }

  # Global Secondary Index to lookup documents by shareToken
  global_secondary_index {
    name            = "ShareTokenIndex"
    hash_key        = "shareToken"
    projection_type = "ALL"
  }

  tags = {
    Environment = "Dev"
    Project     = var.project_name
  }
}

# --- Outputs ---
output "bucket_name" {
  value       = aws_s3_bucket.dms_bucket.id
  description = "The name of the S3 bucket"
}

output "bucket_region" {
  value       = var.aws_region
  description = "The AWS region of the S3 bucket"
}
