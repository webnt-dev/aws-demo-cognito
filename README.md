# Introduction

Project contains several demo applications showcasing use of AWS Cognito service.

## Prerequisites
1. AWS account (with ability to install CloudFormation)
2. [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html) connected to that account
3. Node 18 (or above)

Project uses [AWS CDK](https://docs.aws.amazon.com/cdk/api/v2/) for CloudFormation definition/deployment. But CDK is part of application (as Node module)

# Content

## SES

Project contains the definition of AWS SES (Simple Email service). You need to be able to send emails to Cognito users. SES must be set up before any other stack.
Please update SES settings to contain your own identities.

Deploy as `npx aws-cdk deploy Ses` / `cdk deploy Ses`

## User pool demo

Basic user pool demo.

### CDK
* Cognito user pool and client setup
* AppSync/GraphQL setup
* DynamoDB setup

### WWW
* using User pool from AWS hosted UI (login, registration, etc.) using oAuth
  * GraphQL demo, accessible only to Cognito users
* using User pool from AWS Cognito API (login, logout)
* using User pool from AWS Amplify library (login, logout)

[User pool demo readme](./doc/userpool.md)

## Identity pool demo

Basic identity pool demo.

### CDK
* Cognito user pool and client setup
  * with groups
  * with UI customization
* S3 buckets
* AppSync/GraphQL setup
* DynamoDB setup
* Identity pool setup with roles (auth, unauth, admin-like)

### WWW
* using User pool from AWS hosted UI
  * GraphQL demo showcasing use of User pool groups and additional auth methods
* using User pool from Cognito API
  * accessing GraphQL from unauth user
  * accessing AWS resources (S3) directly from web page using roles defined in identity pool

[Identity pool demo readme](./doc/identitypool.md)

## Federated identity provider demo

Adding SSO (single/social sign on) Google login button.

### CDK
* Cognito user pool and client setup
  * with Google as federated provider (Google SSO login button)

### WWW
* using User pool from AWS hosted UI
 * with Google login button

[Federated demo readme](./doc/federated.md)

## Cognito triggers demo

Using triggers to modify Cognito actions (after sign up, user migration).

### CDK
* Lambda definitions
* Cognito user pool and client setup
  * with groups
  * action triggers (Lambda) for signing up and user migration

### WWW
* using User pool from AWS hosted UI

[Triggers demo readme](./doc/triggers.md)

## ChangeLog
Any missing version means mostly documentation fixes.

### version 1.0.0
2023-05-26
```
+ project documentation
```

### version 0.9.0
2023-05-25
```
+ code documented
```
