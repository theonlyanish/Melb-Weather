import type { Metadata } from "next";
import { Epilogue, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["700", "900"], // Black or ExtraBold
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"], // Regular, Medium, SemiBold
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://localsky.app'),
  title: {
    default: "LocalSky - Australian Weather Forecast | Melbourne, Sydney, Brisbane & More",
    template: "%s | LocalSky"
  },
  description: "Get accurate weather forecasts for Australian cities including Melbourne, Sydney, Brisbane, Perth, and Hobart. Real-time weather data, hourly forecasts, air quality, and local weather stories with personality.",
  keywords: [
    "Australian weather",
    "Melbourne weather",
    "Sydney weather",
    "Brisbane weather",
    "Perth weather",
    "Hobart weather",
    "weather forecast Australia",
    "Australian weather app",
    "weather dashboard",
    "hourly weather forecast",
    "daily weather forecast",
    "air quality Australia",
    "weather stories",
    "local weather",
    "regional weather Australia"
  ],
  authors: [{ name: "Anish Kapse", url: "https://anishkapse.com" }],
  creator: "Anish Kapse",
  publisher: "LocalSky",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "/",
    siteName: "LocalSky",
    title: "LocalSky - Australian Weather Forecast",
    description: "Get accurate weather forecasts for Australian cities with real-time data, hourly forecasts, and local weather stories.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LocalSky - Australian Weather Forecast",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LocalSky - Australian Weather Forecast",
    description: "Get accurate weather forecasts for Australian cities with real-time data and local weather stories.",
    images: ["/og-image.png"],
    creator: "@anishkapse",
  },
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
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  alternates: {
    canonical: "/",
  },
  category: "Weather",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <body
        className={`${epilogue.variable} ${inter.variable} antialiased font-sans`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
          >
            {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
