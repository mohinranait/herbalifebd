"use client";
import { persistor, store } from "@/redux/store";
import { ReactNode, useEffect } from "react";
import { Provider } from "react-redux";
import ProviderWrapper from "./ProviderWrapper";

const ReduxProvider = ({ children }: { children: ReactNode }) => {
  // No <PersistGate>: it rendered nothing until localStorage was read, which left
  // the server HTML of every page empty. The saved cart is restored right after
  // hydration instead, so the first client render matches the server HTML.
  useEffect(() => {
    persistor.persist();
  }, []);

  return (
    <Provider store={store}>
      <ProviderWrapper>{children}</ProviderWrapper>
    </Provider>
  );
};

export default ReduxProvider;
