export default {
  // Global page headers: https://go.nuxtjs.dev/config-head

  ssr: true,
  target: 'server',

  env: {
    BASE_URL: 'http://localhost:3000'
  },

  head: {
    title: 'client',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    './plugins/axios.js'
  ],

  publicRuntimeConfig: {
    baseURL: process.env.BASE_URL
  },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios',
    'cookie-universal-nuxt',
    'nuxt-buefy'
  ],

  axios: {
    // PRODUCTION, CHANGE URL TO MATCH API URL IN NGINX FOLDER
    // baseURL: process.env.DATABASE_URL || "http://localhost:7999", // Used as fallback if no runtime config is provided

    // DEVELOPMENT
    baseURL: "http://localhost:3001"
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  },

}
