<script>
  import { getContext, onMount } from "svelte";
  import http from "$lib/http";
  export let form = {
    username: "",
    password: "",
  };
  export let error = "";
  const auth = getContext("store");

  async function loginHandler(e) {
    e.preventDefault();
    let res = await auth.loginUser(form);

    if (res?.error) {
      error = res.error;
    }
  }
</script>

<div class="login-page__container">
  <h2>Login</h2>
  <form svelte:prevent on:submit={loginHandler}>
    <h3>Username</h3>
    <input
      type="text"
      placeholder="Enter username"
      bind:value={form.username}
    />
    <h3>Password</h3>
    <input
      type="password"
      placeholder="Enter password"
      bind:value={form.password}
    />
    <button>Login</button>
    {error}
  </form>
</div>

<style type="scss">
  .login-page {
    &__container {
      background-color: lightgrey;
      border-radius: 0.7rem;
      padding: 25px;
    }
  }
</style>
