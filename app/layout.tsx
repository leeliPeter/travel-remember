import type { Metadata } from "next";
import "./globals.css";
import NavWrapper from "@/components/home-page/nav-wrapper";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Josefin_Sans } from "next/font/google";

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Plan Travel",
    template: "%s | Plan Travel",
  },
  description:
    "Plan Travel - Simplify your trip planning by searching locations, creating schedules with drag and drop, and collaborating with friends. Make your next adventure planning effortless and enjoyable.",
  keywords: [
    "trip planning",
    "travel schedule",
    "collaborative planning",
    "drag and drop itinerary",
    "location search",
    "travel planner",
  ],
  authors: [{ name: "Lei Ieong Tam" }],
  creator: "Lei Ieong Tam",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.theplantravel.com",
    title: "Plan Travel - Smart Trip Planning Made Easy",
    description:
      "Plan Travel - Simplify your trip planning by searching locations, creating schedules with drag and drop, and collaborating with friends.",
    siteName: "Plan Travel",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plan Travel",
    description:
      "Smart trip planning with location search, drag & drop scheduling, and friend collaboration.",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html lang="en" className={josefinSans.className}>
        <body>
          <div className="relative">
            <NavWrapper />
            {children}
          </div>
        </body>
      </html>
    </SessionProvider>
  );
}
