import type { AppConfig } from "@remix-run/dev";

export default {
  appDirectory: "app",
  ignoredRouteFiles: ["**/.*"],
  serverDependenciesToBundle: [
    "redux-persist",
    /^redux-persist.*/,
  ],
} satisfies AppConfig;

