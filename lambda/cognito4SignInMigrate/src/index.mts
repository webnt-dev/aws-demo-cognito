
/*
{
    "version": "1",
    "triggerSource": "UserMigration_Authentication",
    "region": "eu-central-1",
    "userPoolId": "eu-central-1_i372lkFwS",
    "userName": "test30@webnt.dev",
    "callerContext": {
        "awsSdkVersion": "aws-sdk-unknown-unknown",
        "clientId": "1096hg71tdj3gdk8ph5mfcr97v"
    },
    "request": {
        "password": "*******",
        "validationData": null,
        "userAttributes": null
    },
    "response": {
        "userAttributes": null,
        "forceAliasCreation": null,
        "enableSMSMFA": null,
        "finalUserStatus": null,
        "messageAction": null,
        "desiredDeliveryMediums": null
    }
}
 */

interface User {
	password: string;
	email: string;
}

const validUsers: User[] = [
	{ password: 'Test123', email: 'test6@webnt.dev' },
];

const validateUser = async (userName: string, password: string): Promise<User | undefined> => validUsers.find(
	(user) => (user.email === userName) && (user.password === password),
);

// only login, does not implement forgotten password, see
// https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-post-confirmation.html
// for full implementation
export const handler = async (event: any) => {
	console.log(JSON.stringify(event));
	const user = await validateUser(event.userName, event.request.password);
	if (user !== undefined) {
		event.response.userAttributes = {
			email: event.userName,
			email_verified: 'true',
		};
		event.response.finalUserStatus = 'CONFIRMED';
		event.response.messageAction = 'SUPPRESS';
	}
	console.log(JSON.stringify(event));
	return event;
};
