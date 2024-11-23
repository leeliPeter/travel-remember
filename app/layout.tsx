import type { Metadata } from "next";
import "./globals.css";
import NavWrapper from "@/components/home-page/nav-wrapper";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

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
      <html lang="en">
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
