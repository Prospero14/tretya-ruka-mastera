import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { StoreProvider } from "@/components/store-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { ReminderPopup } from "@/components/reminder-popup";
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
  title: "Сюжетник — помощник мастера",
  description:
    "Записная книжка для настольных ролёвок: PC/NPC, локации, связи, синопсис и экспозиция.",
  applicationName: "Сюжетник",
  appleWebApp: {
    capable: true,
    title: "Сюжетник",
    statusBarStyle: "default",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef2f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0f141c" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('syuzhetnik.theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}var r=document.documentElement;r.classList.toggle('dark',t==='dark');r.dataset.theme=t;r.style.colorScheme=t;}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col font-sans text-[var(--ink)]">
        <ThemeProvider>
          <StoreProvider>
            <div className="app-shell flex min-h-full flex-1 flex-col">{children}</div>
            <ReminderPopup />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
