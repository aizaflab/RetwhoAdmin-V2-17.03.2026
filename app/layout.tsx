import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import {
  ThemeProvider,
  AuthProvider,
  ConfirmProvider,
} from "@/components/providers";
import { Toaster } from "sonner";

// ১. Roboto (Google Font)
const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

// ২. Adikaz Pro (Local Font)
const adikazPro = localFont({
  src: [
    {
      path: "../public/fonts/Adikaz_Pro_Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Adikaz_Pro_Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-adikaz",
});

export const metadata: Metadata = {
  title: "Retwho-Admin",
  description: "Retwho-Admin - Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking script to prevent (Flash of Unstyled Content) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'system';
                  const root = document.documentElement;
                  
                  if (theme === 'dark') {
                    root.classList.add('dark');
                  } else if (theme === 'light') {
                    root.classList.remove('dark');
                  } else {
                    // system theme
                    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (isDark) {
                      root.classList.add('dark');
                    } else {
                      root.classList.remove('dark');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${adikazPro.variable} ${roboto.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ConfirmProvider>
            <ThemeProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </ThemeProvider>
          </ConfirmProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
