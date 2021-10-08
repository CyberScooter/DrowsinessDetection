<script context="module">
  import AuthStore from "$lib/stores/auth";
  let capturing = false;
  import { setContext } from "svelte";
</script>

<script>
  import Navbar from "../components/UI/Navbar.svelte";
  import "../app.css";
  import { session } from "$app/stores";

  // console.log($session);

  setContext("store", new AuthStore(session));

  console.log($session);
</script>

<div>
  <Navbar authenticated={$session.authenticated} />
  <main>
    <slot capture={capturing} />
  </main>
</div>

<style>
  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100%;
    max-width: 1024px;
    margin: 0 auto;
    box-sizing: border-box;
  }

  /* footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	footer a {
		font-weight: bold;
	} */

  /* @media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	} */
</style>
