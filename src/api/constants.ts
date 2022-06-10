export const HEADERS = {
    json: { 'Content-Type': 'application/json' },
    text: { 'Content-Type': 'text/plain' },
}

export const CORS_HEADERS = {
    [Symbol.iterator]: function*(): Record<any, any>{
        yield { 'Access-Control-Allow-Origin': '*' }
        yield { 'Access-Control-Allow-Methods': 'GET,OPTIONS' }
        yield { 'Access-Control-Max-Age': '86400' }
    }
}

export const AUTH0_DOMAIN = _AUTH0_DOMAIN

export const AUTH0_CLIENT_ID = _AUTH0_CLIENT_ID

export const AUTH0_REDIRECT_URI = _AUTH0_REDIRECT_URI

export const AUTH0_URI = _AUTH0_URI