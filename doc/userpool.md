# User pool demo

## CDK

### Cognito stack
`cdk\lib\cognito1.ts`

Definition of Cognito stack
* User pool definition
* User pool client definition with oAuth code flow
* Cognito oAuth domain
* export/output of user pool ARN

Deploy as `npx aws-cdk deploy Cognito1` / `cdk deploy Cognito1`.

### AppSync stack
`cdk\lib\appsync1.graphql`

`cdk\lib\appsync1.ts`

Definition of AppSync stack:
* AppSync GraphQL definition
  * set up to use Cognito as auth mechanism
* GraphQL schema
* DynamoDB table
* Resolvers for AppSync to communicate with DynamoDB

Deploy as `npx aws-cdk deploy AppSync1` / `cdk deploy AppSync1`.

## WWW - Hosted UI demo
`www\cognito1ui`

Demo using oAuth as auth flow for using User pool for authentication.

After authentication you can
* view logged in user
* perform GraphQL query (using auth user)
* refresh token
* logout

Build: no build required

Run: `npm run start`.
