"use client";

import { useMemo } from "react";
import { useGetTranslationsQuery } from "@/redux/service/translations";
import { DEFAULT_TRANSLATIONS } from "@/constants/default-translations";

export type TranslationFunction = {
  (key: string, fallback?: string): string;
  [key: string]: any;
};

/**
 * Universal hook to access dynamic site translations.
 *
 * Usage:
 * 1. Object property access (matches user's preferred format):
 *    const t = useTranslation();
 *    <h1>{t["shop-new-asca"]}</h1>
 *
 * 2. Callable with fallback:
 *    <h1>{t("shop-new-asca", "শপে নতুন এসেছে")}</h1>
 */
export const useTranslation = (): TranslationFunction => {
  const { data } = useGetTranslationsQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  const merged = useMemo(() => {
    return {
      ...DEFAULT_TRANSLATIONS,
      ...(data?.data || {}),
    };
  }, [data?.data]);

  const t = useMemo(() => {
    const fn = (key: string, fallback?: string) => {
      return merged[key] ?? fallback ?? DEFAULT_TRANSLATIONS[key] ?? key;
    };

    return new Proxy(fn, {
      get(target, prop: string) {
        if (prop in target) {
          return (target as any)[prop];
        }
        return merged[prop] ?? DEFAULT_TRANSLATIONS[prop] ?? prop;
      },
    }) as TranslationFunction;
  }, [merged]);

  return t;
};

export default useTranslation;
