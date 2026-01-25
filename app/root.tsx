import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/lib/integration/react.js'
import { makeStore } from './lib/redux/rootStore'
import stylesheet from "./index.css?url";

const store = makeStore();

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Provider store={store}>
          {/* PersistGate with loading={null} ensures app renders immediately without blocking on redux-persist rehydration */}
          {/* This prevents Safari Private Mode hydration stalls from localStorage access delays */}
          <PersistGate loading={null} persistor={store.__persistor}>
            {children}
          </PersistGate>
        </Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

