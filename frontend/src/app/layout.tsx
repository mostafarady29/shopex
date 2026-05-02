import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Chatbot from "@/components/ui/Chatbot";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  themeColor: "#FF9900",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "ShopEx — Shop Smart, Live Better",
  description:
    "Discover millions of products at unbeatable prices. Fast delivery, easy returns, and a shopping experience built for the modern age.",
  keywords: "ecommerce, online shopping, deals, electronics, fashion, home",
  authors: [{ name: "ShopEx" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ShopEx",
  },
  openGraph: {
    title: "ShopEx — Shop Smart, Live Better",
    description:
      "Discover millions of products at unbeatable prices.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-[#111111]">
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
