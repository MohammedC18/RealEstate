import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/index.css";
import App from "@/App";
import PremiumLoader from "@/components/PremiumLoader";
import { loadAnalytics } from "@/lib/analytics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

function AppShell() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    loadAnalytics();
    // Service worker registration (PWA)
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      });
    }
    const t = setTimeout(() => setReady(true), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {!ready && <PremiumLoader />}
      <App />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  </React.StrictMode>,
);
