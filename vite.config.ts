import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const AppRoutes = (defineRoutes: any) =>
  defineRoutes((route: any) => {
    /**************** Public Routes ********************/
    route("/", "routes/routes/index.tsx");
    route("auth", "routes/routes/auth.tsx");
    route("contact", "routes/routes/contact.tsx");
    route("media", "routes/routes/media.tsx");
    route("privacy-policy", "routes/routes/privacy-policy.tsx");
    route("unsubscribe", "routes/routes/unsubscribe.tsx");

    /**************** CMS Routes ********************/
    route("cms", "routes/cms/index.tsx")

    /**************** Catch-all Route ********************/
    route("*", "routes/routes/$.tsx");
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
  build: {
    outDir: 'dist/client',
  },
})
