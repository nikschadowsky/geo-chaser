<script setup lang="ts">
import type {Map} from "leaflet";

const isLoading = ref(false);
let mapInstance: Map | null = null;
let L: any = null;

onMounted(async () => {
  L = (await import('leaflet')).default;

  await import('leaflet/dist/leaflet.css');

  mapInstance = L.map('map', {
    zoomControl: false,
  }).setView([53.551086, 9.993682], 12);
})

const loadMap = async (regionName: string) => {
  if (!mapInstance || !L) return;
  isLoading.value = true;

  try {
    const geoJsonData = await $fetch(`/api/maps/${regionName}`)

    mapInstance.eachLayer((layer) => {
      mapInstance!.removeLayer(layer)
    })

    const geoJsonLayer = L.geoJSON(geoJsonData, {
      style: () => ({
        color: '#ffffff',
        weight: 1.5,
        fillColor: '#333333',
        fillOpacity: 0.8
      }),

      onEachFeature: (feature: any, layer: any) => {
        if (feature.properties && feature.properties.name) {
          layer.bindTooltip(feature.properties.name, {
            sticky: true,
            className: 'district-tooltip'
          })
        }

        layer.on({
          mouseover: (e: any) => {
            const currentLayer = e.target
            currentLayer.setStyle({
              weight: 3,             // Rand wird dicker
              color: '#4ade80',      // Rand wird grün
              fillOpacity: 1         // Füllung wird deckender
            })
            currentLayer.bringToFront()
          },
          mouseout: (e: any) => {
            geoJsonLayer.resetStyle(e.target)
          }
        })
      }
    }).addTo(mapInstance)

    mapInstance.fitBounds(geoJsonLayer.getBounds())

  } catch (error) {
    console.error('Fehler beim Laden der Karte:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="app-container">
    <header>
      <h1>Geo Chaser</h1>
      <button @click="loadMap('hamburg')" :disabled="isLoading">
        {{ isLoading ? 'Lade Hamburg...' : 'Hamburg Karte öffnen' }}
      </button>
    </header>

    <div id="map" class="map-container"></div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #121212;
  color: white;
  font-family: sans-serif;
}

header {
  padding: 20px;
  text-align: center;
}

.map-container {
  flex-grow: 1;
  width: 100%;
  background-color: #1e1e1e;
}

:deep(.district-tooltip) {
  background-color: #121212;
  color: #ffffff;
  border: 1px solid #4ade80;
  border-radius: 4px;
  padding: 4px 8px;
  font-weight: bold;
  font-family: sans-serif;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  margin-top: 0;
}

:deep(.leaflet-tooltip-left::before),
:deep(.leaflet-tooltip-right::before),
:deep(.leaflet-tooltip-top::before),
:deep(.leaflet-tooltip-bottom::before) {
  display: none;
}
</style>