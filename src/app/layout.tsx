import type { Metadata, Viewport } from "next";
import { mantineHtmlProps } from "@mantine/core";
import { Catamaran } from "next/font/google";

import AppLayout from "@/components/AppLayout";
import { ReminderNotifier } from "@/components/ReminderNotifier";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const catamaran = Catamaran({
  variable: "--font-catamaran",
  subsets: ["latin", "tamil"],
  weight: ["400", "600", "700"],
});

const APP_NAME = "Catering CRM";

const THEME_BOOTSTRAP_SCRIPT = `try {
  var _t = window.localStorage.getItem("catering-theme");
  var _m = _t ? ((JSON.parse(_t).state || {}).mode || "auto") : "auto";
  if (_m === "auto") {
    _m = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.documentElement.setAttribute("data-mantine-color-scheme", _m);
} catch (e) {
  document.documentElement.setAttribute("data-mantine-color-scheme", "light");
}`;

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
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <AppLayout>{children}</AppLayout>
          <ReminderNotifier />
        </ThemeProvider>
      </body>
    </html>
  );
}