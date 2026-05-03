import { PrismaClient } from './generated/prisma/client'
import * as fs from 'fs'
import { PrismaPg } from "@prisma/adapter-pg"
import * as pg from 'pg'
import * as path from 'path'

// Typ-Definition für unsere externe Config
interface CityConfig {
    name: string;
    file: string;
    srid: number;
    nameProperties: string[];
}

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Hilfsfunktion: Sucht den richtigen Namen anhand der konfigurierten Keys
function getDistrictName(feature: any, properties: string[]): string | undefined {
    if (!feature.properties) return undefined;

    for (const prop of properties) {
        if (feature.properties[prop]) {
            return feature.properties[prop];
        }
    }
    return undefined;
}

async function main() {
    console.log('🏁 Start Geo-Seeding with coordinate transformation...')

    // 1. Config-Datei einlesen
    const configPath = path.join(process.cwd(), './seeding/seeding.config.json');
    if (!fs.existsSync(configPath)) {
        console.error(`❌ Konfigurationsdatei nicht gefunden: ${configPath}`);
        console.error('Bitte erstelle eine "seed-config.json" im Hauptverzeichnis.');
        process.exit(1);
    }

    const rawConfig = fs.readFileSync(configPath, 'utf-8');
    const cityConfigs: CityConfig[] = JSON.parse(rawConfig);

    // 2. Durch die konfigurieren Städte iterieren
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
            // Geometrie-Typ prüfen, um MultiPoint-Fehler zu vermeiden
            const type = feature.geometry?.type;
            if (type !== 'Polygon' && type !== 'MultiPolygon') {
                console.warn(`  ⏩ Überspringe Feature in ${config.name} (Typ ist ${type})`);
                continue;
            }

            // Stadtteilnamen über die Hilfsfunktion extrahieren
            const districtName = getDistrictName(feature, config.nameProperties);

            if (!districtName) {
                console.warn(`  ⚠️ Kein Name gefunden in ${config.name}. Verfügbare Properties:`, feature.properties);
                continue;
            }

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