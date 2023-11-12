import { AuthProvider } from "@/context/AuthProvider";
import MessageCompletionProvider from "@/context/ChatCompletionProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";

export default function App({ Component, pageProps }: AppProps) {
  if (typeof window !== "undefined") {
    const isDarkSet = localStorage.theme === "dark";
    const isThemeStored = "theme" in localStorage;
    const isDarkPrefered = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (isDarkSet || (!isThemeStored && isDarkPrefered)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  return (
    <>
      <AuthProvider>
        <MessageCompletionProvider>
          <Component {...pageProps} />
        </MessageCompletionProvider>
      </AuthProvider>
      <Analytics />
    </>
  );
}
