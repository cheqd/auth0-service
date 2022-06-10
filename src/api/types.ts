export enum ValidationModes {
    Headers = 0,
    Body = 1,
    Auth0 = 2,
}

export enum Providers {
    Google = 0,
    Facebook = 1,
    Twitter = 2,
}

export type AuthenticatedResponse = {
    authenticated: boolean
    user: Auth0User | string | null
}

export type Auth0Response = Auth0User | string

export type Auth0User = {
    sub: string
    given_name: string
    family_name: string
    nickname: string
    name: string
    picture: string
    updated_at: string
    locale?: string
    email?: string
    email_verified?: string
}