"use client";

import { ReactNode } from "react";
import { useAppSelector } from "@/hooks/hooks";

/**
 * Renders its children only once the saved cart has been read back from
 * localStorage. For screens that are useless before that (cart, checkout,
 * dashboards) - public pages must NOT use it, they render on the server.
 */
export default function PersistReady({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const rehydrated = useAppSelector((state) => (state.cart as any)?._persist?.rehydrated === true);
  return <>{rehydrated ? children : fallback}</>;
}
