<script setup lang="ts">
import {reactive, ref} from 'vue';
import {z} from 'zod';
import {zodResolver} from '@primevue/forms/resolvers/zod';

import LanguageSelect from "~/components/language-select.vue";

const initialValues = reactive({username: '', password: '', passwordConfirmation: ''});
const globalError = ref('');

const schema = z.object({
  username: z.string().min(1, {message: 'USERNAME_REQUIRED'}),

  password: z.string()
      .min(12, {message: 'PASSWORD_TOO_SHORT'})
      .regex(/[A-Z]/, {message: 'PASSWORD_NO_UPPERCASE'})
      .regex(/[a-z]/, {message: 'PASSWORD_NO_LOWERCASE'})
      .regex(/[0-9]/, {message: 'PASSWORD_NO_NUMBER'})
      .regex(/[#?!@$%^&*-]/, {message: 'PASSWORD_NO_SPECIAL_CHAR'})
      .regex(/^\S+$/, {message: 'PASSWORD_SPACE'}),

  passwordConfirmation: z.string().min(1, {message: 'PASSWORD_REQUIRED'})
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'PASSWORD_MISMATCH',
  path: ['passwordConfirmation']
});

const resolver = ref(zodResolver(schema));

const handleSignup = async ({valid, values}: { valid: boolean, values: any }) => {
  if (!valid) return;

  try {
    globalError.value = '';
    await $fetch('/api/signup', {
      method: 'post',
      body: {
        username: values.username.trim(),
        password: values.password,
      }
    });
    await navigateTo('/maps');

  } catch (error: any) {
    globalError.value = error.data.message
        ? $t(`error.${error.data.message}`)
        : $t('error.SIGNUP_FAILED');
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
        @submit="handleSignup"
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

      <FloatLabel variant="over" class="mt-6">
        <Password name="passwordConfirmation" toggleMask inputId="passwordConfirmation" :feedback="false" fluid/>
        <label for="passwordConfirmation">{{ $t('confirm-password') }}</label>
      </FloatLabel>
      <Message v-if="$form.passwordConfirmation?.invalid" severity="error" size="small" variant="simple">
        {{ $t(`validation.${$form.passwordConfirmation.error?.message}`) }}
      </Message>

      <Button type="submit" class="w-4/5 mt-4 mb-2">{{ $t('signup-btn') }}</Button>

      <Message v-if="globalError" severity="error" variant="simple">
        {{ globalError }}
      </Message>

      <span>{{ $t('auth-template') }}
      <Button variant="link" class="p-0!">
        <NuxtLink to="/login" class="flex flex-row items-center gap-2">
          {{ $t('login-ref') }}<i class="pi pi-arrow-right vertical-center"/>
        </NuxtLink>
      </Button>
    </span>
    </Form>
  </div>
</template>

<style scoped>
</style>