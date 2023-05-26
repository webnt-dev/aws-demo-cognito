# Triggers demo

Triggers are are actions, that can be performed at certain steps during sign in, sign up, etc.
Triggers are implemented using Lambda functions.

This demo shows 
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

### Aftre confirmation lambda 
`lambda\cognito4SignUpPostConfirmation`

Build: 
