import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
export class Cognito1Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // cognito
    const userPool1 = new cognito.UserPool(this, 'userPool1', {
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      autoVerify: { email: true, phone: false },
      email: cognito.UserPoolEmail.withSES({
       configurationSetName: cdk.Fn.importValue('ses-cfg-no-reply'),
       fromEmail: 'no-reply@webnt.dev',
       fromName: 'WebNT',
       // replyTo:
       sesRegion: 'eu-central-1',
       // sesVerifiedDomain:''
      }),
      mfa: cognito.Mfa.OFF,
      passwordPolicy: {
        minLength: 6,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
        tempPasswordValidity: cdk.Duration.days(3),
      },
      standardAttributes: {
        email: {
          mutable: false,
          required: true,
        }
      },
      keepOriginal: {
        email: true,
      },
      signInAliases: { email: true },
      userPoolName: 'cognito1-userpool',
      signInCaseSensitive: false, // case insensitive is preferred in most situations

			userVerification: {
				emailSubject: 'Hi, verify your email for WebNT cognito demo',
				emailBody: 'Thanks for signing up to our awesome demo! Your verification code is {####}',
				emailStyle: cognito.VerificationEmailStyle.CODE,
			},
			userInvitation: {
				emailSubject: 'Invitation to WebNT',
				emailBody: 'You\'ve been invited to WebNT demo with username: {username} and temporary password: {####}.',
			},
			selfSignUpEnabled: true,
    });

		const client1 = userPool1.addClient('userPool1-client1', {
			userPoolClientName: 'userPool1-client1',

			authFlows: {
				userPassword: true,
				userSrp: true,
			},
			authSessionValidity: cdk.Duration.minutes(3),
			preventUserExistenceErrors: true,
			idTokenValidity: cdk.Duration.minutes(5),
			refreshTokenValidity: cdk.Duration.days(30),
			accessTokenValidity: cdk.Duration.minutes(5),
			enableTokenRevocation: true,

			oAuth: {
				flows: {
					authorizationCodeGrant: true,
				},
				callbackUrls: [
					// 'https://aws-demo-cognito1.webnt.dev.test',
					'http://localhost:8000/',
					'http://localhost:8000/app.html'
				],
				logoutUrls: [
					// 'https://aws-demo-cognito1.webnt.dev.test',
					'http://localhost:8000/'
				],
				scopes: [
					cognito.OAuthScope.EMAIL,
					cognito.OAuthScope.OPENID,
					cognito.OAuthScope.PHONE,
					cognito.OAuthScope.PROFILE,
				]
			},

		});
		// const clientId = client.userPoolClientId;

		userPool1.addDomain('CognitoDomain1', {
			cognitoDomain: {
				domainPrefix: 'asw-demo-cogniot1', // changed to asw, cogniot, domain cannot contain words 'AWS' 'cognito'
			},
		});

    cdk.Tags.of(userPool1).add('cost-allocation', 'test');

		new cdk.CfnOutput(this, 'cognito1-userPool', {
      value: userPool1.userPoolArn,
      description: 'User pool ARN',
      exportName: 'cognito1-userPool',
    });

  }
}
