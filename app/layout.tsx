import "@/app/globals.css";
import { Metadata } from "next";
import {
  InitLoader,
  GlobalLoader,
  LoadingProvider,
} from "@/components/loadingManager";
import { ThemeProvider } from "@/components/themeManager";
import { InitLanguage } from "@/components/languageManager";
import { SpeedInsights } from "@vercel/speed-insights/next";

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_IMAGE_URL;

export const metadata: Metadata = {
  title: "Riccardo Ricciardi",
  description: "The official website of Riccardo Ricciardi",
  icons: BASE_URL ? `${BASE_URL}/Logo.png` : "/logo.png",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LoadingProvider>
          <InitLoader />
          <InitLanguage />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <SpeedInsights />
          </ThemeProvider>
          <GlobalLoader />
        </LoadingProvider>
      </body>
    </html>
  );
}
