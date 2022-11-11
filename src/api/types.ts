export enum ValidationModes {
	Headers = 0,
	Body = 1,
	Auth0 = 2,
}

export enum Providers {
	_ = -1,
	Twitter = 0,
	Discord = 1
}

export enum ProvidersLiterals {
	_ = 'not_set',
	Twitter = 'twitter',
	Discord = 'discord'
}

export type ParsedRequestPayload = {
	access_token: string,
	_provider?: string
}

export type AuthenticatedResponse = {
	authenticated: boolean
	user: Auth0User | string | null,
	provider: ProvidersLiterals
	error?: Error
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

export type GenericUser = TwitterUserLookup

export type TwitterUser = {
	id: string,
	name: string,
	username: string,
}

export type TwitterUserLookup = {
	data?: TwitterUser
}
