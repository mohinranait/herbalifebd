"use client";

import { useRef } from "react";
import { useStore } from "react-redux";
import { baseApi } from "@/redux/service";
// Endpoints are injected when their module loads: make sure the ones the
// storefront hydrates exist before the first dispatch.
import "@/redux/service/setting";
import "@/redux/service/categories";
import "@/redux/service/sliders";
import "@/redux/service/brand";
import "@/redux/service/comments";
import "@/redux/client/products";

export type QueryEntry = {
  /** RTK Query endpoint name, e.g. "getCategories" */
  endpointName: string;
  /** Exactly the argument the component passes to its use...Query hook */
  arg?: unknown;
  /** The response the endpoint would have returned */
  value: unknown;
};

/**
 * Puts data the server already loaded into the RTK Query cache, before the
 * components below it render. Their `use...Query()` hooks then have data on the
 * very first render (in the server HTML and in the browser) and never show a
 * skeleton or fire a request for it.
 *
 * Render it ABOVE the components that read the data.
 */
export default function QueryHydrator({ entries }: { entries: QueryEntry[] }) {
  const store = useStore();
  const applied = useRef<QueryEntry[] | null>(null);

  if (applied.current !== entries) {
    applied.current = entries;

    const isServer = typeof window === "undefined";
    const state = store.getState();

    const missing = entries.filter((entry) => {
      if (entry.value === null || entry.value === undefined) return false;
      // The server store lives across requests: always take the fresh value there.
      if (isServer) return true;
      // In the browser keep what is already cached (it follows RTK tag invalidation).
      const endpoint = (baseApi.endpoints as any)[entry.endpointName];
      return !endpoint?.select(entry.arg)(state)?.isSuccess;
    });

    if (missing.length > 0) {
      store.dispatch(baseApi.util.upsertQueryEntries(missing as any));
    }
  }

  return null;
}
