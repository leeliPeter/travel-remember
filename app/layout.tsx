import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/home-page/nav";

export const metadata: Metadata = {
  title: "Travel",
  description: "Plan your next trip",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="relative">
          <Nav />
          {children}
        </div>
      </body>
    </html>
  );
}
