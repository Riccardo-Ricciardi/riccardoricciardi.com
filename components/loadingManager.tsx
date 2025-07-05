"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Bouncy } from "ldrs/react";
import "ldrs/react/Bouncy.css";

const LoadingContext = createContext({
  activeCount: 1, // parte da 1, loader sempre visibile all'inizio
  showLoader: () => {},
  hideLoader: () => {},
});

export const useLoadingManager = () => useContext(LoadingContext);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // activeCount parte da 1, quindi loader è visibile subito
  const [activeCount, setActiveCount] = useState(1);

  // showLoader non serve più o può essere una no-op
  const showLoader = useCallback(() => {
    // opzionale: se vuoi disabilitare showLoader, lascia vuoto
  }, []);

  // hideLoader fa diminuire il count e quindi nasconde il loader
  const hideLoader = useCallback(() => {
    setActiveCount((count) => Math.max(count - 1, 0));
  }, []);

  const value = useMemo(
    () => ({
      activeCount,
      showLoader,
      hideLoader,
    }),
    [activeCount, showLoader, hideLoader]
  );

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
};

export const GlobalLoader = () => {
  const { activeCount } = useLoadingManager();

  if (activeCount === 0) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] bg-secondary">
      <Bouncy size="100" speed="2" color="#2563eb" />
    </div>
  );
};
