
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import ThemeProvider from "@/components/layout/theme-provider";
import "./globals.css";

// This import will initialize Firebase on the client side.
// The config file itself ensures client-only features run only in the browser.
import '../lib/firebase/config';


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "InvestWise",
  description: "InvestWise - Your friendly guide to investing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInitializationScript = `
    (function() {
      const theme = localStorage.getItem('theme') || 'light';
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    })();
  `;
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body className={`${poppins.variable} font-body antialiased`}>
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
