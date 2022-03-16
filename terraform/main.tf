terraform {
  backend "s3" {
    dynamodb_table = "training-aws-backend-terraform-locks"
    key            = "training-aws-backend/terraform.tfstate"
    region         = "us-east-1"
  }
}

provider "aws" {
  region  = "us-east-1"
  version = "~> 3.74"
}
