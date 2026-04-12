import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ChatWidget } from "@/components/chat/ChatWidget";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Transly",
  description: "A professional and user-friendly platform sending deliveries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <main className="flex-1 flex flex-col">{children}</main>
        <ChatWidget />
      </body>
    </html>
  );
}
