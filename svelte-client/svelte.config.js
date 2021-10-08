import pre from "svelte-preprocess";
import autoPrefixer from "autoprefixer";
import node from "@sveltejs/adapter-node";
const preprocess = pre({
  postcss: {
    plugins: [autoPrefixer],
  },
  scss: {
    includePaths: ["./src"],
    // prependData: ``,
  },
  
});

// const pkg = require("./package.json");

export default {
  kit: {
    // By default, `npm run build` will create a standard Node app.
    // You can create optimized builds for different platforms by
    // specifying a different adapter
    adapter: node({
      host: "0.0.0.0",
      port: "8080",
      out: "dist",
      env: {
        port: "8080",
      },
    }),
    vite: {
      ssr: {
      },

      css: {
        preprocessorOptions: {
          scss: {},
        },
      },
    },
  },
  preprocess: preprocess,
};
