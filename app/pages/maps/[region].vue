<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useRoute} from 'vue-router'
import ImagePicker from "~/components/image-picker.vue";

definePageMeta({layout: 'map'})

const {locale} = useI18n()
const route = useRoute()

const regionName = computed(() => route.params.region as string)
const regionNameDisplay = ref('')
const geoJsonData = ref<any>(null)
const visitsList = ref<any[]>([])
const allDistricts = ref<any[]>([])
const isLoading = ref(true)
const hasError = ref(false)

const detailsVisible = ref(false)
const unlockDialogOpen = ref(false)
const unlockDialogTitle = ref('')
const unlockDialogMessage = ref('')
const unlockDialogAlreadyVisited = ref(false)
const showRecenterButton = ref(false)

let mapInstance: any = null
let L: any = null
let selectedLayer: any = null
const visualCenter = ref<any>(null)

const loadDataAndRender = async () => {
  isLoading.value = true
  hasError.value = false

  try {
    const [mapRes, visitsRes]: [any, any] = await Promise.all([
      $fetch(`/api/maps/${regionName.value}`),
      $fetch(`/api/visits/${regionName.value}`)
    ])

    regionNameDisplay.value = mapRes.regionName
    geoJsonData.value = mapRes.geoJson
    visitsList.value = visitsRes as any[]

    allDistricts.value = mapRes.geoJson.features.map((f: any) => ({
      id: f.properties.id,
      name: f.properties.name
    })).sort((a: any, b: any) => a.name.localeCompare(b.name))

    if (mapInstance && geoJsonData.value) {
      const tempLayer = L.geoJSON(geoJsonData.value)
      const bounds = tempLayer.getBounds()

      visualCenter.value = bounds.getCenter()

      if (bounds.isValid()) {
        mapInstance.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 12
        })
      }
    }

    renderLeaflet()
  } catch (err) {
    console.error(err)
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

const getVisitForDistrict = (districtId: number) => {
  return visitsList.value.find(v => v.districtId === districtId)
}

const renderLeaflet = () => {
  if (!mapInstance || !geoJsonData.value) return

  mapInstance.eachLayer((layer: any) => {
    if (layer instanceof L.GeoJSON) mapInstance.removeLayer(layer)
  })

  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--p-primary-color').trim();

  L.geoJSON(geoJsonData.value, {
    style: (feature: any) => ({
      color: '#ffffff',
      weight: 1.5,
      fillColor: visitsList.value.some(v => v.districtId === feature.properties.id) ? '#4ade80' : '#333333',
      fillOpacity: 0.8
    }),
    onEachFeature: (feature: any, layer: any) => {
      layer.on('click', (e: any) => {
        if (feature) {
          layer.bindTooltip(feature.properties.name, {
            direction: 'center',
            sticky: false,
            className: 'district-tooltip',
            interactive: false
          }).openTooltip(e.latlng)

          if (selectedLayer) {
            selectedLayer.setStyle({color: '#ffffff', weight: 1.5, fillOpacity: 0.8})
          }

          layer.setStyle({color: primaryColor, weight: 3, fillOpacity: 0.9})
          layer.bringToFront()
          selectedLayer = layer

          L.DomEvent.stopPropagation(e)
        }
      })
    }
  }).addTo(mapInstance)
}

const handleNewVisit = (newVisit: any) => {
  const visit = visitsList.value.find(v => v.districtId === newVisit.districtId)

  if (!visit) {
    visitsList.value.push(newVisit)
    const newDistrict = allDistricts.value.find(d => d.id === newVisit.districtId)

    unlockDialogOpen.value = true
    unlockDialogTitle.value = $t('unlocked-district-title')
    unlockDialogMessage.value = $t('unlocked-district-desc', {district: newDistrict?.name})
    unlockDialogAlreadyVisited.value = false
    renderLeaflet()
  } else if (newVisit.alreadyVisited) {
    const district = allDistricts.value.find(d => d.id === newVisit.districtId)

    console.log(district);

    unlockDialogOpen.value = true
    unlockDialogTitle.value = $t('already-unlocked-district-title')
    unlockDialogMessage.value = $t('already-unlocked-district-desc', {district: district.name})
    unlockDialogAlreadyVisited.value = true
    console.log("already visited")
  }
}

const recenterMap = () => {
  if (mapInstance && geoJsonData.value) {
    const tempLayer = L.geoJSON(geoJsonData.value)
    mapInstance.flyToBounds(tempLayer.getBounds(), {
      padding: [10, 10],
      duration: .8
    })
  }
}

const handleMove = () => {
  if (!mapInstance || !geoJsonData.value || !visualCenter.value) return

  const currentViewBounds = mapInstance.getBounds()
  const tempLayer = L.geoJSON(geoJsonData.value)
  const regionBounds = tempLayer.getBounds()

  const isCenterVisible = currentViewBounds.contains(visualCenter.value)

  const isEverythingVisible = currentViewBounds.contains(regionBounds)

  showRecenterButton.value = !isCenterVisible && !isEverythingVisible
}

onMounted(async () => {
  L = (await import('leaflet')).default
  await import('leaflet/dist/leaflet.css')

  mapInstance = L.map('map', {
    zoomControl: false,
    attributionControl: false,
    tap: false
  })

  mapInstance.on('moveend', handleMove)

  await loadDataAndRender()
})
</script>

<template>
  <div class="h-full w-full relative bg-surface-900">

    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-surface-900/50 z-50">
      <i class="pi pi-spin pi-spinner text-4xl! text-primary"></i>
    </div>

    <div v-if="hasError" class="absolute inset-0 flex items-center justify-center z-50">
      <Message severity="error">{{ $t('error.CANNOT_LOAD_DATA') }}</Message>
    </div>

    <Transition name="fade-down">
      <div v-if="showRecenterButton" class="absolute top-6 left-1/2 -translate-x-1/2 z-20">
        <Button
            :label="regionNameDisplay"
            icon="pi pi-map"
            severity="primary"
            rounded
            raised
            size="small"
            @click="recenterMap"
            class="shadow-xl border border-white/10 whitespace-nowrap"
        />
      </div>
    </Transition>

    <div id="map" class="h-full w-full z-0"></div>

    <div v-if="!isLoading && !hasError" class="absolute bottom-4 right-4 z-10 flex flex-col gap-4 items-center">
      <Button
          v-if="!detailsVisible"
          icon="pi pi-info"
          severity="secondary"
          @click="detailsVisible = true"
          rounded
          size="large"
          raised
      />
      <ImagePicker v-if="!detailsVisible" :region="regionName" @visit-verified="handleNewVisit"/>
    </div>

    <Dialog v-model:visible="detailsVisible" modal :header="regionNameDisplay">
      <div class="flex flex-col gap-4">
        <div class="flex justify-between items-center bg-surface-800 p-3 rounded-lg border border-surface-700">
          <span class="text-sm text-surface-400 font-medium mt-1">{{ $t('unlocked-districts-title') }}</span>
          <span class="text-lg font-bold text-primary mt-1">{{ visitsList.length }} / {{
              allDistricts.length || 1
            }}</span>
        </div>

        <!-- Scrollbare Liste aller Stadtteile -->
        <div class="max-h-[60vh] overflow-y-auto flex flex-col gap-2 min-w-64">
          <div
              v-for="district in allDistricts"
              :key="district.id"
              class="flex items-center justify-between p-3 rounded-xl border transition-all duration-200"
              :class="getVisitForDistrict(district.id)
            ? 'border-green-500/30 bg-green-500/5'
            : 'border-surface-700 bg-surface-900/50 opacity-60'"
          >
            <div class="flex flex-col">
            <span class="font-bold text-sm"
                  :class="getVisitForDistrict(district.id) ? 'text-surface-0' : 'text-surface-400'">
              {{ district.name }}
            </span>

              <span v-if="getVisitForDistrict(district.id)" class="text-[10px] text-green-400 font-mono mt-1">
                {{
                  $t('district-unlocked', {
                    date:
                        new Date(getVisitForDistrict(district.id).createdAt).toLocaleDateString(locale, {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })
                  })
                }}
            </span>
              <span v-else class="text-[10px] text-surface-600 mt-1 uppercase tracking-tighter">
              {{ $t('district-locked') }}
            </span>
            </div>

            <div class="flex items-center justify-center w-8 h-8 rounded-full"
                 :class="getVisitForDistrict(district.id) ? 'bg-green-500/20' : 'bg-surface-800'">
              <i
                  :class="getVisitForDistrict(district.id) ? 'pi pi-check text-green-400' : 'pi pi-lock text-surface-600'"
                  style="font-size: 0.8rem"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
    <Dialog v-model:visible="unlockDialogOpen" modal :header="regionNameDisplay">
      <template #header>
        <div class="inline-flex items-center justify-center gap-2">
          <i class="pi mb-1 text-2xl! text-amber-400"
             :class="{ 'pi-star' : !unlockDialogAlreadyVisited, 'pi-lock-open' : unlockDialogAlreadyVisited }"
          />
          <span class="font-bold whitespace-nowrap">{{ unlockDialogTitle }}</span>
        </div>
      </template>
      <p>{{ unlockDialogMessage }}</p>
    </Dialog>
  </div>
</template>

<style scoped>
#map {
  background-color: #121212;
  height: 100%;
  width: 100%;
}

:deep(path.leaflet-interactive) {
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

:deep(.district-tooltip) {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-weight: 600;
  font-size: 13px;
  padding: 5px 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}

:deep(.leaflet-tooltip-top:before),
:deep(.leaflet-tooltip-bottom:before),
:deep(.leaflet-tooltip-left:before),
:deep(.leaflet-tooltip-right:before) {
  display: none;
}

.fade-down-enter-active, .fade-down-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-down-enter-from, .fade-down-leave-to {
  opacity: 0;
  transform: translate(0, -20px);
}
</style>