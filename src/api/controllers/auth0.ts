import {
	Auth0Client,
	Auth0ClientOptions,
	User
} from '@auth0/auth0-spa-js'
import {
	parsed_payload_from_body,
	access_token_from_headers
} from '../services/validators'
import {
	AuthenticatedResponse,
	ValidationModes,
	ProvidersLiterals,
	ParsedRequestPayload,
} from '../types'
import type { Auth0User } from '../types';

export class Auth {
	auth0: Auth0Client
	auth0_client_options: Auth0ClientOptions

	constructor(auth0_client_options?: Auth0ClientOptions) {
		if (!auth0_client_options)
			this.auth0_client_options = { domain: AUTH0_DOMAIN, client_id: AUTH0_CLIENT_ID, redirect_uri: AUTH0_REDIRECT_URI }

		this.auth0 = new Auth0Client(
			this.auth0_client_options = {
				...auth0_client_options
			} as Auth0ClientOptions
		)
	}

	guard = (): void => {
		if (!this.auth0) throw new Error('needs_init')
	}

	login = async (): Promise<void> => {
		this.guard()

		return await this.auth0.loginWithRedirect()
	}

	callback = async (): Promise<User | undefined> => {
		this.guard()

		await this.auth0.handleRedirectCallback()

		return await this.auth0.getUser()
	}

	validate = async (request: Request, mode: ValidationModes, provider: ProvidersLiterals): Promise<Response> => {
		// Validation Mode: Request Body
		if (mode === ValidationModes.Body && !request?.body)
			return new Response(
				JSON.stringify({ error: 'Access token(s) are not set.' }),
				{ status: 400 }
			)

		if (mode === ValidationModes.Body) {
			const { access_token, _provider } = parsed_payload_from_body(await request.json()) as ParsedRequestPayload

			switch (_provider) {
				case 'twitter':
					provider = ProvidersLiterals.Twitter
					break
				case 'discord':
					provider = ProvidersLiterals.Discord
					break
				case 'github':
					provider = ProvidersLiterals.GitHub
					break
				case undefined:
					throw new Error('invalid_provider: Unsupported provider or provider not set.')
			}

			const { authenticated, user } = await this.proxy(
				provider,
				access_token
			)

			return new Response(
				JSON.stringify({ authenticated, user }),
				{ status: authenticated ? 200 : 401 }
			)
		}

		// Validation Mode: Request Headers
		if (mode == ValidationModes.Headers && !request?.headers && !request?.headers.get('Authorization'))
			return new Response(
				JSON.stringify({ error: 'Access token is not set.' }),
				{ status: 400 }
			)

		if (mode === ValidationModes.Headers) {
			const access_token = access_token_from_headers(request.headers)
			const { authenticated, user } = await this.proxy(
				provider,
				access_token
			)

			return new Response(
				JSON.stringify({ authenticated: authenticated, user: user }),
				{ status: authenticated ? 200 : 401 }
			)
		}

		try {
			const access_token = await this.auth0.getTokenSilently()
		} catch (error: any) {
			if (error?.error !== 'login_required') throw error
		}

		return new Response(
			JSON.stringify({ error: 'Unauthenticated. Please, login first to use the service' }),
			{ status: 401 }
		)
	}

	proxy = async (provider: ProvidersLiterals, accessToken: string): Promise<AuthenticatedResponse> => {
		return this.getUserFromAccessToken(accessToken).then(async resp => {
			if (this.isAuthUser(resp)) {
				if (this.isValidProvider(provider, resp.sub!)) {
					return {
						authenticated: true,
						user: resp,
						provider: provider,
					} as AuthenticatedResponse
				}

				return this.buildErrorResponse(provider, new Error('provider is not supported by the service'))
			}

			return this.buildErrorResponse(provider, resp)
		}).catch((err: any) => {
			return this.buildErrorResponse(provider, err)
		})
	}

	getUserFromAccessToken = async (accessToken: string): Promise<Auth0User | Error> => {
		try {
			const resp = await fetch(
				AUTH0_URI,
				{ headers: { Authorization: `Bearer ${accessToken}` } }
			)
			return resp.json<Auth0User>()
		} catch (err) {
			return err as Error
		}
	}

	isAuthUser = (data: any): data is Auth0User => {
		// if sub is present, it's auth0 User type
		return data.sub !== undefined
	}

	logout = async (): Promise<void> => {
		return await this.auth0.logout()
	}

	buildErrorResponse = (provider: ProvidersLiterals, err?: Error): AuthenticatedResponse => {
		return { authenticated: false, user: null, provider: provider, error: err }
	}

	// validateProvider compares the name of the provider with the "sub" (subject) in the returned response from Auth0
	isValidProvider = (provider: ProvidersLiterals, sub: string): boolean => {
		const parts = sub.split('|')
		switch (provider) {
			case ProvidersLiterals.Twitter:
				// in case of Twitter, the format for "sub" is twitter|userid
				if (parts && parts.length !== 2) {
					return false
				}

				return parts[0] === 'twitter';
			case ProvidersLiterals.Discord:
				// in case of Discord, the format for "sub" is oauth2|discord|userid
				if (parts && parts.length !== 3) {
					return false
				}

				return parts[1] === 'discord'
			case ProvidersLiterals.GitHub:
				// in case of GitHub, the format for "sub" is github|username
				if (parts && parts.length !== 2) {
					return false
				}

				return parts[0] === 'github';
			default:
				return false
		}
	}
}
