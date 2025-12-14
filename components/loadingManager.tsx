"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { Bouncy } from "ldrs/react";
import "ldrs/react/Bouncy.css";

const LoadingContext = createContext({
  activeCount: 0,
  registerLoader: () => {},
  hideLoader: () => {},
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

  const value = useMemo(
    () => ({
      activeCount,
      registerLoader,
      hideLoader,
    }),
    [activeCount, registerLoader, hideLoader]
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

  useEffect(() => {
    hideLoader();
  }, [hideLoader]);

  return null;
};
