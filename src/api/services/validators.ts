import { HEADERS, TWITTER_BEARER_TOKEN, TWITTER_FETCH_USER_URI } from "../constants"
import { Auth0User, GenericUser, ParsedRequestPayload, TwitterUserLookup } from "../types"

export const access_token_from_headers = (headers: Headers): string => {
    const access_token_bearer = headers.get('Authorization')

    if( !access_token_bearer ) throw new Error('no_access_token_provided')

    return access_token_bearer.replace('Bearer ', '').trim()
}

export const parsed_payload_from_body = (body: Record<string, any> | undefined): ParsedRequestPayload | undefined | null => {
    return { access_token: body?.claim ?? '', _provider: body?.provider ?? '' }
}

export const fetch_user_info_from_id = async <T>(user: Auth0User | null): Promise<T | string | undefined> => {
    if( !user ) throw new Error('user_unauthenticated')

    const [provider, user_id] = user!.sub!.split('|')

    switch (provider) {
        case 'twitter':
            return await fetch(
                `${TWITTER_FETCH_USER_URI}/${user_id}`,
                {
                    headers: { ...HEADERS.json, Authorization: `Bearer ${TWITTER_BEARER_TOKEN}` }
                }
            ).then(
                res => res.json() as TwitterUserLookup
            ).then(
                res => res?.data?.username
            )
        case undefined:
            return user.nickname
    }

    return user.nickname
}

// TODO: Embed in-app JWT parsing & verification
export const is_jwt = () => {
    return
}