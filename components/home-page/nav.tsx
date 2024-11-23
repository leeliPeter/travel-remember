"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { FaUser } from "react-icons/fa";
import { ExtendedUser } from "@/next-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IoPerson } from "react-icons/io5";
import { ExitIcon } from "@radix-ui/react-icons";
import { LogoutBtn } from "@/components/auth/logout-btn";

interface NavProps {
  user: ExtendedUser | null;
}

export default function Nav({ user }: NavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavigation = (href: string) => {
    closeMenu();
    router.push(href);
  };

  const links = [
    { href: "/explore", label: "Explore" },
    { href: "/mytrips", label: "My Trips" },
  ];

  // with start with /auth return null
  if (pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <div className="absolute z-10 w-full top-0 left-0 right-0">
      <div className="container mx-auto p-6">
        <div className="flex flex-row items-center justify-between">
          {/* left */}
          <div className="flex flex-row items-center space-x-16">
            <Link href="/">
              <h2 className="text-4xl text-white font-bold">Travel</h2>
            </Link>
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
          {!user ? (
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
          ) : (
            <div className="hidden md:block  ">
              <div className="flex flex-row items-center mt-2  gap-4">
                <div className="text-white font-semibold mt-2">
                  {user?.email}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Avatar>
                      <AvatarImage
                        className="rounded-full w-10 h-10"
                        src={user?.image || ""}
                      />
                      <AvatarFallback className="  text-white">
                        <div className="flex items-center justify-center h-10 w-10 bg-gray-400 overflow-hidden rounded-full">
                          <FaUser className="w-8 h-8 mt-2" />
                        </div>
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-40 hidden md:block"
                    align="end"
                  >
                    <Link href="/member">
                      <DropdownMenuItem>
                        <IoPerson className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                    </Link>
                    <LogoutBtn>
                      <DropdownMenuItem>
                        <ExitIcon className="w-4 h-4 mr-2" />
                        Sign out
                      </DropdownMenuItem>
                    </LogoutBtn>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden absolute bg-gray-900/90 w-screen duration-500 inset-0 ease-in-out ${
          isMenuOpen ? "h-[430px]" : "h-0"
        }`}
      >
        <ul className="flex flex-col items-center mt-14 space-y-6 w-full">
          {user && (
            <div className="flex flex-col items-center gap-y-6">
              <Avatar className="">
                <AvatarImage
                  className="w-10 h-10 rounded-full"
                  src={user?.image || ""}
                />
                <AvatarFallback className=" text-white">
                  <div className="flex items-center justify-center h-10 w-10 bg-gray-400 overflow-hidden rounded-full">
                    <FaUser className="w-8 h-8 mt-2" />
                  </div>
                </AvatarFallback>
              </Avatar>
              <div className="text-white">{user.name}</div>
              <Button
                className="bg-white w-40 rounded-full hover:text-white text-black"
                onClick={() => handleNavigation("/member")}
              >
                Profile
              </Button>
            </div>
          )}
          <li className="group flex flex-col items-center gap-2">
            <Link
              className="text-white text-lg font-bold"
              href="/explore"
              onClick={closeMenu}
            >
              Explore
            </Link>
            <div className="group-hover:w-[80%] w-0 text-center duration-500 border-b-2 border-white mx-2"></div>
          </li>
          <li className="group flex flex-col items-center gap-2">
            <Link
              className="text-white text-lg font-bold"
              href="/mytrips"
              onClick={closeMenu}
            >
              My Trips
            </Link>
            <div className="group-hover:w-[80%] w-0 text-center duration-500 border-b-2 border-white mx-2"></div>
          </li>
        </ul>
        {!user ? (
          <div className="flex flex-col items-center space-y-8 mt-14">
            <Button
              className="bg-white w-40 rounded-full hover:text-white text-black"
              onClick={() => handleNavigation("/auth/register")}
            >
              Sign Up
            </Button>
            <Button
              className="bg-black w-40 hover:bg-white hover:text-black px-4 py-2 rounded-full text-white"
              onClick={() => handleNavigation("/auth/login")}
            >
              Login
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-8 mt-8">
            <LogoutBtn>
              <Button
                className="bg-black w-40 rounded-full hover:text-white text-white"
                onClick={closeMenu}
              >
                Logout
              </Button>
            </LogoutBtn>
          </div>
        )}
      </div>
    </div>
  );
}
