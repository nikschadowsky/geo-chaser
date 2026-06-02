import {defineEventHandler, parseCookies} from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler((event) => {
    const requestUrl = event.node.req.url;
    if (requestUrl?.startsWith('/api/')) {
        const cookies = parseCookies(event)
        const token = cookies.auth_token
        const secret = process.env.JWT_SECRET!

        if (token) {
            try {
                event.context.authPayload = jwt.verify(token, secret)
            } catch (error: any) {
                console.error("JWT Verification failed:", error.name, error.message)
                event.context.authPayload = null
            }
        }
    }
})