import bcrypt from "bcryptjs";
import type {User} from "~~/prisma/generated/prisma/client";
import jwt from "jsonwebtoken";
import {setCookie} from "h3";

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const {username, password} = body

    if (!username || !password) {
        throw createError({statusCode: 400, message: 'INVALID_REQUEST'})
    }

    const countWithUsername = await prisma.user.count({where: {username}});

    if (countWithUsername > 0) {
        throw createError({statusCode: 400, message: 'USERNAME_ALREADY_EXISTS'});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user: User = await prisma.user.create({
        data: {username, password: hashedPassword}
    })

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
        message: 'Signup successful!',
        user: {id: user.id, username: user.username}
    }
})