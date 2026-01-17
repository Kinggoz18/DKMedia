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
    // route("cms", "routes/cms/index.tsx", () => {
    //   route("sections/about-us", "routes/cms/sections/about-us.tsx");
    //   route("sections/home", "routes/cms/sections/home.tsx");
    //   route("sections/manage-articles", "routes/cms/sections/manage-articles.tsx");
    //   route("sections/manage-contact-us", "routes/cms/sections/manage-contact-us.tsx");
    //   route("sections/manage-events", "routes/cms/sections/manage-events.tsx");
    //   route("sections/manage-media", "routes/cms/sections/manage-media.tsx");
    //   route("sections/manage-organizations", "routes/cms/sections/manage-organizations.tsx");
    //   route("sections/subscriptions", "routes/cms/sections/subscriptions.tsx");
    // });

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
