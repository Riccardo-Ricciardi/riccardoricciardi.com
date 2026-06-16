"use client";

import { createContext, useContext } from "react";

export interface ErrorCopy {
  eyebrow: string;
  title: string;
  description: string;
  retry: string;
  home: string;
}

const EMPTY: ErrorCopy = {
  eyebrow: "",
  title: "",
  description: "",
  retry: "",
  home: "",
};

const ErrorCopyContext = createContext<ErrorCopy>(EMPTY);

export function ErrorCopyProvider({
  copy,
  children,
}: {
  copy: ErrorCopy;
  children: React.ReactNode;
}) {
  return (
    <ErrorCopyContext.Provider value={copy}>
      {children}
    </ErrorCopyContext.Provider>
  );
}

export function useErrorCopy(): ErrorCopy {
  return useContext(ErrorCopyContext);
}
