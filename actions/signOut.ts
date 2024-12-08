"use server";
import { signOut } from "@/auth";

export const signOutAction = async () => {
  await signOut();
  return Response.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL!));
};
