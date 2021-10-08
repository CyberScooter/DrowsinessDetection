<template>
  <div class="register-page page">
    <div class="register-page__container">
      <h1 class="register-page__title mb-3">Register page:</h1>

      <form @submit.stop.prevent="registrationHandler">
        <b-field
          label="Username"
          :type="usernameValidation.type"
          :message="usernameValidation.message"
        >
          <b-input
            v-model="username"
            @input="usernameChange"
            maxlength="30"
          ></b-input>
        </b-field>

        <b-field
          label="Email"
          :type="emailValidation.type"
          :message="emailValidation.message"
        >
          <b-input v-model="email" @input="emailChange" maxlength="30">
          </b-input>
        </b-field>

        <b-field
          label="Password"
          :type="passwordValidation.passwordType"
          :message="passwordValidation.passwordMessage"
        >
          <b-input
            v-model="password"
            @input="passwordChange"
            type="password"
            maxlength="30"
          ></b-input>
        </b-field>

        <b-field
          label="Retyped password"
          :type="passwordValidation.retypedPasswordType"
          :message="passwordValidation.retypedPasswordMessage"
        >
          <b-input
            v-model="retypedPassword"
            @input="retypedPasswordChange"
            type="password"
            maxlength="30"
          ></b-input>
        </b-field>
        <button
          type="submit"
          class="register-page__button button is-primary is-outlined"
        >
          <span>Register</span>
        </button>
        <p class="register-page__error mt-1">{{ error }}</p>
        <p class="register-page__error mt-1">{{ clientError }}</p>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";

export default {
  middleware: "auth",

  data: () => {
    return {
      clientError: "",
      email: "",
      emailValidation: [
        {
          id: 1,
          type: "none",
          valid: false,
          message: ""
        }
      ],
      username: "",
      usernameValidation: {
        type: "none",
        message: "",
        valid: false,
        exists: false
      },
      password: "",
      retypedPassword: "",
      passwordValidation: {
        passwordType: "none",
        retypedPasswordType: "none",
        passwordMessage: "",
        retypedPasswordMessage: "",
        passwordValid: false,
        retypedPasswordValid: false
      }
    };
  },

  methods: {
    async registrationHandler() {
      // console.log(this.email)
      if (
        this.emailValidation.valid &&
        this.usernameValidation.valid &&
        this.passwordValidation.passwordValid &&
        this.passwordValidation.retypedPasswordValid &&
        this.password === this.retypedPassword
      ) {
        let response = await this.$store.dispatch("users/registerUser", {
          username: this.username.toLowerCase(),
          password: this.password.toLowerCase(),
          email: this.email.toLowerCase()
        });

        if (response) {
          this.$router.go({ path: "/register" });
        }
      } else {
        if (this.retypedPassword !== this.password) {
          this.clientError = "Passwords do not match";
        } else {
          this.clientError = "Please fill form in correctly";
        }
      }
    },

    emailChange() {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (re.test(String(this.email).toLowerCase())) {
        this.emailValidation.type = "is-success";
        this.emailValidation.message = "";
        this.emailValidation.valid = true;
      } else {
        this.emailValidation.type = "is-danger";
        this.emailValidation.message = "Email not in correct format";
        this.emailValidation.valid = false;
      }
    },

    passwordChange() {
      if (this.password.length >= 8) {
        this.passwordValidation.passwordType = "is-success";
        this.passwordValidation.passwordMessage = "";
        this.passwordValidation.passwordValid = true;
      } else {
        this.passwordValidation.passwordType = "is-danger";
        this.passwordValidation.passwordMessage =
          "Password needs to be at least 8 characters long";
        this.passwordValidation.passwordValid = false;
      }
    },

    usernameChange() {
      if (this.username.length > 8) {
        this.usernameValidation.type = "is-success";
        this.usernameValidation.message = "";
        this.usernameValidation.valid = true;
      } else {
        this.usernameValidation.type = "is-danger";
        this.usernameValidation.message =
          "Username needs to be at least 8 characters long";
        this.usernameValidation.valid = false;
      }
    },

    retypedPasswordChange() {
      if (this.retypedPassword.length == 0) {
        this.passwordValidation.retypedPasswordType = "";
        this.passwordValidation.retypedPasswordMessage = "";
        this.passwordValidation.retypedPasswordValid = false;
      } else if (this.password == this.retypedPassword) {
        this.passwordValidation.retypedPasswordType = "is-success";
        this.passwordValidation.retypedPasswordMessage = "";
        this.passwordValidation.retypedPasswordValid = true;
      } else {
        this.passwordValidation.retypedPasswordType = "is-danger";
        this.passwordValidation.retypedPasswordMessage =
          "Password does not match";
        this.passwordValidation.retypedPasswordValid = false;
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
.register-page {
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
