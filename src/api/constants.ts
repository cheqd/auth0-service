export const HEADERS = {
    json: { 'Content-Type': 'application/json' },
    text: { 'Content-Type': 'text/plain' },
}

export const CORS_HEADERS: Iterable<[string, string]> = [
	['Access-Control-Allow-Origin', '*'],
	['Access-Control-Allow-Methods', 'GET,OPTIONS'],
	['Access-Control-Max-Age', '86400']
]
