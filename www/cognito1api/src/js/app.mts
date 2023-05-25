import { CognitoIdentityProvider, AuthFlowType, ChallengeNameType } from '@aws-sdk/client-cognito-identity-provider';
// import { fromCognitoIdentity, /* fromCognitoIdentityPool */ } from '@aws-sdk/credential-providers';
import Srp from 'aws-cognito-srp-client';

document.addEventListener('DOMContentLoaded', () => {

	document.querySelector('form')!.addEventListener('submit', async (event) => {

		event.preventDefault();

		const userPoolId = 'eu-central-1_4u2gXoFrj';
		const clientId = '6p02voe9059mb4asr4h0nsu0im';

		const userName = (document.querySelector('[name="login"]') as HTMLInputElement).value;
		const password = (document.querySelector('[name="password"]') as HTMLInputElement).value;
		const logDiv = document.querySelector('#log')!;
		logDiv.textContent = '';

		function log(prefix: string, text: any) {
			if (typeof text === 'object') {
				text = JSON.stringify(text, null, 2);
			}
			logDiv.textContent += `${(new Date()).toISOString()} - ${prefix}: ${text}\n`;
		}

		function plainLog(text: any) {
			log('PLAIN', text);
		}

		function srpLog(text: any) {
			log('SRP', text);
		}

		const client = new CognitoIdentityProvider({ region: 'eu-central-1' });

		// PLAIN PASSWORD transport
		try {
			plainLog('start initiateAuth');
			// login is done using 1 call
			const result = await client.initiateAuth({
				AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
				ClientId: clientId,
				AuthParameters: {
					USERNAME: userName,
					PASSWORD: password,
				}
			});
			plainLog(result);
			if (result.$metadata.httpStatusCode === 200) { // if success
				plainLog('get user');
				let user = await client.getUser({
					AccessToken: result.AuthenticationResult!.AccessToken
				});
				plainLog(user);

				plainLog('revoke token');

				// IF YOU HAVE IDENTITY
				// // const identityClient = new CognitoIdentityProvider({
				// // 	credentials: fromCognitoIdentityPool({
				// // 		clientConfig: {
				// // 			region: 'eu-central-1',
				// // 		}
				// // 	})
				// // });

				// await identityClient.revokeToken({
				// 	ClientId: clientId,
				// 	Token: result.AuthenticationResult!.RefreshToken!,
				// });


				// revoking token
				await revokeToken(result.AuthenticationResult!.RefreshToken!, clientId);

				plainLog('get user 2');
				// will fail, token has been revoked
				user = await client.getUser({
					AccessToken: result.AuthenticationResult!.AccessToken
				});
				plainLog(user);
			}

		} catch (e) {
			if (e instanceof Error) {
				plainLog(`${e.name}: ${e.message}`); // eslint-disable-line
			} else {
				plainLog(e); // eslint-disable-line
			}
		}

		// SRP
		try {
			// @ts-ignore
			const srp = new Srp(userPoolId);
			const srpA = srp.getA();

			srpLog('start initiateAuth');
			// we must implement SRP protocol
			// get challenge token....
			const result2 = await client.initiateAuth({
				AuthFlow: AuthFlowType.USER_SRP_AUTH,
				ClientId: clientId,
				AuthParameters: {
					USERNAME: userName,
					SRP_A: srpA,
				}
			});
			srpLog(result2);

			// ...compute SRP response
			const { signature, timestamp } = srp.getSignature(
				result2.ChallengeParameters!.USER_ID_FOR_SRP,
				result2.ChallengeParameters!.SRP_B,
				result2.ChallengeParameters!.SALT,
				result2.ChallengeParameters!.SECRET_BLOCK,
				password
			);

			srpLog('start respondToAuthChallenge');
			// ...send SRP response
			const result3 = await client.respondToAuthChallenge({
				ChallengeName: ChallengeNameType.PASSWORD_VERIFIER,
				ClientId: clientId,
				ChallengeResponses: {
					PASSWORD_CLAIM_SIGNATURE: signature,
					PASSWORD_CLAIM_SECRET_BLOCK: result2.ChallengeParameters!.SECRET_BLOCK,
					TIMESTAMP: timestamp,
					USERNAME: userName,
				}
			});
			srpLog(result3);

			srpLog('get user');
			const user2 = await client.getUser({
				AccessToken: result3.AuthenticationResult!.AccessToken
			});
			srpLog(user2);

			srpLog('revoke token');
			await revokeToken(result3.AuthenticationResult!.RefreshToken!, clientId);

			srpLog('get user 2');
			// will faile, token has been revoked
			const user = await client.getUser({
				AccessToken: result3.AuthenticationResult!.AccessToken
			});
			srpLog(user);
		} catch (e) {
			if (e instanceof Error) {
				srpLog(`${e.name}: ${e.message}`); // eslint-disable-line
			} else {
				srpLog(e); // eslint-disable-line
			}
		}


	});

});

// Function to revoke token using oAuth
async function revokeToken(refreshToken: string, clientId: string) {
	const res = await fetch('https://asw-demo-cogniot1.auth.eu-central-1.amazoncognito.com/oauth2/revoke', {
		method: 'POST',
		headers: new Headers({ 'content-type': 'application/x-www-form-urlencoded' }),
		body: (new URLSearchParams({
			token: refreshToken,
			client_id: clientId,
		})).toString()
	});

	if (!res.ok) {
		throw new Error(await res.json());
	}
}
