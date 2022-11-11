import { HEADERS } from "../constants"
import { Auth0User, GenericUser, ParsedRequestPayload, TwitterUserLookup } from "../types"

export const access_token_from_headers = (headers: Headers): string => {
	const access_token_bearer = headers.get('Authorization')

	if (!access_token_bearer) throw new Error('no_access_token_provided')

	return access_token_bearer.replace('Bearer ', '').trim()
}

export const parsed_payload_from_body = (body: Record<string, any> | undefined): ParsedRequestPayload | undefined | null => {
	return { access_token: body?.claim ?? '', _provider: body?.provider ?? '' }
}
