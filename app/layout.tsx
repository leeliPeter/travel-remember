import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/home-page/nav";
import { SessionProvider } from "next-auth/react";
import { UserNav } from "@/components/home-page/userNav";
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
          <div className="relative ">
            <Nav isLogin={session ? true : false} />
            {session && (
              <div className="hidden md:block">
                <UserNav />
              </div>
            )}
            {children}
          </div>
        </body>
      </html>
    </SessionProvider>
  );
}
