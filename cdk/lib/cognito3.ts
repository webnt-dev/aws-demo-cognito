import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as idp from '@aws-cdk/aws-cognito-identitypool-alpha';

export class Cognito3Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // cognito
    const userPool3 = new cognito.UserPool(this, 'userPool3', {
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
          mutable: true,
          required: true,
        }
      },
      keepOriginal: {
        email: true,
      },
      signInAliases: { email: true },
      userPoolName: 'cognito3-userpool',
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

		const client1 = userPool3.addClient('userPool3-client1', {
			userPoolClientName: 'userPool3-client1',

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
					implicitCodeGrant: true // Google Auth
				},
				callbackUrls: [
					// 'https://aws-demo-cognito2.webnt.dev.test',
					'http://localhost:8000/',
					'http://localhost:8000/app.html'
				],
				logoutUrls: [
					// 'https://aws-demo-cognito2.webnt.dev.test',
					'http://localhost:8000/'
				],
				scopes: [
					cognito.OAuthScope.EMAIL,
					cognito.OAuthScope.OPENID,
					cognito.OAuthScope.PHONE,
					cognito.OAuthScope.PROFILE,
				]
			},





			supportedIdentityProviders: [
				cognito.UserPoolClientIdentityProvider.COGNITO,
				cognito.UserPoolClientIdentityProvider.GOOGLE,
			],


		});

		userPool3.addDomain('userPoolDomain1', {
			cognitoDomain: {
				domainPrefix: 'asw-demo-cogniot3', // changed to asw, cogniot, domain cannot contain words 'AWS' 'cognito'
			},
		});

    cdk.Tags.of(userPool3).add('cost-allocation', 'test');

		new cdk.CfnOutput(this, 'cognito3-userPool3', {
      value: userPool3.userPoolArn,
      description: 'User pool ARN',
      exportName: 'cognito3-userPool3',
    });








		// new cognito.CfnUserPoolGroup(this, 'userPool2AdminGroup', {
		// 	userPoolId: userPool3.userPoolId,
		// 	description: 'Admin group',
		// 	groupName: 'admin-group',
		// 	precedence: 0,
		// });
		// new cognito.CfnUserPoolGroup(this, 'userPool2ReaderGroup', {
		// 	userPoolId: userPool3.userPoolId,
		// 	description: 'Reader group',
		// 	groupName: 'reader-group',
		// 	precedence: 1,
		// });
		// new cognito.CfnUserPoolGroup(this, 'userPool2WriterGroup', {
		// 	userPoolId: userPool3.userPoolId,
		// 	description: 'Writer group',
		// 	groupName: 'writer-group',
		// 	precedence: 1,
		// });


		// const authenticatedRole = new iam.Role(this, 'authRole', {
		// 	assumedBy: new iam.WebIdentityPrincipal('cognito-identity.amazonaws.com'),//new iam.ServicePrincipal('service.amazonaws.com'),
		// });
		// const unauthenticatedRole = new iam.Role(this, 'unauthRole', {
		// 	assumedBy: new iam.WebIdentityPrincipal('cognito-identity.amazonaws.com'),
		// });

		// const cognitoIdP = new idp.IdentityPool(this, 'cognito2-cognitoIdP', {
		// 	identityPoolName: 'cognito2-cognitoIdP',
		// 	allowUnauthenticatedIdentities: true,
		// 	authenticationProviders: {
		// 		userPools: [
		// 			new idp.UserPoolAuthenticationProvider({
		// 				userPool: userPool3,
		// 				userPoolClient: client1
		// 			}),
		// 		],
		// 	},
		// 	authenticatedRole: authenticatedRole,
		// 	unauthenticatedRole: unauthenticatedRole,
		// });

		const provider = new cognito.UserPoolIdentityProviderGoogle(this, 'GoogleProvider', {
		 	clientId: '42501478123-8glnlo0r70l96kvni73c1a8j17q6eubk.apps.googleusercontent.com',
		 	clientSecret: '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',
		 	userPool: userPool3,
			 attributeMapping: {
				email: cognito.ProviderAttribute.GOOGLE_EMAIL,
			 },
			 scopes: ['email']
		 });

		// new cdk.CfnOutput(this, 'cognito2-userPool2-unauthRole', {
    //   value: cognitoIdP.unauthenticatedRole.roleArn,
    //   description: 'Ident pool unauthenticated role ARN',
    //   exportName: 'cognito2-userPool2-unauthRole',
    // });




  }
}
