export enum ValidationModes {
    Headers = 0,
    Auth0 = 1,
}

export enum Providers {
    Google = 0,
    Twitter = 1,
}

export type AuthenticatedResponse = {
    authenticated: boolean
    user: Record<string, any> | null
}

export type TwitterResponse = {
    status: number
}