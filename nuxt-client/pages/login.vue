<template>
  <div class="login-page page">
    <form class="login-page__container" @submit.prevent="loginHandler">
      <h1 class="login-page__title mb-3">Login page:</h1>
      <b-field label="Username">
        <b-input v-model="username" maxlength="30"></b-input>
      </b-field>

      <b-field label="Password">
        <b-input v-model="password" type="password" maxlength="30"></b-input>
      </b-field>

      <button
        type="submit"
        class="login-page__button button is-primary is-outlined"
      >
        <span>Login</span>
      </button>

      <p class="login-page__error mt-1">{{ error }}</p>
    </form>
  </div>
</template>

<script lang="ts">
import { mapState } from "vuex";

export default {
  data: () => {
    return {
      username: "",
      password: ""
    };
  },

  middleware: "auth",

  methods: {
    async loginHandler() {
      let response = await this.$store.dispatch("users/loginUser", {
        username: this.username,
        password: this.password
      });

      if (response) {
        this.$router.go({ path: "/" });
      }
    }
  },

  async created() {
    if (this.$cookies.get("XSRF-TOKEN") == null) {
      await this.$axios.get("/api/", { withCredentials: true });
    }
  },

  computed: {
    ...mapState("users", ["error"])
  }
};
</script>

<style lang="scss">
.login-page {
  &__container {
    margin: 2% 10%;
    background-color: #e5e7e6;
    padding: 1.5rem;
    border-radius: 0.8rem;
  }
  &__title {
    font-weight: bold;
    font-size: 2rem;
  }
  &__error {
    font-weight: bold;
    color: red;
  }
  &__button {
    transition: 0.2s;
  }
}
</style>
