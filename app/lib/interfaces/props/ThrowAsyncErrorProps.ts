import React from "react";

export default interface ThrowAsyncErrorProps {
  errorRef: React.RefObject<HTMLDivElement | null>;
  responseError: string;
  className: string;
}