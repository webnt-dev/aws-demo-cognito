import { AWSAuth } from "./awsOAuth.mjs";

const authRootAddress = 'https://asw-demo-cogniot2.auth.eu-central-1.amazoncognito.com';
const clientId = '268l1hsdstn6q8k7gu9k70g4m3';
const redirectUri = 'http://localhost:8000/app.html';
const logoutUri = 'http://localhost:8000/';

export const awsAuth = new AWSAuth({
	authRootAddress,
	clientId,
	redirectUri,
	logoutUri
});


