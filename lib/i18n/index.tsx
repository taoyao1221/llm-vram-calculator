"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { translations, type Locale } from "./messages";

export type { Locale } from "./messages";

type Params = Record<string, string | number | undefined>;

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Resolve a dot-path key with optional `{placeholder}` interpolation. */
  t: (key: string, params?: Params, fallback?: string) => string;
  /** Plural-aware lookup: resolves `key.one` / `key.other` for `count`. */
  tn: (key: string, count: number, params?: Params) => string;
  /** Look up an arbitrary embedded string (data-layer text) flat map. */
  tc: (text: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

const LOCALE_STORAGE_KEY = "locale";

function resolve(dict: unknown, key: string): unknown {
  return key
    .split(".")
    .reduce<any>((acc, part) => (acc == null ? undefined : acc[part]), dict);
}

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) => {
    if (!(name in params)) return match;
    const value = params[name];
    return value === undefined ? "" : String(value);
  });
}

function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved === "en" || saved === "zh") return saved;
  } catch {
    /* ignore */
  }
  const lang = navigator.language || (navigator as any).userLanguage || "";
  return /^zh\b/i.test(lang) ? "zh" : "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Detect on mount (client) to avoid SSR hydration mismatches.
  useEffect(() => {
    setLocaleState(detectLocale());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Params, fallback?: string) => {
      let value = resolve(translations[locale], key);
      if (typeof value !== "string" && locale !== "en") {
        value = resolve(translations.en, key);
      }
      if (typeof value !== "string") return fallback ?? key;
      return interpolate(value, params);
    },
    [locale]
  );

  const tn = useCallback(
    (key: string, count: number, params?: Params) =>
      t(`${key}.${count === 1 ? "one" : "other"}`, { n: count, ...params }),
    [t]
  );

  const tc = useCallback(
    (text: string) => {
      const map = translations[locale]?.content;
      return map && typeof map[text] === "string" ? map[text] : text;
    },
    [locale]
  );

  const value = useMemo<I18nValue>(
    () => ({ locale, setLocale, t, tn, tc }),
    [locale, setLocale, t, tn, tc]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}