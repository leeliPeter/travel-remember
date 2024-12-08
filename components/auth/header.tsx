import React from "react";
import Image from "next/image";
interface HeaderProps {
  label: string;
}

export default function Header({ label }: HeaderProps) {
  return (
    <div className="w-full flex flex-col -mb-2 md:-mb-0 gap-2 md:gap-4 items-center justify-center">
      {/* <h1 className="text-3xl">🚃 Auth </h1> */}
      <div className="flex items-center -ml-2 gap-2">
        <Image
          src="/images/icon.jpg"
          alt="logo"
          width={100}
          height={100}
          className="w-10 h-10"
        />
        <Image
          src="/images/black-logo.png"
          alt="logo"
          width={100}
          height={100}
          className="h-10 w-auto "
        />
      </div>
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
}
