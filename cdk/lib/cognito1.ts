import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
export class Cognito1Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Cognito user pool
    const userPool1 = new cognito.UserPool(this, 'userPool1', {
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      autoVerify: { email: true, phone: false },
      email: cognito.UserPoolEmail.withSES({ // Email configuration used to send email
       configurationSetName: cdk.Fn.importValue('ses-cfg-no-reply'),
       fromEmail: 'no-reply@webnt.dev',
       fromName: 'WebNT',
       sesRegion: 'eu-central-1',
      }),
      mfa: cognito.Mfa.OFF, // multi-factor authn
      passwordPolicy: {
        minLength: 6,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
        tempPasswordValidity: cdk.Duration.days(3),
      },
      standardAttributes: { // default set of user attributes
        email: {
          mutable: false,
          required: true,
        }
      },
      keepOriginal: { // what to do before new email/phone verification
        email: true,
      },
      signInAliases: { email: true }, // what attribute can be used for sign in
      userPoolName: 'cognito1-userpool',
      signInCaseSensitive: false, // case insensitive is preferred in most situations

			userVerification: { // SignUp verification email
				emailSubject: 'Hi, verify your email for WebNT cognito demo',
				emailBody: 'Thanks for signing up to our awesome demo! Your verification code is {####}',
				emailStyle: cognito.VerificationEmailStyle.CODE,
			},
			userInvitation: { // Invitation email
				emailSubject: 'Invitation to WebNT',
				emailBody: 'You\'ve been invited to WebNT demo with username: {username} and temporary password: {####}.',
			},
			selfSignUpEnabled: true, // whether users can sign up or must be created by admin
    });

		// User pool client
		const client1 = userPool1.addClient('userPool1-client1', {
			userPoolClientName: 'userPool1-client1',

			authFlows: { // what type of pasword verification/exchange can be used
				userPassword: true,
				userSrp: true,
			},
			authSessionValidity: cdk.Duration.minutes(3), // validity of token during authentication process
			preventUserExistenceErrors: true, // type of error if user does not exists in pool
			idTokenValidity: cdk.Duration.minutes(5),
			refreshTokenValidity: cdk.Duration.days(30),
			accessTokenValidity: cdk.Duration.minutes(5),
			enableTokenRevocation: true,
			oAuth: { // definition of oAuth
				flows: {
					authorizationCodeGrant: true, // authentication using code exchnage
				},
				callbackUrls: [ // allowed login callback urls
					'http://localhost:8000/',
					'http://localhost:8000/app.html'
				],
				logoutUrls: [ // allowed logout callback urls
					'http://localhost:8000/'
				],
				scopes: [ // scopes allowed by this client
					cognito.OAuthScope.EMAIL,
					cognito.OAuthScope.OPENID,
					cognito.OAuthScope.PHONE,
					cognito.OAuthScope.PROFILE,
				]
			},

		});

		// Domain for user pool, since we want to use OAuth flow, we need domain to authenticate agains
		userPool1.addDomain('CognitoDomain1', {
			cognitoDomain: {
				domainPrefix: 'asw-demo-cogniot1', // changed to asw, cogniot, domain cannot contain words 'AWS' 'cognito'
			},
		});

		// output of user pool ARN, it is used in ./appsync1.ts for import
		// we want to use this user pool to authorize requests against AppSync
		new cdk.CfnOutput(this, 'cognito1-userPool', {
      value: userPool1.userPoolArn,
      description: 'User pool ARN',
      exportName: 'cognito1-userPool',
    });

		// well... you can set up tags
    cdk.Tags.of(userPool1).add('cost-allocation', 'test');


  }
}
