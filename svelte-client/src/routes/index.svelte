<script>
  import {onMount} from "svelte"
  export let capture;




  onMount(() => {
    clearInterval(capture);

  });
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>


<div>
  <h1>Welcome to the fyp idea site</h1>
</div>
<button on:click={() => {
  console.log(coords)
}}>Test</button>

<style lang="scss">
</style>
