import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";

interface BackBtnProps {
  label: string;
  href: string;
}

export default function BackBtn({ label, href }: BackBtnProps) {
  return (
    <Button variant="link" className="w-full font-normal" size={"sm"} asChild>
      <Link href={href}>{label}</Link>
    </Button>
  );
}
