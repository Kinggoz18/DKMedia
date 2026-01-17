import React from "react";
import ThrowAsyncErrorProps from "@/lib/interfaces/props/ThrowAsyncErrorProps";

/**
 * Toggle error component
 * @returns
 */
export const toggleFeedback = (errorRef: React.RefObject<HTMLDivElement | null>) => {
  const errRef = errorRef?.current;
  if (!errRef) return;

  errRef.classList.remove("opacity-0");
  errRef.classList.remove("!z-[-10]");
  errRef.classList.add("z-30");

  setTimeout(() => {
    errRef.classList.add("opacity-0");
    errRef.classList.add("!z-[-10]");
    errRef.classList.remove("z-30");
  }, 3000);
};

export default function FeedbackPopup(props: ThrowAsyncErrorProps) {
  const { errorRef, responseError, className } = props;

  if (!errorRef) return;

  return (
    <div
      ref={errorRef}
      className={`fixed ml-auto mr-auto left-0 right-0 w-fit max-w-[90%] h-fit text-wrap bg-blue-600 rounded-lg bottom-[20%] text-center p-4 text-white opacity-0 transition-opacity transform duration-300 ease-in-out !z-[-10] ${className}`}
    >
      {responseError}
    </div>
  );
}
