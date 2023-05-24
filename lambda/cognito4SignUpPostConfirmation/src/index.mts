/*
{
    "version": "string",
    "triggerSource": "string",
    "region": AWSRegion,
    "userPoolId": "string",
    "userName": "string",
    "callerContext":
        {
            "awsSdkVersion": "string",
            "clientId": "string"
        },
    "request":
        {
            "userAttributes": {
                "string": "string",
                ....
            }
            "clientMetadata": {
            	"string": "string",
            	. . .
            }
        },
    "response": {}
}

{
    "version": "1",
    "region": "eu-central-1",
    "userPoolId": "eu-central-1_i372lkFwS",
    "userName": "52f8c2bd-eb2c-4854-8887-2090085f920a",
    "callerContext": {
        "awsSdkVersion": "aws-sdk-unknown-unknown",
        "clientId": "1096hg71tdj3gdk8ph5mfcr97v"
    },
    "triggerSource": "PostConfirmation_ConfirmSignUp",
    "request": {
        "userAttributes": {
            "sub": "52f8c2bd-eb2c-4854-8887-2090085f920a",
            "email_verified": "true",
            "cognito:user_status": "CONFIRMED",
            "cognito:email_alias": "test1@webnt.dev",
            "email": "test1@webnt.dev"
        }
    },
    "response": {}
}
*/

import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';

export const handler = async (event: any) => {
	console.log(JSON.stringify(event));

	const client = new CognitoIdentityProvider({
		region: 'eu-central-1',
	});
	try {
		const email = event?.request?.userAttributes?.email || '';
		if (email.search(/admin/i) !== -1) {
			const result = await client.adminAddUserToGroup({
				GroupName: 'admin-group',
				Username: event.userName,
				UserPoolId: event.userPoolId,
			});
			console.log(JSON.stringify(result));
		}
	} catch (e) {
		console.error(JSON.stringify(e));
	}


	return event;
};
