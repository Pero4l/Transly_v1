import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";


import { ChatWidget } from "@/components/chat/ChatWidget";
import { SessionProvider } from "@/lib/sessionContext";
import { Toaster } from "sonner";
import { GoogleMapsProvider } from "@/components/providers/GoogleMapsProvider";

export const metadata: Metadata = {
  title: "Transly",
  description: "A professional and user-friendly platform sending deliveries.",
};

import { GoogleAuthProvider } from "@/components/auth/GoogleAuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className={`font-sans antialiased min-h-screen flex flex-col`}>
        {/* Suppression of console logs in production */}
        <Script
          id="suppress-logs"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                console.log = () => {};
                console.debug = () => {};
                console.info = () => {};
              }
            `,
          }}
        />

        <GoogleAuthProvider>
          <SessionProvider>
            <GoogleMapsProvider>
              <Toaster richColors position="top-center" />
              <main className="flex-1 flex flex-col">{children}</main>
              <ChatWidget />
            </GoogleMapsProvider>
          </SessionProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
