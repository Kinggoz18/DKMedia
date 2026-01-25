/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Type declaration for redux-persist ES module import with .js extension
declare module 'redux-persist/lib/integration/react.js' {
  import { ReactNode, PureComponent } from "react";
  import { Persistor } from "redux-persist/es/types";

  interface PersistGateProps {
    persistor: Persistor;
    onBeforeLift?(): void | Promise<void>;
    children?: ReactNode | ((bootstrapped: boolean) => ReactNode);
    loading?: ReactNode;
  }

  export class PersistGate extends PureComponent<PersistGateProps> {}
}

