import { prisma } from "#server/utils/db";

export default defineEventHandler(async (event) => {
    const regionNameParam = event.context.params?.region;

    if (!regionNameParam) {
        throw createError({
            statusCode: 400,
            message: 'INVALID_REQUEST',
        });
    }

    const districts: any[] = await prisma.$queryRaw`
        SELECT
            d.id,
            d.name as district_name,
            r.name as region_display_name,
            ST_AsGeoJSON(ST_SimplifyPreserveTopology(d.geometry, 0.0002))::json as geometry
        FROM "District" d
                 JOIN "Region" r ON d."regionId" = r.id
        WHERE LOWER(r.name) = LOWER(${regionNameParam});
    `

    if (!districts.length) {
        throw createError({
            statusCode: 404,
            message: 'REGION_NOT_FOUND',
        });
    }

    const displayName = districts[0].region_display_name;

    return {
        regionName: displayName,
        geoJson: {
            type: "FeatureCollection",
            features: districts.map((district: any) => ({
                type: "Feature",
                properties: {
                    id: district.id,
                    name: district.district_name
                },
                geometry: district.geometry
            }))
        }
    };
})