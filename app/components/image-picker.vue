<script setup lang="ts">
import {ref} from 'vue'
import exifr from 'exifr'

const isProcessing = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const emit = defineEmits(['visit-verified'])

const triggerPicker = () => fileInput.value?.click()

const errorDialogOpen = ref(false);
const errorDialogMessage = ref('');

const onFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files?.length) return

  const file = target.files[0]
  isProcessing.value = true

  try {
    const coordinates = await exifr.gps(file!)

    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      errorDialogMessage.value = 'Dieses Foto enthält keine GPS-Daten. Bitte aktiviere den Standort in deiner Kamera-App.';
      errorDialogOpen.value = true;
      return
    }

    const {latitude, longitude} = coordinates

    const result = await $fetch(`/api/visits/hamburg`, {
      method: 'POST',
      body: {
        lat: latitude,
        lng: longitude,
      }
    })
    emit('visit-verified', result);

  } catch (err) {
    console.log(err)
    errorDialogMessage.value = 'Fehler beim Verarbeiten des Bildes.';
    errorDialogOpen.value = true;
  } finally {
    isProcessing.value = false;
    target.value = '';
  }
}
</script>

<template>
  <div class="w-full">
    <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onFileSelected"
    />

    <Button
        icon="pi pi-plus"
        :loading="isProcessing"
        @click="triggerPicker"
        class="w-full py-4 shadow-lg"
        size="large"
        rounded
    />
    <Dialog v-model:visible="errorDialogOpen" header="Fehler" modal class="max-w-[90vw]">
      <template #header>
        <div class="inline-flex items-center justify-center gap-2">
          <i class="pi pi-times-circle mb-1 text-2xl! text-red-500"/>
          <span class="font-bold whitespace-nowrap">Fehler</span>
        </div>
      </template>
      <p>{{ errorDialogMessage }}</p>
    </Dialog>
  </div>
</template>