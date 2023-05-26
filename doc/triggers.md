# Triggers demo

Triggers are actions that can be performed at certain steps during sign in, sign up, etc.
Triggers are implemented using Lambda functions.

This demo shows 2 triggers:
* after confirmation trigger (trigger that runs after user successfully signs in (after code or link verification))
  * demo will add user into group based on this trigger
* migration trigger (trigger that runs if user, that does not exists try to sign in = you can migrate such user from different source)
  * demo will allow specific non-existing user to sign in and creates this user in User pool

## CDK

### Cognito stack
`cdk\lib\cognito3.ts`

Definition of Cognito stack
* User pool definition
  * User pool groups
* User pool client definition with oAuth code flow
* User group `admin-group`
* definition of trigger lambdas
* definitions of roles
  * for lambda to run
  * for lambda to be able to add user to user pool group


Deploy as `npx aws-cdk deploy Cognito3` / `cdk deploy Cognito3`.

## Lambdas

### After confirmation lambda 
`lambda\cognito4SignUpPostConfirmation`

Lambda handler (`lambda\cognito4SignUpPostConfirmation\src\index.mts`) adds a user to `admin-group` if the user's email contains the text `admin`.

Registering user without `admin` in email does nothing, registering user with `admin` in email adds user to `admin-group`

Build: `npm run all`

### Migration lambda 
`lambda\cognito4SignInMigrate`

Lambda handler (`lambda\cognito4SignInMigrate\src\index.mts`) adds user to pool if user's email and password are validated against different source than Cognito itself (just an array in this case, but it can be remote database you want to migrate users from).

* Sign in using existing user will simply does exactly that, without any side effect
* Sign in using non existing user, e.g. `example@example.com` will result in regular "User does not exists" log in error
* Sign in using non existing user `test6@webnt.dev` with password `Test123` will result in successful login and user will be created in Cognito.

Build: `npm run all`
