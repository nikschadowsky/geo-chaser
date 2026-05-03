import {readBody, createError, setCookie} from 'h3'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const {username, password} = body

    if (!username || !password) {
        throw createError({statusCode: 400, message: 'INVALID_REQUEST'})
    }

    const user = await prisma.user.findUnique({where: {username}})
    if (!user) {
        throw createError({statusCode: 401, message: 'INVALID_CREDENTIALS'})
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
        throw createError({statusCode: 401, message: 'INVALID_CREDENTIALS'})
    }

    const secret = process.env.JWT_SECRET!

    const token = jwt.sign({userId: user.id, username: user.username}, secret, {
        expiresIn: '7d'
    })

    setCookie(event, 'auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 28,
        path: '/',
        domain: process.env.DOMAIN
    })

    return {
        success: true,
        message: 'Login successful!',
        user: {id: user.id, username: user.username}
    }
})