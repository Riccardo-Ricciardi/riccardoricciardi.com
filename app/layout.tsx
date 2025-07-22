import "@/app/globals.css";

import { ThemeProvider } from "@/components/themeManager";
import {
  LoadingProvider,
  GlobalLoader,
  InitLoader,
} from "@/components/loadingManager";
import { InitLanguage } from "@/components/languageManager";
import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_IMAGE_URL;

export const metadata: Metadata = {
  title: "Riccardo Ricciardi",
  description: "The official website of Riccardo Ricciardi",
  icons: `${BASE_URL}/Logo.png`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <InitLanguage />
        <LoadingProvider>
          <InitLoader />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <GlobalLoader />
        </LoadingProvider>
      </body>
    </html>
  );
}
