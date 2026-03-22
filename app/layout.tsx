import type { Metadata } from "next";
import "./globals.css";

import {
  ThemeProvider,
  AuthProvider,
  ConfirmProvider,
} from "@/components/providers";
import { Toaster } from "sonner";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
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
                  const theme = localStorage.getItem('adminTheme') || 'system';
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
        className={` ${poppins.variable} antialiased`}
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
