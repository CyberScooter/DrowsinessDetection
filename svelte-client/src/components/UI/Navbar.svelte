<script>
  let showItems = false;
  export let authenticated;

  import { goto } from "$app/navigation";
</script>

<ul class="navbar-component__navbar">
  <div class="navbar-component__items__desktop">
    <li><a draggable="false" href="/">Home</a></li>
    <li><a draggable="false" href="/secret">Secret</a></li>
    <div class="navbar-component__right">
      {#if !authenticated}
        <li><a draggable="false" href="/auth/login">Login</a></li>
        <li><a draggable="false" href="/register">Sign up</a></li>
      {:else}
        <li><a draggable="false" href="/logout">Logout</a></li>
      {/if}
    </div>
  </div>
  <div class="navbar-component__items__mobile">
    <div
      on:click={() => {
        showItems = !showItems;
      }}
      class="navbar-component__items__menu"
    >
      <div class="navbar-component__items__menu-icon" />
      <div class="navbar-component__items__menu-icon" />
      <div class="navbar-component__items__menu-icon" />
    </div>
    {#if showItems}
      <li><a draggable="false" href="/">Home</a></li>
      <li><a draggable="false" href="/secret">Secret</a></li>
      {#if !authenticated}
        <li><a draggable="false" href="/auth/login">Login</a></li>
        <li><a draggable="false" href="/register">Sign up</a></li>
      {:else}
        <li><a draggable="false" href="/logout">Logout</a></li>
      {/if}
    {/if}
  </div>
</ul>

<style lang="scss">
  .navbar-component {
    &__navbar {
      list-style-type: none;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }

    &__items__desktop li {
      float: left;
      display: block;
      color: black;
      text-align: center;
      padding: 14px 16px;
      text-decoration: none;
    }
    &__item__desktop a {
      pointer-events: none;
    }
    &__items__desktop a:hover {
      cursor: pointer;
      text-decoration: none;
    }
    &__right {
      float: right;
    }
    &__items__mobile {
      display: none;
    }

    &__items__menu-icon {
      width: 35px;
      height: 5px;
      background-color: black;
      margin: 6px 0;
    }

    &__items__menu {
      float: right;
      padding: 10px;
      cursor: pointer;
      display: block;
      margin-left: 100%;
    }

    &__items__mobile li {
      display: block;
      margin-bottom: 0.4rem;
      text-align: center;
    }

    &__items__mobile a:hover {
      text-decoration: none;
    }

    @media only screen and (max-width: 500px) {
      &__items__desktop {
        display: none;
      }
    }
    @media only screen and (max-width: 500px) {
      &__items__mobile {
        display: block;
      }
    }
  }
</style>
