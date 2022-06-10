import { Auth0Client, Auth0ClientOptions, User, RedirectLoginResult } from '@auth0/auth0-spa-js'
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN, AUTH0_REDIRECT_URI, AUTH0_URI } from '../constants'
import { kv_cache } from '../services/cache'
import { access_token_from_body, access_token_from_headers } from '../services/validators'
import { AuthenticatedResponse, Providers, Auth0Response, ValidationModes, ProvidersLiterals } from '../types'

export class Auth
{
    auth0: Auth0Client
    auth0_client_options: Auth0ClientOptions

    constructor(auth0_client_options?: Auth0ClientOptions) {
        if( !auth0_client_options ) 
            this.auth0_client_options = { domain: AUTH0_DOMAIN, client_id: AUTH0_CLIENT_ID, redirect_uri: AUTH0_REDIRECT_URI }

        this.auth0 = new Auth0Client(
            this.auth0_client_options = {
                ...auth0_client_options,
                cache: kv_cache
            } as Auth0ClientOptions
        )
    }

    guard = (): void => {
        if( !this.auth0 ) throw new Error('needs_init')
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

    validate = async (request: Request, mode: ValidationModes, provider: Providers): Promise<Response> => {
        // Validation Mode: Request Body
        if( mode === ValidationModes.Body && !request?.body )
            return new Response(
                JSON.stringify({error: 'Access token(s) are not set.'}),
                {
                    status: 400
                }
            )

        if( mode === ValidationModes.Body) {
            const { access_token, _provider } = access_token_from_body(await request.json())

            switch (_provider) {
                case 'google':
                    provider = Providers.Google
                    break
                case 'facebook':
                    provider = Providers.Facebook
                    break
                case 'twiiter':
                    provider = Providers.Twitter
                    break
                case undefined:
                    throw new Error('invalid_provider: Unsupported provider or provider not set.')
            }

            const { authenticated, user  } = await this.proxy(
                provider,
                access_token
            )

            return new Response(
                JSON.stringify({authenticated: authenticated, user: user}),
                {
                    status: authenticated ? 200 : 401
                }
            )
        }

        // Validation Mode: Request Headers
        if( mode == ValidationModes.Headers && !request?.headers && !request?.headers.get( 'Authorization' ) ) 
            return new Response(
                JSON.stringify({error: 'Access token is not set.'}),
                {
                    status: 400
                }
            )

        if( mode === ValidationModes.Headers ) {
            const access_token = access_token_from_headers(request.headers)
            const { authenticated, user} = await this.proxy(
                provider,
                access_token
            )

            return new Response(
                JSON.stringify({authenticated: authenticated, user: user}),
                {
                    status: authenticated ? 200 : 401
                }
            )
        }

        try {
            const access_token = await this.auth0.getTokenSilently()
        } catch(error: any) {
            if(error?.error !== 'login_required') throw error
        }

        return new Response(
            JSON.stringify({error: 'Unauthenticated. Please, login first to use the service'}),
            {
                status: 401
            }
        )
    }

    proxy = async (provider: Providers, access_token: string): Promise<AuthenticatedResponse> => {
        switch (provider) {
            case Providers.Google:
                return await fetch(
                    AUTH0_URI,
                    {
                        headers: { Authorization: `Bearer ${access_token}` }
                    }
                ).then(
                    (res => res.json() as Promise<Auth0Response>)
                ).then(res => ({ authenticated: typeof res === 'object', user: typeof res === 'object' ? res : null, provider: ProvidersLiterals.Google }))
            case Providers.Facebook:
                return await fetch(
                    AUTH0_URI,
                    {
                        headers: { Authorization: `Bearer ${access_token}` }
                    }
                ).then(
                    (res => res.json() as Promise<Auth0Response>)
                ).then(res => ({ authenticated: typeof res === 'object', user: typeof res === 'object' ? res : null, provider: ProvidersLiterals.Facebook }))
            case Providers.Twitter:
                return await fetch(
                    AUTH0_URI,
                    {
                        headers: { Authorization: `Bearer ${access_token}` }
                    }
                ).then(
                    (res => res.json() as Promise<Auth0Response>)
                ).then(res => ({ authenticated: typeof res === 'object', user: typeof res === 'object' ? res : null, provider: ProvidersLiterals.Twitter }))
            case undefined:
                return { authenticated: false, user: null, provider: ProvidersLiterals._ }
        }
    }

    logout = async (): Promise<void> => {
        return await this.auth0.logout()
    }
}
