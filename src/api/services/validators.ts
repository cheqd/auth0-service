
export const access_token_from_headers = (headers: Headers) => {
    const access_token_bearer = headers.get('Authorization')

    if( !access_token_bearer ) throw new Error('no_access_token_provided')

    return access_token_bearer.replace('Bearer ', '').trim()
}

export const is_jwt = () => {
    return
}