import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as idp from '@aws-cdk/aws-cognito-identitypool-alpha';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class Cognito2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Cognito user pool
    const userPool2 = new cognito.UserPool(this, 'userPool2', {
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY, // Email configuration used to send email
      autoVerify: { email: true, phone: false },
      email: cognito.UserPoolEmail.withSES({
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
      userPoolName: 'cognito2-userpool',
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
		const client1 = userPool2.addClient('userPool2-client1', {
			userPoolClientName: 'userPool2-client1',

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

			supportedIdentityProviders: [ // defining identity providers
				cognito.UserPoolClientIdentityProvider.COGNITO,
			],
		});

		// Hosted UI display definition
		const cfnUserPoolUICustomizationAttachment = new cognito.CfnUserPoolUICustomizationAttachment(this, 'MyCfnUserPoolUICustomizationAttachment', {
			clientId: client1.userPoolClientId,
			userPoolId: userPool2.userPoolId,

			// the properties below are optional
			// content can of course be defined in separate file and loaded here using node:fs module
			css: `
				.background-customizable {
					background-color: #cef5ff;
				}
				.banner-customizable {
					background: linear-gradient(0deg, rgba(206,245,255,1) 0%, rgba(0,212,255,1) 100%);
					background-image: url(data:image/png;base64,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);
					background-repeat: no-repeat;
					background-position: 5px;
					height: 100px;
				}
				.inputField-customizable {
					border: none;
					background-color: white;
					outline: none;
					box-shadow: none;
					border-bottom: 1px solid silver;
					border-radius: 0px;
				}
			`,
		});

		// Domain for user pool, since we want to use OAuth flow, we need domain to authenticate agains
		userPool2.addDomain('userPoolDomain1', {
			cognitoDomain: {
				domainPrefix: 'asw-demo-cogniot2', // changed to asw, cogniot, domain cannot contain words 'AWS' 'cognito'
			},
		});

		// well... you can set up tags
    cdk.Tags.of(userPool2).add('cost-allocation', 'test');

		// outputtion of user pool ARN, it is used in ./appsync2.ts for import
		// we want to use this user pool to authorize requests against AppSync
		new cdk.CfnOutput(this, 'cognito2-userPool2', {
      value: userPool2.userPoolArn,
      description: 'User pool ARN',
      exportName: 'cognito2-userPool2',
    });


		// Definitions of built-in user groups in user pool
		new cognito.CfnUserPoolGroup(this, 'userPool2AdminGroup', {
			userPoolId: userPool2.userPoolId,
			description: 'Admin group',
			groupName: 'admin-group',
			precedence: 0,
		});
		new cognito.CfnUserPoolGroup(this, 'userPool2ReaderGroup', {
			userPoolId: userPool2.userPoolId,
			description: 'Reader group',
			groupName: 'reader-group',
			precedence: 1,
		});
		new cognito.CfnUserPoolGroup(this, 'userPool2WriterGroup', {
			userPoolId: userPool2.userPoolId,
			description: 'Writer group',
			groupName: 'writer-group',
			precedence: 1,
		});


		// Role for entity in identity pool
		// will be used for authenticated user
		const authenticatedRole = new iam.Role(this, 'authRole', {
			assumedBy: new iam.WebIdentityPrincipal('cognito-identity.amazonaws.com'),
		});

		// Role for entity in identity pool
		// will be used for unauthenticated user
		const unauthenticatedRole = new iam.Role(this, 'unauthRole', {
			assumedBy: new iam.WebIdentityPrincipal('cognito-identity.amazonaws.com'),
		});

		// Role for entity in identity pool
		// will be used for users in 'admin-group' group
		const bucketForAdminRole = new iam.Role(this, 'bucketForAdminRole', {
			assumedBy: new iam.WebIdentityPrincipal('cognito-identity.amazonaws.com'),
		});


		// Cognito identity pool
		const cognitoIdP = new idp.IdentityPool(this, 'cognito2-cognitoIdP', {
			identityPoolName: 'cognito2-cognitoIdP',
			allowUnauthenticatedIdentities: true, // if you allow for non-authenticated user to use this identity pool
			authenticationProviders: { // assign user pool for authentication
				userPools: [
					new idp.UserPoolAuthenticationProvider({
						userPool: userPool2,
						userPoolClient: client1
					}),
				],
			},
			authenticatedRole: authenticatedRole, // default role for authenticated users
			unauthenticatedRole: unauthenticatedRole,  // role for authenticated users
			roleMappings: [{ // how different roles shoud be assigned to identities
				resolveAmbiguousRoles: true, // esentially use `authenticatedRole` as default, if no other applies
				providerUrl: idp.IdentityPoolProviderUrl.userPool(`cognito-idp.${this.region}.amazonaws.com/${userPool2.userPoolId}:${client1.userPoolClientId}`), // user pool identification
				useToken: false, // whether is role defined in cognito:roles or cognito:preferred_role in idToken/accessToken
				mappingKey: 'cognito', // does not need to be here...
				rules: [ // rules to apply roles
					{
						claim: 'cognito:groups', // what part of token should be used to decide
						matchType: idp.RoleMappingMatchType.CONTAINS, // how it should be evaluated
						claimValue: 'admin-group', // what it should be evaluated against
						mappedRole: bucketForAdminRole, // what role should be assigned
					}
				]
			}]
		});

		// bucket
		// unauth and auth users will eventually be able to access it
		const s3a = new s3.Bucket(this, 'unauthBucket', {
			bucketName: 'unauth-bucket',
			cors: [{
				allowedHeaders: ['*'],
				allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST, s3.HttpMethods.HEAD],
				allowedOrigins: ['http://localhost:8000']
			}],

		});

		// allow access (r or r/w) to all defined roles: auth, unauth and users in 'admin-group'
		// while users in 'admin-group' are authenticated, those are assigned theit own role
		// `bucketForAdminRole`, so general authenticated role and this special must be assigned
		s3a.grantRead(unauthenticatedRole);
		s3a.grantReadWrite(authenticatedRole);
		s3a.grantReadWrite(bucketForAdminRole);

		// bucket
		// only users in 'admin-group' will be able to use it
		const s3a2 = new s3.Bucket(this, 'myOwnSecretBucket', {
			bucketName: 'my-own-secret-bucket',
			cors: [{
				allowedHeaders: ['*'],
				allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST, s3.HttpMethods.HEAD],
				allowedOrigins: ['http://localhost:8000']
			}],

		});
		s3a2.grantReadWrite(bucketForAdminRole);


		// export unauth role so it can be used in ./appsync2.ts to grant access to GraphQL queries
		new cdk.CfnOutput(this, 'cognito2-userPool2-unauthRole', {
      value: cognitoIdP.unauthenticatedRole.roleArn,
      description: 'Ident pool unauthenticated role ARN',
      exportName: 'cognito2-userPool2-unauthRole',
    });




  }
}
