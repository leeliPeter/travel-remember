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

  // Determine margin based on current view
  const navMargin = currentView === "plan" ? "mr-20" : "mr-auto";

  return (
    <>
      <div className="trip-page w-full pb-6 h-full min-h-screen pt-[68px] md:pt-22 ">
        <div className="mx-auto px-4">
          <div
            className={`nav w-[70%] min-w-[250px] container ${navMargin} md:mr-auto text-sm md:text-base mx-auto h-11 md:h-12 bg-white/20 backdrop-blur-sm space-x-2 rounded-lg mb-2 md:mb-6 flex justify-between items-center px-2`}
          >
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
          </div>
          {children}
        </div>
      </div>
      <Toaster position="bottom-right" />
    </>
  );
}
