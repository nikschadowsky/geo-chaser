<script setup lang="ts">
const { locales, setLocale, locale } = useI18n()
</script>

<template>
  <ButtonGroup>
    <Button v-for="localeOption in locales" @click="setLocale(localeOption.code)" variant="link">
      <span class="underline-offset-4" :class="{ underline: localeOption.code === locale }">{{ localeOption.display }}</span>
    </Button>
  </ButtonGroup>
</template>

<style scoped>

</style>