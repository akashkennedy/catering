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
  var _m = _t ? ((JSON.parse(_t).state || {}).mode || "light") : "light";
  if (_m !== "dark" && _m !== "light") {
    _m = "light";
  }
  document.documentElement.setAttribute("data-mantine-color-scheme", _m);
} catch (e) {
  document.documentElement.setAttribute("data-mantine-color-scheme", "light");
}`;

const THEME_COLOR_SYNC_SCRIPT = `(function(){
  var meta = document.querySelector('meta[name="theme-color"]');
  var colors = { light: "#ffffff", dark: "#26221c" };
  function sync() {
    var scheme = document.documentElement.getAttribute("data-mantine-color-scheme") || "light";
    if (meta) meta.setAttribute("content", colors[scheme] || colors.light);
  }
  sync();
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ["data-mantine-color-scheme"] });
})();`;

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Catering event management and costing app",
  applicationName: APP_NAME,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    shortcut: "/favicon.ico",
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#ffffff",
    "msapplication-tap-highlight": "no",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" {...mantineHtmlProps} className={`${catamaran.variable} antialiased`}>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_COLOR_SYNC_SCRIPT }} />
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