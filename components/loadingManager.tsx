"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Bouncy } from "ldrs/react";
import "ldrs/react/Bouncy.css";

type LoadingContextValue = {
  activeCount: number;
  registerLoader: () => void;
  hideLoader: () => void;
  withLoader: <T>(task: Promise<T>) => Promise<T>;
};

const LoadingContext = createContext<LoadingContextValue>({
  activeCount: 0,
  registerLoader: () => undefined,
  hideLoader: () => undefined,
  withLoader: async <T,>(task: Promise<T>) => task,
});

export const useLoadingManager = () => useContext(LoadingContext);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeCount, setActiveCount] = useState(1);

  const registerLoader = useCallback(() => {
    setActiveCount((count) => count + 1);
  }, []);

  const hideLoader = useCallback(() => {
    setActiveCount((count) => Math.max(count - 1, 0));
  }, []);

  const withLoader = useCallback(async <T,>(task: Promise<T>) => {
    registerLoader();
    try {
      return await task;
    } finally {
      hideLoader();
    }
  }, [hideLoader, registerLoader]);

  const value = useMemo(
    () => ({
      activeCount,
      registerLoader,
      hideLoader,
      withLoader,
    }),
    [activeCount, hideLoader, registerLoader, withLoader]
  );

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
};

export const GlobalLoader = () => {
  const { activeCount } = useLoadingManager();
  if (activeCount === 0) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-9999 bg-secondary">
      <Bouncy size="100" speed="2" color="#2563eb" />
    </div>
  );
};

export const InitLoader = () => {
  const { hideLoader } = useLoadingManager();
  React.useEffect(() => {
    hideLoader();
  }, [hideLoader]);

  return null;
};
