locals {
  report_bucket_name = "${local.aws_account_id}-${local.exercise_name}-reports"
}

data "aws_iam_policy_document" "reports" {
  statement {
    actions = [
      "s3:*"
    ]

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${local.aws_account_id}:root"]
    }

    resources = [
      "arn:aws:s3:::${local.report_bucket_name}",
      "arn:aws:s3:::${local.report_bucket_name}/*"
    ]
  }
}

resource "aws_s3_bucket" "reports" {
  acl    = "private"
  bucket = local.report_bucket_name
  policy = data.aws_iam_policy_document.reports.json

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_s3_bucket_public_access_block" "reports" {
  bucket = aws_s3_bucket.reports.id

  block_public_acls       = true
  block_public_policy     = true
  restrict_public_buckets = true
  ignore_public_acls      = true
}
