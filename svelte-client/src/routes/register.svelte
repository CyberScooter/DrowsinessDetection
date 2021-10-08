<script>
  import { getContext } from "svelte";

  export let response = {
    error: false,
    message: "",
  };
  export let form = {
    username: "",
    email: "",
    password: "",
    retypePassword: "",
  };

  const auth = getContext("store");

  async function registerHandler(e) {
    e.preventDefault();
    if (form.password == form.retypePassword) {
      let res = await auth.registerUser({
        username: form.username,
        email: form.email,
        password: form.password,
      });

      if (!res?.error) {
        response.message = "Successfully registered user";
        response.error = false;
      } else {
        response.message = res.error;
        response.error = true;
      }
    }
  }
</script>

<div class="register-page__container">
  <h2>Sign up</h2>
  <form svelte:prevent on:submit={registerHandler}>
    <h3>Username</h3>
    <input
      type="text"
      placeholder="Enter username"
      bind:value={form.username}
    />
    <h3>Email</h3>
    <input type="email" placeholder="Enter email" bind:value={form.email} />
    <h3>Password</h3>
    <input
      type="password"
      placeholder="Enter password"
      bind:value={form.password}
    />
    <h3>Password confirmation</h3>
    <input
      type="password"
      placeholder="Retype password"
      bind:value={form.retypePassword}
    />
    <button>Register</button>
  </form>
  <p class={response.error ? "register-page__error" : "register-page__success"}>
    {response.message}
  </p>
</div>

<style type="scss">
  .register-page {
    &__container {
      background-color: lightgrey;
      border-radius: 0.7rem;
      padding: 25px;
    }
    &__error {
      color: red;
    }
    &__success {
      color: green;
    }
  }
</style>
