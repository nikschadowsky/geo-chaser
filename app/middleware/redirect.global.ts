export default defineNuxtRouteMiddleware((to) => {
    const authToken = useCookie('auth_token')

    if (import.meta.server) {
        if (to.path === '/') {
            return navigateTo('/maps')
        }

        if (to.path.startsWith('/maps') && !authToken.value) {
            return navigateTo('/login')
        }

        if ((to.path === '/login' || to.path === '/signup') && authToken.value) {
            return navigateTo('/maps')
        }
    }
})