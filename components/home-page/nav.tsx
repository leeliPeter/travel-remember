"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

interface NavProps {
  isLogin: boolean;
}

export default function Nav({ isLogin }: NavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const links = [
    { href: "/explore", label: "Explore" },
    { href: "/mytrips", label: "My Trips" },
  ];

  if (pathname.includes("/auth/login") || pathname.includes("/auth/register")) {
    return null;
  }

  return (
    <div className="absolute z-10 w-full top-0 left-0 right-0">
      <div className="container mx-auto p-6">
        <div className="flex flex-row items-center justify-between">
          {/* left */}
          <div className="flex flex-row items-center space-x-16">
            <h2 className="text-4xl text-white font-bold">Travel</h2>
            <ul className="hidden md:flex items-center mt-6 space-x-10">
              {links.map(({ href, label }) => (
                <li
                  key={`${href}${label}`}
                  className="group flex flex-col items-center gap-2"
                >
                  <Link className="text-white text-lg font-bold" href={href}>
                    {label}
                  </Link>
                  <div className="group-hover:w-[80%] w-0 text-center duration-500 border-b-2 border-white mx-2"></div>
                </li>
              ))}
            </ul>
          </div>
          {/* right */}
          {!isLogin && (
            <div className="hidden md:flex items-center mt-2 space-x-10">
              <>
                <Button
                  className="bg-white rounded-full hover:text-white text-black"
                  onClick={() => router.push("/auth/register")}
                >
                  Sign Up
                </Button>
                <Button
                  className="bg-black hover:bg-white hover:text-black px-4 py-2 rounded-full text-white"
                  onClick={() => router.push("/auth/login")}
                >
                  Login
                </Button>
              </>
            </div>
          )}
        </div>
      </div>

      {/* mobile menu btn */}
      <div className="absolute top-10 right-10 z-10 md:hidden">
        <button
          type="button"
          onClick={toggleMenu}
          className="z-40 block hamburger focus:outline-none"
          aria-label="Toggle menu"
        >
          <span className={`hamburger-top ${isMenuOpen ? "open" : ""}`}></span>
          <span
            className={`hamburger-middle ${isMenuOpen ? "open" : ""}`}
          ></span>
          <span
            className={`hamburger-bottom ${isMenuOpen ? "open" : ""}`}
          ></span>
        </button>
      </div>

      {/* mobile menu */}
      <div
        className={`md:hidden overflow-hidden absolute bg-gray-900/90 w-screen duration-500 inset-0 ease-in-out ${
          isMenuOpen ? "h-[430px]" : "h-0"
        }`}
      >
        <ul className="flex flex-col items-center mt-20 space-y-8 w-full">
          {links.map(({ href, label }) => (
            <li
              key={`${href}${label}`}
              className="group flex flex-col items-center gap-2"
            >
              <Link className="text-white text-lg font-bold" href={href}>
                {label}
              </Link>
              <div className="group-hover:w-[80%] w-0 text-center duration-500 border-b-2 border-white mx-2"></div>
            </li>
          ))}
        </ul>
        <div className="flex flex-col items-center space-y-8 mt-14">
          <Link href="/auth/register">
            <Button className="bg-white w-40 rounded-full hover:text-white text-black">
              Sign Up
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button className="bg-black w-40 hover:bg-white hover:text-black px-4 py-2 rounded-full text-white">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
