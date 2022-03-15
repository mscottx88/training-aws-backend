provider "aws" {
  region  = "us-east-1"
  version = "~> 3.74"
}

data "aws_caller_identity" "current" {}

locals {
  aws_account_id                  = data.aws_caller_identity.current.account_id
  terraform_state_bucket_name     = "${local.aws_account_id}-training-aws-backend-terraform-state"
  terraform_state_lock_table_name = "training-aws-backend-terraform-locks"
}

data "aws_iam_policy_document" "tfstate" {
  statement {
    actions = [
      "s3:*"
    ]

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }

    resources = [
      "arn:aws:s3:::${local.terraform_state_bucket_name}",
      "arn:aws:s3:::${local.terraform_state_bucket_name}/*"
    ]
  }
}

resource "aws_s3_bucket" "tfstate" {
  acl    = "private"
  bucket = local.terraform_state_bucket_name
  policy = data.aws_iam_policy_document.tfstate.json

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  versioning {
    enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  block_public_acls       = true
  block_public_policy     = true
  restrict_public_buckets = true
  ignore_public_acls      = true
}

resource "aws_dynamodb_table" "tfstate" {
  name     = local.terraform_state_lock_table_name
  hash_key = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  read_capacity  = 5
  write_capacity = 5
}
