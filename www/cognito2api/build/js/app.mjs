// import { CognitoIdentityProvider, AuthFlowType, ChallengeNameType  } from '@aws-sdk/client-cognito-identity-provider';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
// import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
// import Srp from 'aws-cognito-srp-client';
// import { fromCognitoIdentityPool, } from '@aws-sdk/credential-provider-cognito-identity';
// import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import { S3 } from '@aws-sdk/client-s3';
import { CognitoIdentityProvider, AuthFlowType } from '@aws-sdk/client-cognito-identity-provider';
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const credentials = await fromCognitoIdentityPool({
            identityPoolId: 'eu-central-1:a1793a14-07f0-441e-9ae3-0398f05d9232',
            clientConfig: {
                region: 'eu-central-1'
            }
        })();
        const query = `#graphql
			query MyQuery {
				getDemo(id: "A") {
					id
					version
				}

				getDemos {
					id
					version
				}
			}
		`;
        const sign = new SignatureV4({
            credentials,
            region: 'eu-central-1',
            service: 'appsync',
            sha256: Sha256
        });
        const apiUrl = new URL('https://3mrsdwetsraxpdofigdt7xs4bm.appsync-api.eu-central-1.amazonaws.com/graphql');
        const signature = await sign.sign({
            method: 'POST',
            hostname: apiUrl.host,
            path: apiUrl.pathname,
            protocol: apiUrl.protocol,
            headers: {
                'Content-Type': 'application/json',
                host: apiUrl.hostname,
            },
            body: JSON.stringify({
                query
            })
        });
        console.log(signature);
        const logDiv = document.querySelector('#log');
        const result = await fetch(apiUrl.toString(), {
            method: 'POST',
            headers: {
                ...signature.headers
            },
            body: JSON.stringify({
                query
            }),
        });
        logDiv.textContent = JSON.stringify(await result.json(), null, 2);
        logDiv.textContent += '--------------------------------------------';
        const s3u = new S3({
            credentials,
            region: 'eu-central-1',
        });
        const res1 = await s3u.listObjects({
            Bucket: 'unauth-bucket',
        });
        logDiv.textContent += JSON.stringify(res1, null, 2);
        try {
            const res2 = await s3u.putObject({
                Bucket: 'unauth-bucket',
                Key: 'unauthTest.txt',
                Body: 'This is unauth test',
            });
            logDiv.textContent += JSON.stringify(res2, null, 2);
        }
        catch (e) {
            logDiv.textContent += JSON.stringify(e, null, 2);
        }
        logDiv.textContent += '--------------------------------------------';
        const userPoolId = 'eu-central-1_akJtEQL0U';
        const clientId = '268l1hsdstn6q8k7gu9k70g4m3';
        const userName = document.querySelector('[name="login"]').value;
        const password = document.querySelector('[name="password"]').value;
        const client = new CognitoIdentityProvider({ region: 'eu-central-1' });
        // PLAIN PASSWORD
        try {
            const res3 = await client.initiateAuth({
                AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
                ClientId: clientId,
                AuthParameters: {
                    USERNAME: userName,
                    PASSWORD: password,
                }
            });
            logDiv.textContent += JSON.stringify(res3, null, 2);
            const user = await client.getUser({
                AccessToken: res3.AuthenticationResult.AccessToken
            });
            logDiv.textContent += JSON.stringify(user, null, 2);
            const credentials2 = await fromCognitoIdentityPool({
                identityPoolId: 'eu-central-1:a1793a14-07f0-441e-9ae3-0398f05d9232',
                clientConfig: {
                    region: 'eu-central-1'
                },
                logins: {
                    [`cognito-idp.eu-central-1.amazonaws.com/${userPoolId}`]: res3.AuthenticationResult.IdToken,
                },
            })();
            logDiv.textContent += JSON.stringify(credentials2, null, 2);
            const s3a = new S3({
                credentials: credentials2,
                region: 'eu-central-1',
            });
            const res2 = await s3a.listObjects({
                Bucket: 'unauth-bucket',
            });
            logDiv.textContent += JSON.stringify(res2, null, 2);
            const res5 = await s3a.putObject({
                Bucket: 'unauth-bucket',
                Key: `unauthTest-${(new Date()).getTime()}.txt`,
                Body: 'This is unauth test',
            });
            logDiv.textContent += JSON.stringify(res5, null, 2);
            const res6 = await s3a.listObjects({
                Bucket: 'unauth-bucket',
            });
            logDiv.textContent += JSON.stringify(res6, null, 2);
            logDiv.textContent += '--------------------------------------------';
            const s3m1 = new S3({
                credentials: credentials2,
                region: 'eu-central-1',
            });
            const res7 = await s3m1.listObjects({
                Bucket: 'my-own-secret-bucket',
            });
            logDiv.textContent += JSON.stringify(res7, null, 2);
        }
        catch (e) {
            logDiv.textContent += JSON.stringify(e, null, 2);
        }
    });
});
