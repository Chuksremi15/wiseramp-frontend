"use client";

import { Header } from "@/components/header";
import { Toaster } from "@/components/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import { ProgressProvider } from "@bprogress/next/app";
import { HeroUIProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemedProgressProvider = () => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  const currentTheme = resolvedTheme || theme;
  const progressColor = currentTheme === "dark" ? "#ffffff" : "#000000";

  return (
    <ProgressProvider
      height="0px"
      color={progressColor}
      options={{ showSpinner: true }}
      shallowRouting
    />
  );
};

const SectionWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-section-backround relative">
        <Header />
        <ThemedProgressProvider />
        <main className="relative flex flex-col flex-1">{children}</main>
        {/* <Footer /> */}
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {mounted ? (
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <HeroUIProvider>
                <SectionWrapper>{children}</SectionWrapper>
              </HeroUIProvider>
            </ThemeProvider>
          ) : (
            <div className="min-h-screen bg-black" />
          )}
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}
