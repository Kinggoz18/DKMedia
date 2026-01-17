import { RefObject } from "react";

export interface IntersectionObserverProps {
  rootElement?: RefObject<HTMLDivElement>;
  threshold: number;
}
