<script>
  import Geolocation from "svelte-geolocation";
  import { onMount } from "svelte";
  import { io } from "socket.io-client";
  let error = "";
  let interval;
  export let capture;
  let coords = [];
  let socket;
  let response = "";
  let counter = 0;

  // Create WebSocket connection.

  onMount(() => {
    try {
      if (
        "mediaDevices" in navigator &&
        "getUserMedia" in navigator.mediaDevices
      ) {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
          const videoPlayer = document.querySelector("video");
          videoPlayer.srcObject = stream;
          videoPlayer.play();
        });
      } else {
        error = "Cannot find webcam";
      }

      // socket = new WebSocket("ws://localhost:3001");
      socket = io("ws://localhost:5000", { reconnection: false });

      socket.on("connect_failed", function () {
        return;
      });

      // Connection opened
      socket.addEventListener("open", function (event) {
        socket.send("Hello Server!");
      });

      // Listen for messages
      socket.addEventListener("frameAnalysis", function (event) {
        if (event === undefined) {
          response = "";
          return;
        }

        console.log(counter);
        if (event == "DROWSY" || event == "DEAD") {
          counter++;
        } else {
          counter = 0;
        }

        if (counter >= 7) {
          response = event;
        } else {
          response = "AWAKE";
        }
      });

      // socket.on("frameResponse", function (msg) {
      //   console.log(msg);
      // });
    } catch (e) {}
  });

  function takePicture() {
    if (error != "Cannot find webcam") {
      var canvas = document.querySelector("canvas");
      var video = document.querySelector("video");
      canvas.width = 600;
      canvas.height = 400;
      canvas
        .getContext("2d")
        .drawImage(video, 0, 0, canvas.width, canvas.height);
      console.log({
        frame: canvas.toDataURL("image/png;base64"),
      });
      console.log(coords);
      socket.emit("frame", {
        frame: canvas.toDataURL("image/png;base64"),
      });
      // socket.send({
      //   frame: canvas.toDataURL("image/png;base64"),
      // });
    }
  }

  async function startCapture() {
    capture = true;
    interval = setInterval(() => {
      var canvas = document.querySelector("canvas");
      var video = document.querySelector("video");
      canvas.width = 600;
      canvas.height = 400;
      canvas
        .getContext("2d")
        .drawImage(video, 0, 0, canvas.width, canvas.height);
      // console.log({
      //   frame: canvas.toDataURL("image/png;base64"),
      // });
      // console.log(coords);
      console.log(canvas.toDataURL("image/png;base64"));

      socket.emit("frame", {
        frame: canvas.toDataURL("image/png;base64"),
      });
    }, 500);
  }

  async function stopCapture() {
    capture = false;
    clearInterval(interval);
    response = "";
  }
</script>

<div>
  <Geolocation getPosition bind:coords />

  <div class="webcam-page__webcam">
    <!-- svelte-ignore a11y-media-has-caption -->
    <video autoplay class="feed" />
  </div>

  <div class="webcam-page__options">
    <div>
      <button class="webcam-page__button" on:click={() => takePicture()}
        >Take picture</button
      >
      {#if capture}
        <button on:click={() => stopCapture()}>Stop capturing</button>
      {:else}
        <button on:click={() => startCapture()}>Start capturing</button>
      {/if}
    </div>
    <p
      class={response == "AWAKE"
        ? "webcam-page__options-fine"
        : "webcam-page__options-bad"}
    >
      {!!response ? response : ""}
    </p>
  </div>
  <canvas />
</div>

<style lang="scss">
  .webcam-page {
    &__webcam {
      display: flex;
      justify-content: center;
    }
    video {
      box-shadow: 3px 4px 5px 20px;
    }
    &__button {
      align-content: center;
    }

    &__options {
      display: flex;
      flex-direction: column;

      div {
        flex-direction: row;
      }

      p {
        font-weight: bold;
        font-size: 2rem;
      }
      &-bad {
        color: red;
      }
      &-fine {
        color: green;
      }
      align-items: center;
    }
  }
  canvas {
    display: none;
  }
</style>
