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
  title: "Travel",
  description: "Plan your next trip",
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
