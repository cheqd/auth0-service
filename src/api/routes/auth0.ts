import { Router } from 'itty-router'
import { Auth } from '../controllers/auth0'
import { Providers, ValidationModes } from '../types'

const router = Router({ base: '/api/auth0' })

router.all(
    '/',
    () => new Response( JSON.stringify( { ping: 'pong' } ) )
)

router.all(
    '/login',
    async (request: Request) => {
        await (new Auth()).login()
    }
)

router.all(
    '/callback',
    async (request: Request) => {
        return await (new Auth()).callback()
    }
)

router.all(
    '/validate',
    async (request: Request) => {
        return await (new Auth()).validate(request, ValidationModes.Body, Providers._)
    }
)

export default router

