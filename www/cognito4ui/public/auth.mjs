import { AWSAuth } from "./awsOAuth.mjs";

const authRootAddress = 'https://asw-demo-cogniot4.auth.eu-central-1.amazoncognito.com';
const clientId = '1096hg71tdj3gdk8ph5mfcr97v';
const redirectUri = 'http://localhost:8000/app.html';
const logoutUri = 'http://localhost:8000/';

export const awsAuth = new AWSAuth({
	authRootAddress,
	clientId,
	redirectUri,
	logoutUri
});


