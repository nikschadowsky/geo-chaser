<script setup lang="ts">
import {useMenu} from '~/composables/useMenu'

definePageMeta({layout: 'map'})

const {openMenu} = useMenu()
</script>

<template>
  <div class="h-full w-full flex flex-col items-center justify-center p-6 text-center">
    <i class="pi pi-map-marker text-6xl! text-surface-500 mb-6"></i>
    <h2 class="text-3xl font-bold mb-4">{{ $t('welcome-chaser') }}</h2>
    <p class="text-surface-400 mb-8 max-w-md">
      {{ $t('no-region-desc') }}
    </p>

    <Button
        :label="$t('open-menu-btn')"
        icon="pi pi-search"
        size="medium"
        @click="openMenu"
        class="mb-8"
    />
  </div>
</template>