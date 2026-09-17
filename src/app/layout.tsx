import type { Metadata, Viewport } from "next";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import { Catamaran } from "next/font/google";

import { theme } from "@/theme";
import AppLayout from "@/components/AppLayout";
import { ReminderNotifier } from "@/components/ReminderNotifier";
import "./globals.css";

const catamaran = Catamaran({
  variable: "--font-catamaran",
  subsets: ["latin", "tamil"],
  weight: ["400", "600", "700"],
});

const APP_NAME = "Catering CRM";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Catering event management and costing app",
  applicationName: APP_NAME,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    shortcut: "/favicon.ico",
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#1971c2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" {...mantineHtmlProps} className={`${catamaran.variable} antialiased`}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <AppLayout>{children}</AppLayout>
          <ReminderNotifier />
        </MantineProvider>
      </body>
    </html>
  );
}