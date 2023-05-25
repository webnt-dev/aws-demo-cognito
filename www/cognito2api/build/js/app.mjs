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
        const logDiv = document.querySelector('#log');
        logDiv.textContent = '';
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
        logDiv.textContent += 'UNAUTH USER --------------------------------------------\n';
        logDiv.textContent += 'UNAUTH USER credentials --------------------------------------------\n';
        // Get credentials for unauth user
        const credentials = await fromCognitoIdentityPool({
            identityPoolId: 'eu-central-1:a1793a14-07f0-441e-9ae3-0398f05d9232',
            clientConfig: {
                region: 'eu-central-1'
            }
        })();
        logDiv.textContent += JSON.stringify(credentials, null, 2);
        logDiv.textContent += '\nUNAUTH USER graphql --------------------------------------------\n';
        // create request signature service based on IAM
        const sign = new SignatureV4({
            credentials,
            region: 'eu-central-1',
            service: 'appsync',
            sha256: Sha256
        });
        const apiUrl = new URL('https://3mrsdwetsraxpdofigdt7xs4bm.appsync-api.eu-central-1.amazonaws.com/graphql');
        // create HTTP request signature
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
        // POST GraphQL request signed by signature
        const result = await fetch(apiUrl.toString(), {
            method: 'POST',
            headers: {
                ...signature.headers
            },
            body: JSON.stringify({
                query
            }),
        });
        logDiv.textContent += JSON.stringify(await result.json(), null, 2);
        // Access bucket with unauth credential
        // unauth-bucket shoud be read only for unauth user
        const s3u = new S3({
            credentials,
            region: 'eu-central-1',
        });
        logDiv.textContent += '\nUNAUTH USER S3 unauth bucket LIST --------------------------------------------\n';
        // try listing objects, should be OK
        const res1 = await s3u.listObjects({
            Bucket: 'unauth-bucket',
        });
        logDiv.textContent += JSON.stringify(res1, null, 2);
        logDiv.textContent += '\nUNAUTH USER S3 unauth bucket PUT --------------------------------------------\n';
        try {
            // try putting object, should fail
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
        logDiv.textContent += '\nAUTH USER --------------------------------------------\n';
        const userPoolId = 'eu-central-1_akJtEQL0U';
        const clientId = '268l1hsdstn6q8k7gu9k70g4m3';
        const userName = document.querySelector('[name="login"]').value;
        const password = document.querySelector('[name="password"]').value;
        const client = new CognitoIdentityProvider({ region: 'eu-central-1' });
        // login with PLAIN PASSWORD
        try {
            const res3 = await client.initiateAuth({
                AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
                ClientId: clientId,
                AuthParameters: {
                    USERNAME: userName,
                    PASSWORD: password,
                }
            });
            logDiv.textContent += '\nAUTH USER login --------------------------------------------\n';
            logDiv.textContent += JSON.stringify(res3, null, 2);
            logDiv.textContent += '\nAUTH USER user --------------------------------------------\n';
            // get user info
            const user = await client.getUser({
                AccessToken: res3.AuthenticationResult.AccessToken
            });
            logDiv.textContent += JSON.stringify(user, null, 2);
            // get credentials for logged  in user
            const credentials2 = await fromCognitoIdentityPool({
                identityPoolId: 'eu-central-1:a1793a14-07f0-441e-9ae3-0398f05d9232',
                clientConfig: {
                    region: 'eu-central-1'
                },
                logins: {
                    [`cognito-idp.eu-central-1.amazonaws.com/${userPoolId}`]: res3.AuthenticationResult.IdToken,
                },
            })();
            logDiv.textContent += '\nAUTH USER credentials --------------------------------------------\n';
            logDiv.textContent += JSON.stringify(credentials2, null, 2);
            // Access bucket with auth credential
            // unauth-bucket shoud be read/write for auth users
            const s3a = new S3({
                credentials: credentials2,
                region: 'eu-central-1',
            });
            // list objects, should be OK for all auth users
            const res2 = await s3a.listObjects({
                Bucket: 'unauth-bucket',
            });
            logDiv.textContent += '\nAUTH USER S3 unauth bucket LIST --------------------------------------------\n';
            logDiv.textContent += JSON.stringify(res2, null, 2);
            // PUT object, should be OK for all auth users
            const res5 = await s3a.putObject({
                Bucket: 'unauth-bucket',
                Key: `unauthTest-${(new Date()).getTime()}.txt`,
                Body: 'This is unauth test',
            });
            logDiv.textContent += '\nAUTH USER S3 unauth bucket PUT --------------------------------------------\n';
            logDiv.textContent += JSON.stringify(res5, null, 2);
            // list objects, should be OK for all auth users
            const res6 = await s3a.listObjects({
                Bucket: 'unauth-bucket',
            });
            logDiv.textContent += '\nAUTH USER S3 unauth bucket LIST --------------------------------------------\n';
            logDiv.textContent += JSON.stringify(res6, null, 2);
            // Access bucket with auth credential
            // my-own-secret-bucket shoud be read/write only for admin-group
            const s3m1 = new S3({
                credentials: credentials2,
                region: 'eu-central-1',
            });
            // list objects, should be OK only for admin-group users
            logDiv.textContent += '\nAUTH USER S3 secret bucket LIST --------------------------------------------\n';
            try {
                const res7 = await s3m1.listObjects({
                    Bucket: 'my-own-secret-bucket',
                });
                logDiv.textContent += JSON.stringify(res7, null, 2);
            }
            catch (e) {
                logDiv.textContent += JSON.stringify(e, null, 2);
            }
        }
        catch (e) {
            logDiv.textContent += JSON.stringify(e, null, 2);
        }
    });
});
