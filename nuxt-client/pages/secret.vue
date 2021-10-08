<template>
  <div class="secret-page page">
    <div class="secret-page__camera">
      <h2>{{ error }}</h2>
      <video v-if="!!!error" autoplay class="feed"></video>
      <div v-if="!!!error" class="secret-page__container">
        <button class="button" v-on:click="this.captureImage">
          Take picture
        </button>
      </div>
      <canvas />
    </div>
  </div>
</template>

<script>
import jwt_decode from "jwt-decode";
export default {
  async asyncData({ $axios }) {
    return {
      imageBase64: "",
      interval: 0,
      error: ""
    };
  },

  //   async asyncData() {},
  methods: {
    init() {
      if (
        "mediaDevices" in navigator &&
        "getUserMedia" in navigator.mediaDevices
      ) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(steam => {
          const videoPlayer = document.querySelector("video");
          videoPlayer.srcObject = steam;
          videoPlayer.play();
        });
      } else {
        this.error = "Cannot find webcam";
      }
    },

    captureImage() {
      var canvas = document.querySelector("canvas");
      var video = document.querySelector("video");
      canvas.width = 600;
      canvas.height = 400;
      canvas
        .getContext("2d")
        .drawImage(video, 0, 0, canvas.width, canvas.height);
      console.log({
        frame: canvas.toDataURL("image/png;base64")
      });
    },

    async getFrame() {
      var canvas = document.querySelector("canvas");
      var video = document.querySelector("video");
      //   canvas.width = video.videoWidth;
      //   canvas.height = video.videoHeight;
      canvas
        .getContext("2d")
        .drawImage(video, 0, 0, canvas.width, canvas.height);
      console.log({
        frame: canvas.toDataURL("image/png;base64"),
        access_token: this.$store.state.users.userData.accessToken
      });
    }
  },

  async mounted() {
    if (!!!this.$store.state.users.userData.accessToken) {
      let { id } = jwt_decode(this.$store.state.users.auth);
      let res = await this.$store.dispatch("users/getAccessToken", {
        accessToken: id
      });

      if (!res) {
        return;
      }
    }

    console.log(this.$store.state.users.userData);
    // setInterval(() => {
    //   this.getFrame();
    // }, 5000);
  },

  beforeMount() {
    this.init();
  }
};
</script>

<style lang="scss">
.secret-page {
  &__camera {
    // width: 100vw;
    // height: 100vh;
    margin: 0 auto;

    .feed {
      margin: 0 auto;
      display: block;
      width: 100%;
      max-width: 800px;
      max-height: 800px;
      box-shadow: 4px 4px 12px 0px rgba(0, 0, 0, 0.25);
    }

    canvas {
      display: none;
    }
  }
  &__container {
    display: block;
    margin: 0 auto;
  }
}
</style>
