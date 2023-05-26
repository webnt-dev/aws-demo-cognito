# Federated pool demo

Demo showing Google SSO login button (allowing to use Google to log in).

You have to create Google application for this demo to work, allow oAuth and create credentials,
see https://console.cloud.google.com/apis/dashboard.

## CDK

### Cognito stack
`cdk\lib\cognito3.ts`

Definition of Cognito stack
* User pool definition
  * attributes are marhed as `mutable` so SSO provider can modify them
* User pool client definition with oAuth code flow
  * with both Cognito and Google as provides
* Cognito oAuth domain
* export/output of user pool ARN
* definition of Google federated identity provider

Deploy as `npx aws-cdk deploy Cognito3` / `cdk deploy Cognito3`.

## WWW - Cognito UI demo

When trying to login, you should see Google login button, after sucessful authentication using Google, new user is created into pool.

Both Cognito API and Amplify contain functionality to use federated login as well.

Build: none.

Run: `npm run start`.
