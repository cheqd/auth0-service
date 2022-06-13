export enum ValidationModes {
    Headers = 0,
    Body = 1,
    Auth0 = 2,
}

export enum Providers {
    _ = -1,
    Google = 0,
    Facebook = 1,
    Twitter = 2,
}

export enum ProvidersLiterals {
    _ = 'not_set',
    Google = 'google',
    Facebook = 'facebook',
    Twitter = 'twitter',
}

export type ParsedRequestPayload = {
    access_token: string,
    _provider?: string
}

export type AuthenticatedResponse = {
    authenticated: boolean
    user: Auth0User | string | null,
    provider: ProvidersLiterals
}

export type Auth0Response = Auth0User | string

export type Auth0User = {
    sub?: string
    given_name?: string
    family_name?: string
    nickname?: string
    name?: string
    picture?: string
    updated_at?: string
    locale?: string
    email?: string
    email_verified?: string

    handle?: string
}

export type GenericUser = GoogleUser | FacebookUser | TwitterUserLookup

export type GoogleUser = {
    [x:string]: any
}

export type FacebookUser = {
    [x:string]: any
}

export type TwitterUser = {
    id: string,
    name: string,
    username: string,
}

export type TwitterUserLookup = {
    data?: TwitterUser
}