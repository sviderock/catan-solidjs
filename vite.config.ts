import { defineConfig, loadEnv } from "vite";
import solidPlugin from "vite-plugin-solid";
import devtools from "solid-devtools/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      /* 
      Uncomment the following line to enable solid-devtools.
      For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
      */
      mode === "development" ? devtools() : undefined,
      solidPlugin()
    ],
    server: {
      port: +env.PORT || 3000,
      host: "0.0.0.0"
    },
    build: {
      target: "esnext"
    }
  };
});
