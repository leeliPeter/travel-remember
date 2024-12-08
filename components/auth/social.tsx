"use client";

import React from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Button } from "../ui/button";
import { signIn } from "next-auth/react";
import { default_login_redirect } from "@/routes";

export default function Social() {
  const onClick = (provider: "google" | "github") => {
    signIn(provider, { callbackUrl: default_login_redirect });
  };
  return (
    <div className="flex w-full flex-col items-centergap-2">
      <div className="relative py-1 sm:py-3">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 sm:px-4 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="flex items-center w-full gap-2">
        <Button
          size="lg"
          className="w-full"
          variant={"outline"}
          onClick={() => {
            onClick("github");
          }}
        >
          <FaGithub className="w-6 h-6" />
        </Button>
        <Button
          size="lg"
          className="w-full"
          variant={"outline"}
          onClick={() => {
            onClick("google");
          }}
        >
          <FcGoogle className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
