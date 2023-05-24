import { Amplify, Auth } from 'aws-amplify';
/*
        const userPoolId = 'eu-central-1_4u2gXoFrj';
        const clientId = '6p02voe9059mb4asr4h0nsu0im';
*/
Amplify.configure({
    Auth: {
        // // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
        // identityPoolId: 'XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab',
        // REQUIRED - Amazon Cognito Region
        region: 'eu-central-1',
        // // OPTIONAL - Amazon Cognito Federated Identity Pool Region
        // // Required only if it's different from Amazon Cognito Region
        // identityPoolRegion: 'XX-XXXX-X',
        // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: 'eu-central-1_4u2gXoFrj',
        // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolWebClientId: '6p02voe9059mb4asr4h0nsu0im',
        // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
        mandatorySignIn: true,
        // // OPTIONAL - This is used when autoSignIn is enabled for Auth.signUp
        // // 'code' is used for Auth.confirmSignUp, 'link' is used for email link verification
        // signUpVerificationMethod: 'code', // 'code' | 'link'
        // // OPTIONAL - Configuration for cookie storage
        // // Note: if the secure flag is set to true, then the cookie transmission requires a secure protocol
        // cookieStorage: {
        //   // REQUIRED - Cookie domain (only required if cookieStorage is provided)
        //   domain: '.yourdomain.com',
        //   // OPTIONAL - Cookie path
        //   path: '/',
        //   // OPTIONAL - Cookie expiration in days
        //   expires: 365,
        //   // OPTIONAL - See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
        //   sameSite: 'strict' | 'lax',
        //   // OPTIONAL - Cookie secure flag
        //   // Either true or false, indicating if the cookie transmission requires a secure protocol (https).
        //   secure: true,
        // },
        // // OPTIONAL - customized storage object
        // storage: MyStorage,
        // // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
        // authenticationFlowType: 'USER_PASSWORD_AUTH',
        // // OPTIONAL - Manually set key value pairs that can be passed to Cognito Lambda Triggers
        // clientMetadata: {myCustomKey: 'myCustomValue'},
        // // OPTIONAL - Hosted UI configuration
        // oauth: {
        //   domain: 'your_cognito_domain',
        //   scope: [
        //     'phone',
        //     'email',
        //     'profile',
        //     'openid',
        //     'aws.cognito.signin.user.admin',
        //   ],
        //   redirectSignIn: 'http://localhost:3000/',
        //   redirectSignOut: 'http://localhost:3000/',
        //   responseType: 'code', // or 'token', note that REFRESH token will only be generated when the responseType is code
        // },
    },
});
async function signIn(username, password) {
    try {
        return await Auth.signIn(username, password);
    }
    catch (error) {
        return error;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const userName = document.querySelector('[name="login"]').value;
        const password = document.querySelector('[name="password"]').value;
        const logDiv = document.querySelector('#log');
        logDiv.textContent = '';
        function log(text) {
            if (typeof text === 'object') {
                text = JSON.stringify(text, null, 2);
            }
            logDiv.textContent += `${(new Date()).toISOString()} - ${text}\n`;
        }
        log('Sign IN');
        const result = await signIn(userName, password);
        if (result instanceof Error) {
            log(`Error: ${result}`);
        }
        else {
            log(result);
            Auth.signOut();
            log(result);
        }
    });
});
