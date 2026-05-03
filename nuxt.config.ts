import Aura from '@primeuix/themes/aura';
import {definePreset} from '@primeuix/themes';
import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{rose.50}',
            100: '{rose.100}',
            200: '{rose.200}',
            300: '{rose.300}',
            400: '{rose.400}',
            500: '{rose.500}',
            600: '{rose.600}',
            700: '{rose.700}',
            800: '{rose.800}',
            900: '{rose.900}',
            950: '{rose.950}'
        }
    }
});


export default defineNuxtConfig({
    nitro: {compressPublicAssets: true, prerender: {failOnError: false, routes: ['/', 'sitemap.xml'],},},
    compatibilityDate: '2025-07-15',
    devtools: {enabled: true},
    css: ['./app/assets/css/main.css'],
    modules: ['@primevue/nuxt-module', '@nuxtjs/i18n'],
    primevue: {
        /* Configuration */
        options: {
            ripple: true,
            inputVariant: 'filled',
            theme: {
                preset: MyPreset,
                options: {
                    prefix: 'p',
                    darkModeSelector: 'system',
                    cssLayer: false
                }
            }
        }
    }, vite: {
        plugins: [
            tailwindcss(),
        ]
    },
    i18n: {
        defaultLocale: 'en',
        locales: [
            {
                code: 'en',
                iso: 'en-US',
                name: 'English',
                file: 'en.json',
                display: 'EN'
            },
            {
                code: 'de',
                iso: 'de-DE',
                name: 'Deutsch',
                file: 'de.json',
                display: 'DE'
            }
        ],
        strategy: 'no_prefix',
    },
    build: {
        transpile: ['vue', 'entities', 'estree']
    },
    app: {
        head: {
            charset: 'utf-8',
            viewport: 'width=device-width, initial-scale=1',
            title: 'GeoChaser',
            meta: [
                {
                    name: 'description',
                    content: 'Collect Regions and visit their Districts - everywhere, everytime. You just need a phone to take a picture!'
                },

                {property: 'og:title', content: 'GeoChaser'},
                {
                    property: 'og:description',
                    content: 'Collect Regions and visit their Districts - everywhere, everytime. You just need a phone to take a picture!'
                },
                {property: 'og:type', content: 'website'},
            ],
            link: [
                {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'},
            ],
            style: [],
            script: [],
            noscript: []
        }
    }
})