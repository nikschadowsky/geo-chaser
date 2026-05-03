export default defineEventHandler(async (event) => {
    try {
        return await prisma.region.findMany({
            select: {
                name: true,
            },
            orderBy: {
                name: 'asc'
            }
        })
    } catch (error) {
        throw createError({
            statusCode: 500,
            message: 'CANNOT_LOAD_DATA',
        })
    }
})