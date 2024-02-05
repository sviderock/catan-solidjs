import { defineConfig, loadEnv } from "vite";
import solidPlugin from "vite-plugin-solid";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      solidPlugin(),
      tsconfigPaths({ root: ".", projects: ["tsconfig.json"] }),
      checker({
        typescript: {
          root: ".",
          tsconfigPath: "./tsconfig.json"
        }
      })
    ],
    server: {
      // @ts-expect-error
      port: +env.PORT || 3000,
      host: "0.0.0.0"
    },
    build: {
      target: "esnext"
    }
  };
});
