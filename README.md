# training-aws-backend

Training for AWS-centric backend engineering.

# Setup

Follow these steps to perform setup of the application on your local machine and the AWS resources in your SSO account.

## Dependencies

```sh
yarn install
```

---

## AWS SSO Permissions

Follow the [instructions](https://github.com/FormidableLabs/training-docs/blob/main/docs/courses/cloud-infra/201/getting-started/account-setup.mdx) to setup an SSO user in the Formidable account.

Follow the [instructions](https://github.com/FormidableLabs/training-docs/blob/main/docs/courses/cloud-infra/201/getting-started/_account-setup-aws.mdx#authenticating-with-aws) to work with Formidable SSO user credentials.

---

## Terraform

Here are some pre-built scripts and actions when working with terraform.

---

### Backend State Configuration

To setup the backend for the Terraform state, follow these steps.

Create a new shell, adopting the SSO user permissions.

```sh
yarn terraform:sh
```

> **Note** If you're already in such a shell, you don't need to create yet another.

Setup the backend.

```sh
yarn terraform:setup-backend
```

---

### Init

Since the terraform backend block disallows for variable configuration values, you need to use the `terraform:init` script to initialize the Terraform state. This script completes the backend configuration block dynamically and sends the appropriate parameters to the terraform CLI.

Create a new shell, adopting the SSO user permissions.

```sh
yarn terraform:sh
```

> **Note** If you're already in such a shell, you don't need to create yet another.

Initialize the terraform state.

```sh
yarn terraform:init
```

---

### Plan

Create a new shell, adopting the SSO user permissions.

```sh
yarn terraform:sh
```

> **Note** If you're already in such a shell, you don't need to create yet another.

Plan.

```sh
yarn terraform:plan
```

---

### Apply

Create a new shell, adopting the SSO user permissions.

```sh
yarn terraform:sh
```

> **Note** If you're already in such a shell, you don't need to create yet another.

Plan.

```sh
yarn terraform:apply
```

---

# AWS Console

To login to the AWS console using the SSO credentials:

```sh
yarn aws:console
```

# Usage

The intent of this repository is to help with hands-on learning AWS-centric backend engineering.

Different exercises have different goals. See the READMEs for those exercises for more information.

## Exercises

| Documentation                                                    | Description                                                  |
| :--------------------------------------------------------------- | :----------------------------------------------------------- |
| [Exercise 1 DynamoDB to CSV](./src/exercise-1-ddb-csv/README.md) | Filter DynamoDB rows and generate a CSV file in an S3 bucket |

---
