import "@/app/globals.css";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { DynamicThemeVars } from "@/components/dynamic-theme-vars";
import { ScrollbarWidth } from "@/components/scrollbar-width";
import { APP_CONFIG } from "@/utils/config/app";

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

const geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={APP_CONFIG.defaultLanguage}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <DynamicThemeVars />
      </head>
      <body
        suppressHydrationWarning
        className="flex min-h-screen flex-col bg-background text-foreground"
      >
        <ScrollbarWidth />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
