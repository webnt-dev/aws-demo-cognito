# Identity pool demo

## CDK
`cdk\lib\cognito2.ts`

Definition of Cognito stack
* User pool definition
  * User pool groups
* User pool client definition with oAuth code flow
  * Hosted UI customization
* export/output of user pool ARN
* Identity pool
  * Roles to be used in identity pool for unathenticated users, authenticated users and users in group `admin-group`
  * Identity pool with assigned unauth role, default auth role and how to map different auth role (`admin-group` role) based on authenticated user
* S3 bucket with read access by unauth user and read/write access for any auth user (including `admin-group` users)
* S3 bucket with read/write access for admin user (`admin-group` users)

Deploy as `npx aws-cdk deploy Cognito2` / `cdk deploy Cognito2`.

For this demo to work, add users (after sign up) to different groups
