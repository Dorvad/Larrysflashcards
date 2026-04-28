import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Larry's Flashcards",
  description: "Hebrew vocabulary practice — just for Larry",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Larry's Flashcards",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow pinch-zoom for accessibility
  userScalable: true,
  themeColor: "#1a6fd4",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Inter for English UI; Noto Serif Hebrew for Hebrew text */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Serif+Hebrew:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={
          {
            "--font-sans": "'Inter'",
            "--font-hebrew": "'Noto Serif Hebrew'",
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
