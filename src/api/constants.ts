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
