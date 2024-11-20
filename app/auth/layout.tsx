export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col pt-[10%] md:pt-0 sm:justify-center h-screen login-bg">
      {children}
    </div>
  );
}
