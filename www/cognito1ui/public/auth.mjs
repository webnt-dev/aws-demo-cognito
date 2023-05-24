import { AWSAuth } from "./awsOAuth.mjs";

const authRootAddress = 'https://asw-demo-cogniot1.auth.eu-central-1.amazoncognito.com';
const clientId = '6p02voe9059mb4asr4h0nsu0im';
const redirectUri = 'http://localhost:8000/app.html';
const logoutUri = 'http://localhost:8000/';

export const awsAuth = new AWSAuth({
	authRootAddress,
	clientId,
	redirectUri,
	logoutUri
});


