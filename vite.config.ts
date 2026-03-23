import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import license from 'rollup-plugin-license';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    license({
      thirdParty: {
        output: {
          file: path.join(__dirname, 'dist', 'dependencies.html'),
          template(dependencies) {
            return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Licenses</title>
                <style>
                @media (prefers-color-scheme: dark) {
                  :root {
                    --text-color: white;
                    --background-color: #303030;
                  }
                }
                @media (prefers-color-scheme: light) {
                  :root {
                    --background-color: white;
                    --text-color: black;
                  }
                }
                :root {
                  background-color: var(--background-color);
                  color: var(--text-color);
                }
                </style>
            </head>
            <body>
              ${dependencies.map(d => `
              <section>
                <h3>${d.name} (${d.version})</h3>
                <p>License: ${d.license}</p>
                <pre>${d.licenseText}</pre>
              </section> `).join('<hr>')}
            </body>
            </html>`;
          },
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
