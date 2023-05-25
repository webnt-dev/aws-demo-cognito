import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class Cognito3Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Cognito user pool
    const userPool3 = new cognito.UserPool(this, 'userPool3', {
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
          mutable: true, // must be mutable, because it can be change by SSO provider!
          required: true,
        }
      },
      keepOriginal: { // what to do before new email/phone verification
        email: true,
      },
      signInAliases: { email: true }, // what attribute can be used for sign in
      userPoolName: 'cognito3-userpool',
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
		const client1 = userPool3.addClient('userPool3-client1', {
			userPoolClientName: 'userPool3-client1',

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
					authorizationCodeGrant: true, // for identification against Cognito
					implicitCodeGrant: true // Google Auth provides tokens directly, no code
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

			supportedIdentityProviders: [ // defining identity providers
				cognito.UserPoolClientIdentityProvider.COGNITO,
				cognito.UserPoolClientIdentityProvider.GOOGLE,
			],


		});

		// Domain for user pool, since we want to use OAuth flow, we need domain to authenticate agains
		userPool3.addDomain('userPoolDomain1', {
			cognitoDomain: {
				domainPrefix: 'asw-demo-cogniot3', // changed to asw, cogniot, domain cannot contain words 'AWS' 'cognito'
			},
		});

		// well... you can set up tags
    cdk.Tags.of(userPool3).add('cost-allocation', 'test');

		new cdk.CfnOutput(this, 'cognito3-userPool3', {
      value: userPool3.userPoolArn,
      description: 'User pool ARN',
      exportName: 'cognito3-userPool3',
    });

		// Google identity provider
		// https://console.cloud.google.com/apis/dashboard
		const provider = new cognito.UserPoolIdentityProviderGoogle(this, 'GoogleProvider', {
		 	clientId: '42501478123-8glnlo0r70l96kvni73c1a8j17q6eubk.apps.googleusercontent.com', // Google client ID
			// Google client secret, do not commit this ident to public repo on internet!!
			// it's dome just for demo purposes
			// use clientSecretValue as prefered option
		 	clientSecret: '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',
		 	userPool: userPool3, // User pool this providers provides identitis for
			 attributeMapping: { // how should informations provided from SSO be mapped to Cognito
				email: cognito.ProviderAttribute.GOOGLE_EMAIL,
			 },
			 scopes: ['email'] // requered scope from SSO
		 });


  }
}
