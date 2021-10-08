<template>
  <b-navbar>
    <template #brand>
      <b-navbar-item tag="router-link" :to="{ path: '/' }">
        <!-- <img
          src="https://raw.githubusercontent.com/buefy/buefy/dev/static/img/buefy-logo.png"
          alt="Lightweight UI components for Vue.js based on Bulma"
        /> -->
        FYP-IDEA
      </b-navbar-item>
    </template>
    <template #start>
      <b-navbar-item tag="router-link" :to="{ path: '/' }">
        Home
      </b-navbar-item>
      <b-navbar-item v-if="auth" tag="router-link" :to="{ path: '/profile' }">
        Profile
      </b-navbar-item>
      <b-navbar-item v-if="auth" tag="router-link" :to="{ path: '/secret' }">
        Secret
      </b-navbar-item>
      <b-navbar-dropdown label="Info">
        <b-navbar-item href="#">
          About
        </b-navbar-item>
        <b-navbar-item href="#">
          Contact
        </b-navbar-item>
      </b-navbar-dropdown>
    </template>

    <template #end>
      <b-navbar-item tag="div">
        <div class="buttons">
          <a @click="loginPage" v-if="!!!auth" class="button is-light">
            Log in
          </a>
          <a @click="registerPage" v-if="!!!auth" class="button is-primary">
            <strong>Sign up</strong>
          </a>
          <a @click="logout" v-if="auth" class="button is-light">
            Logout
          </a>
        </div>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script>
import { mapState } from "vuex";
export default {
  methods: {
    registerPage() {
      this.$router.push({ path: "/register" });
    },
    async logout() {
      let response = await this.$store.dispatch("users/logoutUser");

      if (response) {
        // await this.$nuxt.refresh();
        this.$router.go({ path: "/" });
      }
    },
    loginPage() {
      this.$router.push({ path: "/login" });
    }
  },

  computed: {
    ...mapState("users", ["auth"])
  }
};
</script>

<style></style>
