# Introduction

Project contains several demo application showcasing use of AWS Cognito service.

## Prerequisities
1. AWS account (with ability to install CloudFormation)
2. [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html) connected to that account
3. Node 18 (or above)

Project uses [AWS CDK](https://docs.aws.amazon.com/cdk/api/v2/) for CloudFormation definition/deployment. But CDK is part of application (as Node module)

# Content

Project contains definition of AWS SES (Simple Email service) you need to be able to send emails to Cognito users. SES must be set up before any other stack.
Please update SES settings to contain your own identities.

## User pool demo

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

### CDK
* Cognito user pool and client setup 
  * with groups
  * with UI customization
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

[Federated demo readme](./doc/federated.md)

## Cognito triggers demo

[Triggers demo readme](./doc/triggers.md)

## ChangeLog
Any missing version means mostly documentation fixes.

### version 0.9.0
2023-05-05
```
+ code documented
```
