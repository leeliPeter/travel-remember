import React from "react";
import BackBtn from "./back-btn";
import Social from "./social";
import Header from "./header";
import { IoMdClose } from "react-icons/io";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
}

export default function CardWrapper({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial,
}: CardWrapperProps) {
  return (
    <Card className="w-[90%] relative mx-auto sm:w-[400px] shadow-md">
      <Link className="absolute top-4 right-4 text-xl" href="/">
        <IoMdClose />
      </Link>
      <CardHeader>
        <Header label={headerLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocial && (
        <CardFooter>
          <Social />
        </CardFooter>
      )}
      <CardFooter>
        <BackBtn label={backButtonLabel} href={backButtonHref} />
      </CardFooter>
    </Card>
  );
}
