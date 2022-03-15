locals {
  aws_account_id = data.aws_caller_identity.current.account_id
  exercise_name  = "exercise-1-ddb-csv"
}
