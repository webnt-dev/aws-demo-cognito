# Identity pool demo

## CDK

### Cognito stack
`cdk\lib\cognito2.ts`

Definition of Cognito stack
* User pool definition
  * User pool groups
* User pool client definition with oAuth code flow
  * Hosted UI customization
* export/output of user pool ARN
* Identity pool
  * Roles to be used in identity pool for unauthenticated users, authenticated users and users in group `admin-group`
  * Identity pool with assigned unauth role, default auth role and how to map different auth role (`admin-group` role) based on authenticated user
* S3 bucket with read access by unauth user and read/write access for any auth user (including `admin-group` users)
* S3 bucket with read/write access for admin user (`admin-group` users)
* export/output of unauth role

Deploy as `npx aws-cdk deploy Cognito2` / `cdk deploy Cognito2`.

For this demo to work, add users (after sign up) to different groups using the AWS console. Also add some files in both buckets (to showcase listing of content)

### AppSync stack
`cdk\lib\appsync2.graphql`

`cdk\lib\appsync2.ts`

Definition of AppSync stack:
* AppSync GraphQL definition
  * set up to use Cognito as auth mechanism
  * adding additional auth mechanisms using `x-api-key` header 
  * adding additional auth mechanisms using IAM roles
* GraphQL schema
 * schema uses decorators to define, what field is accessible using what auth method
* DynamoDB table
* Resolvers for AppSync to communicate with DynamoDB
* allowing imported unauth role from Cognito to call `getDemos` function

Deploy as `npx aws-cdk deploy AppSync1` / `cdk deploy AppSync1`.

## WWW - Cognito UI demo

Demo using oAuth as auth flow for User pool authentication.

The look of hosted UI is modified (in CDK stack)

After authentication you can
* view logged in user (including groups user belongs to)
* perform GraphQL query (only perform either query or mutation, not both together)
 * using auth user - different users in different groups can access different queries/mutations
 * using ApiKey for queries/mutations key-based auth is allowed to perform
 * unauth user is not allowed to call any query (there are no IAM credentials available in this demo)
* refresh token
* logout

Build: no build required

Run: `npm run start`.

## WWW - Cognito API demo

Demo using AWS API directly.

`Login` button can be pressed to perform actions for unauth user.

Unauth users can call the `getDemos` GraphQL function and can list items in the unauth bucket, but cannot create items in the bucket.

Auth users can list items in the unauth bucket, and can create item in the unauth bucket.
Auth users can or cannot list items in the secret bucket, based on the group user belongs to (role defining permission to access secred bucket is based on group).

Identity credentials are retrieved from identity pool and used either to
* sign HTTP request against AWS source
* or as credentials to access AWS source using API

Build: `npm run all`.

Run: `npm run start`.
