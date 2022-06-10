
export const access_token_from_headers = (headers: Headers): string => {
    const access_token_bearer = headers.get('Authorization')

    if( !access_token_bearer ) throw new Error('no_access_token_provided')

    return access_token_bearer.replace('Bearer ', '').trim()
}

export const access_token_from_body = (body: Record<string, any> | undefined): string => {
    return body?.claim ?? ''
}

export const is_jwt = () => {
    return
}