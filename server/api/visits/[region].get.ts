export default defineEventHandler(async (event) => {
    const regionName = event.context.params?.region;
    const authPayload: { username: string, userId: number } = event.context.authPayload;

    if (!regionName) {
        throw createError({statusCode: 400, message: 'INVALID_REQUEST'});
    }

    if (!authPayload) {
        throw createError({statusCode: 401, message: 'UNAUTHORIZED'});
    }

    return prisma.visit.findMany({
        where: {
            userId: authPayload.userId,
            district: {
                region: {
                    name: {
                        equals: regionName,
                        mode: 'insensitive'
                    }
                },
            }
        },
        include: {
            district: true,
            user: {
                select: {
                    id: true,
                    username: true,
                }
            }
        }
    });
})