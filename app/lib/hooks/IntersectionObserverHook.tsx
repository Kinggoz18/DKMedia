import { useEffect, useRef, useState } from "react";
import { IntersectionObserverProps } from "@/lib/interfaces/props/IntersectionObserverProps";

/**
 * Intersection observer hook
 * @param {IntersectionObserverProps} props The scrollable parent container
 * @returns A refrence object and a boolean value indicating whether that element is intersecting
 */
const useIntersectionObserverHook = (props: IntersectionObserverProps) => {
  const { rootElement, threshold } = props;
  const elementRef = useRef<any>(null); //The element to observe
  const [isVisible, setIsVisible] = useState(false); //Boolean flags

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    const options = {
      root: rootElement ? rootElement.current : null,
      threshold: threshold,
      rootMargin: "0px",
    };

    const observe = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      options
    );

    observe.observe(element);

    return () => {
      if (element) observe.unobserve(element);
    };
  }, [rootElement, threshold]);

  return {elementRef, isVisible};
};

export default useIntersectionObserverHook;
