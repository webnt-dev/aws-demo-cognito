/*
interface RefreshTokenResponse {
	id_token: string;
	access_token: string;
	expires_in: number;
	token_type: 'Bearer';
	error?: string;
}

type Optional<T> = T | null;

interface TokenResponse extends RefreshTokenResponse {
	refresh_token: string;
}

interface UserInfoResponse {
	email: string;
	sub: string;
	username: string;
	email_verified: boolean;
	error?: string;
}
*/

class AWSAuth {
	#authRootAddress = '';
	#clientId = '';
	#redirectUri = '';
	#logoutUri = '';

	/**
	 * authRootAddress: Cognito user pool domain
	 * clientId: Cognito user pool client ID
	 * redirectUri: URL for login success redirection
	 * logoutUri: URL for logout redirection
	 */
	constructor({
		authRootAddress,
		clientId,
		redirectUri,
		logoutUri,
	}) {
		this.#authRootAddress = authRootAddress;
		this.#clientId = clientId;
		this.#redirectUri = redirectUri;
		this.#logoutUri = logoutUri;
	}

	getLogoutUrl() {
		const authLogoutAddress = new URL(`${this.#authRootAddress}`);
		authLogoutAddress.pathname = '/logout';
		authLogoutAddress.searchParams.append('client_id', this.#clientId);
		authLogoutAddress.searchParams.append('logout_uri', this.#logoutUri);
		return authLogoutAddress.toString();
	}

	getLoginUrl() {
		const authLoginAddress = new URL(`${this.#authRootAddress}`);
		authLoginAddress.pathname = '/login';
		authLoginAddress.searchParams.append('client_id', this.#clientId);
		authLoginAddress.searchParams.append('response_type', 'code');
		// authLoginAddress.searchParams.append('scope', 'email+openid+profile');
		authLoginAddress.searchParams.append('redirect_uri', this.#redirectUri);
		return authLoginAddress.toString();
	}

	/**
	 * Function exchanges code for auth token (OAuth code)
	 *
	 * @param {string} code
	 * @returns {Promise<Optional<TokenResponse>>}
	 */
	async validateCode(code) {
		try {
			const bearerResponse = await fetch(`${this.#authRootAddress}/oauth2/token`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					grant_type: 'authorization_code',
					client_id: this.#clientId,
					redirect_uri: `${this.#redirectUri}`,
					code,
				}),
			});

			if (bearerResponse.status !== 200) {
				throw new Error(await bearerResponse.text());
			}

			const bearerResponseJson = await bearerResponse.json();
			if (bearerResponseJson.error) {
				throw new Error(bearerResponseJson.error);
			}
			return bearerResponseJson/* as TokenResponse*/;
		} catch (e) {
			console.log(e);
			return null;
		}
	}

	/**
	 * Function gets current user OAuth info
	 * @param {string} authToken
	 * @returns {Promise<UserInfoResponse>}
	 */
	async userInfo(authToken) {
		const userInfoResponse = await fetch(`${this.#authRootAddress}/oauth2/userInfo`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization: `Bearer ${authToken}`,
			},
		});
		if (userInfoResponse.status !== 200) {
			throw new Error(await userInfoResponse.text());
		}

		return userInfoResponse.json();
	}


	// refresh auth token
	/**
	 * Function refreshes auth token
	 * @param {string} refreshToken
	 * @returns {Promise<RefreshTokenResponse>}
	 */
	async refreshAuthToken(refreshToken) {
		const bearerResponse2 = await fetch(`${this.#authRootAddress}/oauth2/token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				client_id: this.#clientId,
				redirect_uri: this.#redirectUri,
				refresh_token: refreshToken,
			}),
		});
		if (bearerResponse2.status !== 200) {
			throw new Error(await bearerResponse2.text());
		}

		return bearerResponse2.json();
	}


/*
// revokes refresh token
async function revokeToken(refreshToken: string) {
	const res = await fetch(`${oauthAddress}/oauth2/revoke`, {
		method: 'POST',
		headers: new Headers({ 'content-type': 'application/x-www-form-urlencoded' }),
		body: Object.entries({
			token: refreshToken,
			client_id: clientId,
		}).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&'),
	});

	if (!res.ok) {
		throw new Error(await res.json());
	}
}
*/

}

export {
	AWSAuth
};
