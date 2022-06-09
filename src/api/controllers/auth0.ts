import { Auth0Client, Auth0ClientOptions, User, RedirectLoginResult } from '@auth0/auth0-spa-js'
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN, AUTH0_REDIRECT_URI, AUTH0_TWITTER_SAMPLE_URI } from '../constants'
import { kv_cache } from '../services/cache'
import { access_token_from_headers } from '../services/validators'
import { AuthenticatedResponse, Providers, TwitterResponse, ValidationModes } from '../types'

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
        if( mode == ValidationModes.Headers && !request?.headers && !request?.headers.get( 'Authorization' ) ) 
            return new Response(
                JSON.stringify({error: 'Access token is not set.'}),
                {
                    status: 400
                }
            )

        if( mode == ValidationModes.Headers ) {
            const access_token = access_token_from_headers(request.headers)
            const proxied = await this.proxy(
                provider,
                access_token
            )

            return new Response(
                JSON.stringify({authenticated: proxied.authenticated, user: proxied.user}),
                {
                    status: proxied.authenticated ? 200 : 401
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
            case Providers.Twitter:
                return await fetch(
                    AUTH0_TWITTER_SAMPLE_URI,
                    {
                        headers: { Authorization: `Bearer ${access_token}` }
                    }
                ).then(
                    (res => res.json() as Promise<TwitterResponse>)
                ).then(res => ({ authenticated: res?.status !== 401, user: res?.status !== 401 ? res : null }))
            case Providers.Google:
                return { authenticated: false, user: null }
        }
    }

    logout = async (): Promise<void> => {
        return await this.auth0.logout()
    }
}
