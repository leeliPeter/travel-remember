"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Toaster } from "sonner";

interface ExploreLayoutProps {
  children: ReactNode;
}

export default function ExploreLayout({ children }: ExploreLayoutProps) {
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "search";
  const tripId = searchParams.get("tripId");

  return (
    <>
      <div className="trip-page pb-6 h-full min-h-screen pt-[68px] md:pt-20 ">
        <div className=" mx-auto px-4">
          <div className="nav w-full container mx-auto h-12 bg-white/20 backdrop-blur-sm space-x-2 rounded-lg mb-2 md:mb-6 flex justify-between items-center px-2">
            <Link
              href={`/explore?view=search${tripId ? `&tripId=${tripId}` : ""}`}
              className={`explore-nav cursor-pointer hover:text-primary transition-colors
                ${currentView === "search" ? "active" : ""}`}
            >
              Search
            </Link>
            <Link
              href={`/explore?view=plan${tripId ? `&tripId=${tripId}` : ""}`}
              className={`explore-nav cursor-pointer hover:text-primary transition-colors
                ${currentView === "plan" ? "active" : ""}`}
            >
              Plan Trip
            </Link>
            <Link
              href={`/explore?view=share${tripId ? `&tripId=${tripId}` : ""}`}
              className={`explore-nav cursor-pointer hover:text-primary transition-colors
                ${currentView === "share" ? "active" : ""}`}
            >
              Share
            </Link>
          </div>
          {children}
        </div>
      </div>
      <Toaster position="bottom-right" />
    </>
  );
}
