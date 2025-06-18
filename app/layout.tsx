import "@/app/globals.css";

import { ThemeProvider } from "@/components/themePicker";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Riccardo Ricciardi",
  description: "The official website of Riccardo Ricciardi",
  icons:
    "https://yfzqurdmbllthonjdzpb.supabase.co/storage/v1/object/public/image//Logo.png",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
