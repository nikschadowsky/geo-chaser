<script setup lang="ts">

</script>

<template>
  <LanguageSelect class="absolute top-4 left-4"/>
  <div class="w-full flex flex-col pl-20 py-40">
    <NuxtLink to="/maps">
      <h1 class="text-4xl font-bold">Geo<span class="text-primary">Chaser</span></h1>
    </NuxtLink>
    <h1 class="text-4xl mt-20">{{ $t('imprint-title') }}</h1>

    <p>Nik Schadowsky</p>
    <p>Lengerckestraße 40</p>
    <p>22041 Hamburg</p>
    <p>Germany</p>

    <h2 class="text-2xl mt-10">{{ $t('imprint-contact-title') }}</h2>
    <p>{{ $t('telephone') }}: +49 152 05147503</p>
    <p>{{ $t('email') }}: <a href="mailto:info@nikschadowsky.de" class="text-primary">info@nikschadowsky.de</a></p>
    <p class="mt-8">{{ $t('source') }}: <a href="https://www.e-recht24.de" rel="noopener noreferrer" class="text-primary">e-recht24.de</a>
    </p>
  </div>
</template>

<style scoped>

</style>