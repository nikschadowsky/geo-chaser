/**
 * Stadt    | Dateiname                                    | Pfad Ort-Name                         | Pfad GeoDaten
 * Hamburg  | ../seeding/hamburg_stadtteile.json           | features.properties.stadtteil_name    | features.properties.geometry
 * Berlin   | ../seeding/berlin_ortsteile.json             | features.properties.OTEIL             | features.properties.geometry
 * Frankfurt| ../seeding/frankfurt_am_main_stadtteile.json | features.properties.STTLNAME          | features.properties.geometry
 * München  | ../seeding/muenchen_stadtbezirke.json        | features.properties.sb_name           | features.properties.geometry
 */
import 'dotenv/config'
import {PrismaClient} from './generated/prisma/client'
import * as fs from 'fs'
import {PrismaPg} from "@prisma/adapter-pg"
import * as pg from 'pg'
import * as path from 'path'

const {Pool} = pg
const pool = new Pool({connectionString: process.env.DATABASE_URL})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({adapter})
const cityConfigs = [
    {
        name: 'Hamburg',
        file: './seeding/hamburg_stadtteile.json',
        srid: 4326, // Standard WGS84
        namePath: (f: any) => f.properties.stadtteil_name || f.properties.name
    },
    {
        name: 'Berlin',
        file: './seeding/berlin_ortsteile.json',
        srid: 4326,
        namePath: (f: any) => f.properties.OTEIL
    },
    {
        name: 'Frankfurt',
        file: './seeding/frankfurt_am_main_stadtteile.json',
        srid: 4326,
        namePath: (f: any) => f.properties.STTLNAME
    },
    {
        name: 'München',
        file: './seeding/muenchen_stadtbezirke.json',
        srid: 25832, // UTM Zone 32N
        namePath: (f: any) => f.properties.sb_name
    }
]

async function main() {
    console.log('🏁 Start Geo-Seeding with coordinate transformation...')

    for (const config of cityConfigs) {
        const filePath = path.join(process.cwd(), config.file)

        if (!fs.existsSync(filePath)) {
            console.log(`⏩ skip ${config.name}, file not found.`)
            continue
        }

        const region = await prisma.region.upsert({
            where: { name: config.name },
            update: {},
            create: { name: config.name }
        })

        const geojson = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        console.log(`📍 Import ${config.name} (Source SRID: ${config.srid})...`)

        for (const feature of geojson.features) {
            const districtName = config.namePath(feature)
            const geometryJson = JSON.stringify(feature.geometry)

            try {
                await prisma.$executeRaw`
                    INSERT INTO "District" (name, "regionId", geometry)
                    VALUES (
                               ${districtName},
                               ${region.id},
                               ST_Multi(
                                       ST_Transform(
                                               ST_SetSRID(ST_GeomFromGeoJSON(${geometryJson}), ${config.srid}),
                                               4326
                                       )
                               )
                           )
                        ON CONFLICT (name, "regionId") 
                    DO UPDATE SET geometry = EXCLUDED.geometry;
                `
            } catch (err) {
                console.error(`❌ Error in ${config.name} at "${districtName}":`, err)
            }
        }
    }
    console.log('✅ Seeding completed successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })