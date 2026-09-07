import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { StoreProvider } from "@/components/store-provider";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Сюжетник — помощник сценариста",
  description:
    "Мобильная библия сценария: персонажи, локации, карта взаимодействий и экспозиция.",
  applicationName: "Сюжетник",
  appleWebApp: {
    capable: true,
    title: "Сюжетник",
    statusBarStyle: "default",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#eef2f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-[var(--ink)]">
        <StoreProvider>
          <div className="app-shell flex min-h-full flex-1 flex-col">{children}</div>
        </StoreProvider>
      </body>
    </html>
  );
}
