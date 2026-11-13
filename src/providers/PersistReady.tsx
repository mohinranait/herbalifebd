"use client";

import { ReactNode, useEffect, useState } from "react";
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

  // The server always renders the fallback. A part of the page that hydrates
  // late (inside a <Suspense>) may find the cart already restored; it still has
  // to render the fallback first, or React reports a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return <>{mounted && rehydrated ? children : fallback}</>;
}
