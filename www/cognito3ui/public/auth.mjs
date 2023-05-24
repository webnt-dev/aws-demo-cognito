import { AWSAuth } from "./awsOAuth.mjs";

const authRootAddress = 'https://asw-demo-cogniot3.auth.eu-central-1.amazoncognito.com';
const clientId = '1t87c72io00p0c3bjb892n8ni3';
const redirectUri = 'http://localhost:8000/app.html';
const logoutUri = 'http://localhost:8000/';

export const awsAuth = new AWSAuth({
	authRootAddress,
	clientId,
	redirectUri,
	logoutUri
});


