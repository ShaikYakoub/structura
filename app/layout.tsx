import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
// import { CustomCursor } from "@/components/ui/custom-cursor";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Structura - Build Websites in Minutes",
    template: "%s | Structura",
  },
  description:
    "The most powerful website builder for startups and creators. Create beautiful, professional websites without code.",
  keywords: [
    "website builder",
    "no-code",
    "landing page builder",
    "SaaS builder",
    "portfolio builder",
    "business website",
  ],
  authors: [{ name: "Structura" }],
  creator: "Structura",

  // Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://structura.com",
    title: "Structura - Build Websites in Minutes",
    description:
      "The most powerful website builder for startups and creators. Create beautiful, professional websites without code.",
    siteName: "Structura",
    images: [
      {
        url: "https://structura.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Structura - Website Builder",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Structura - Build Websites in Minutes",
    description: "The most powerful website builder for startups and creators.",
    images: ["https://structura.com/og-image.jpg"],
    creator: "@structura",
  },

  // Additional
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  verification: {
    google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body className={`${inter.className} overflow-x-hidden`}>
        {children}
        <Toaster position="top-center" />
        {/* Custom Cursor - Only renders on desktop */}
        {/* <CustomCursor /> */}
      </body>
    </html>
  );
}
