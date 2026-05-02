<script setup lang="ts">
import {reactive, ref} from 'vue';
import {z} from 'zod';
import {zodResolver} from '@primevue/forms/resolvers/zod';

import LanguageSelect from "~/components/language-select.vue";

const initialValues = reactive({username: '', password: ''});
const globalError = ref('');

const schema = z.object({
  username: z.string().min(1, {message: 'USERNAME_REQUIRED'}),
  password: z.string().min(1, {message: 'PASSWORD_REQUIRED'})
});

const resolver = ref(zodResolver(schema));

const handleLogin = async ({valid, values}: { valid: boolean, values: any }) => {
  if (!valid) return;

  try {
    globalError.value = '';

    await $fetch('/api/login', {
      method: 'post',
      body: {
        username: values.username.trim(),
        password: values.password,
      }
    });
    await navigateTo('/maps');
  } catch (error: any) {
    globalError.value = $t(`error.${error.data?.message}`) || $t('error.LOGIN_FAILED');
  }
}
</script>

<template>
  <LanguageSelect class="absolute top-4 left-4"/>

  <div class="w-full h-full flex flex-col items-center justify-center">
    <Form
        v-slot="$form"
        :initialValues
        :resolver="resolver"
        class="max-w-lg w-full h-svh flex flex-col items-center justify-center px-10 gap-2"
        @submit="handleLogin"
    >
      <h1 class="text-5xl font-bold mb-20">Geo<span class="text-primary">Chaser</span></h1>

      <FloatLabel variant="over">
        <InputText name="username" type="text" inputId="username" fluid/>
        <label for="username">{{ $t('username') }}</label>
      </FloatLabel>
      <Message v-if="$form.username?.invalid" severity="error" size="small" variant="simple">
        {{ $t(`validation.${$form.username.error?.message}`) }}
      </Message>

      <FloatLabel variant="over" class="mt-6">
        <Password name="password" toggleMask inputId="password" :feedback="false" fluid/>
        <label for="password">{{ $t('password') }}</label>
      </FloatLabel>
      <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
        {{ $t(`validation.${$form.password.error?.message}`) }}
      </Message>

      <Button type="submit" class="w-4/5 mt-4 mb-2">{{ $t('login-btn') }}</Button>

      <Message v-if="globalError" severity="error" variant="simple">
        {{ globalError }}
      </Message>

      <span>{{ $t('auth-template') }}
      <Button variant="link" class="p-0!">
        <NuxtLink to="/signup" class="flex flex-row items-center gap-2">
          {{ $t('signup-ref') }}<i class="pi pi-arrow-right vertical-center"></i>
        </NuxtLink>
      </Button>
    </span>
    </Form>
  </div>
</template>

<style scoped>
</style>