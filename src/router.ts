import { Router } from 'itty-router'
import auth0_router from './api/routes/auth0'
import error_handler from './error_handler'


const router = Router()

router
    .all( '/api/auth0/*', auth0_router.handle)

router.all('*', error_handler)

export default router