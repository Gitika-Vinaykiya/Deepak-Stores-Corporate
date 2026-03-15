import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ShortlistProvider } from "@/context/ShortlistContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { isAdminAuthenticated } from "@/lib/auth";
import { Header } from "@/components/Header";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "Deepak Stores | Corporate Gifting Catalog",
  description: "Browse and shortlist corporate gifts from Deepak Stores",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAdmin = await isAdminAuthenticated();

  return (
    <html lang="en" className={dmSans.variable}>
      <body className="min-h-screen bg-surface-50 font-sans antialiased">
        <AdminAuthProvider isAdmin={isAdmin}>
          <ShortlistProvider>
            <Header />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 min-h-[calc(100vh-120px)]">{children}</main>
          </ShortlistProvider>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
