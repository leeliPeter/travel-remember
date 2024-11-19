import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);
import {
  default_login_redirect,
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
} from "@/routes";
export default auth(async (req) => {
  const { nextUrl } = req;
  const isLogin = !!req.auth?.user;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return;
  }
  if (isAuthRoute) {
    if (isLogin) {
      //absolute redirect
      return Response.redirect(new URL(default_login_redirect, nextUrl));
    }
    return;
  }

  if (!isLogin && !isPublicRoute) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }
  return;
});

export const config = {
  matcher: [
    // clerk routes
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
