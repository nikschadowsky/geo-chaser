<script setup lang="ts">
import {useMenu} from '~/composables/useMenu'
import LanguageSelect from "~/components/language-select.vue";

const {isMenuOpen} = useMenu()
const router = useRouter()
const toast = useToast();

const {data: regions, pending} = await useFetch<any[]>('/api/maps')

const handleLogout = async () => {
  try {
    await $fetch('/api/logout', {
      method: 'POST'
    })

    isMenuOpen.value = false

    await router.replace('/login')
  } catch (error: any) {
    toast.add({severity: 'error', summary: $t(`error.${error.data.message}`), life: 3000});
  }
}
</script>

<template>
  <div class="map-layout-container h-svh w-screen flex flex-col overflow-hidden">

    <!-- Top Navbar -->
    <header
        class="p-4 flex flex-row items-center shadow-md z-10 bg-surface-0 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700">
      <Button icon="pi pi-bars w-fit" variant="text" severity="secondary" @click="isMenuOpen = true"/>
      <LanguageSelect class="ml-auto"/>
    </header>

    <Drawer v-model:visible="isMenuOpen" position="left" class="w-full md:w-80">
      <template #header>
        <NuxtLink to="/maps">
          <h1 class="text-2xl font-bold">Geo<span class="text-primary">Chaser</span></h1>
        </NuxtLink>
      </template>

      <div class="flex flex-col gap-4 h-full">
        <h2 class="text-xl font-bold">{{ $t('select-region') }}</h2>

        <div v-if="pending" class="flex justify-center p-4">
          <i class="pi pi-spin pi-spinner"></i>
        </div>

        <div v-else class="flex flex-col gap-2">
          <NuxtLink
              v-for="region in regions"
              :key="region.name"
              :to="`/maps/${region.name.toLowerCase()}`"
              @click="isMenuOpen = false"
          >
            <Button
                :label="region.name"
                icon="pi pi-map"
                fluid
                variant="outlined"
                class="text-left"
            />
          </NuxtLink>
        </div>
        <div class="mt-auto">
          <Divider/>
          <Button
              :label="$t('logout-btn')"
              icon="pi pi-arrow-left"
              fluid
              variant="text"
              class="text-left"
              @click="handleLogout"
          />
          <div class="flex flex-row justify-evenly mt-4">
            <NuxtLink to="/imprint">{{ $t('imprint-btn') }}</NuxtLink>
            <NuxtLink to="/privacy-policy">{{ $t('privacy-policy-btn') }}</NuxtLink>
          </div>
        </div>
      </div>
    </Drawer>
    <main class="grow relative">
      <slot/>
    </main>
  </div>
</template>