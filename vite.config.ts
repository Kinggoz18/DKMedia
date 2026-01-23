import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const AppRoutes = (defineRoutes: any) =>
  defineRoutes((route: any) => {
    /**************** Public Routes ********************/
    route("/", "routes/index.tsx");
    route("auth", "routes/auth.tsx");
    route("contact", "routes/contact.tsx");
    route("media", "routes/media.tsx");
    route("privacy-policy", "routes/privacy-policy.tsx");
    route("unsubscribe", "routes/unsubscribe.tsx");

    /**************** CMS Routes ********************/
    route("cms", "routes/cms/index.tsx")

    /**************** Catch-all Route ********************/
    route("*", "routes/$.tsx");
  });

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    remix({
      appDirectory: "app",
      routes: AppRoutes,
      ignoredRouteFiles: ["**/.*"],
    }),
    tailwindcss(),
  ],
  envPrefix: ["VITE"],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './app'),
    },
  },
  // Removed build.outDir - Remix uses build/ by default
  // Server expects build/client and build/server
})