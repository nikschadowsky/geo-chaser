import {prisma} from "#server/utils/db";


export default defineEventHandler(async (event) => {
    const regionName = event.context.params?.region;
    const authPayload: { username: string, userId: number } = event.context.authPayload;
    const body = await readBody(event);
    const {lat, lng} = body;

    if (!authPayload) {
        throw createError({statusCode: 401, statusMessage: 'Unauthorized'});
    }

    let foundDistricts: any[] = [];
    try {
        foundDistricts = await prisma.$queryRaw`
            SELECT d.id, d.name
            FROM "District" d
                     JOIN "Region" r ON d."regionId" = r.id
            WHERE ST_Contains(
                    d.geometry,
                    ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
                  )
              AND LOWER(r.name) = LOWER(${regionName}) LIMIT 1;
        `
    } catch (error) {
        throw createError({statusCode: 500, statusMessage: 'Internal Database Error'});
    }

    if (foundDistricts.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Position matches no district in this region.'
        });
    }

    const district = foundDistricts[0];

    const existingVisit = await prisma.visit.findFirst({
        where: {
            userId: authPayload.userId,
            districtId: district.id
        }
    });

    if (existingVisit) {
        setResponseStatus(event, 202);
        return {
            success: true,
            alreadyVisited: true,
            districtId: district.id,
            message: `You have already visited ${district.name} before!`
        };
    }

    console.error(authPayload)
    try {
        console.error(authPayload.userId, district.id)
        await prisma.visit.create({
            data: {
                userId: authPayload.userId,
                districtId: district.id
            }
        });
        return {
            success: true,
            alreadyVisited: false,
            districtId: district.id,
            message: `Congratulations! You just discovered ${district.name}.`
        };
    } catch (error) {
        throw createError({statusCode: 500, statusMessage: 'Could not save your visit'});
    }
});