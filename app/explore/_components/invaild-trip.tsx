import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function InvalidTrip() {
  return (
    <div className="h-[90vh] flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md mx-auto -mt-20 px-4 py-4 md:px-8  bg-white/90 rounded-xl shadow-xl">
        <div className="space-y-4">
          <div className="relative">
            <svg
              className="w-16 h-16 md:w-18 md:h-18 text-red-500 mx-auto animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-100 rounded-full opacity-50" />
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-red-100 rounded-full opacity-50" />
          </div>

          <h2 className="text-md md:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">
            Oops! No Trip Selected
          </h2>

          <div className="bg-gray-50 text-sm md:text-base p-2 md:p-4 rounded-lg">
            <p className="text-gray-600  leading-relaxed">
              It looks like you haven't selected a trip yet!
              <span className="block mt-2  text-sm">
                Head over to "My Trips" to choose a trip and start planning your
                adventure.
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Link href="/mytrips" className="block">
            <Button className="w-full text-sm md:text-base lg:text-lg bg-blue-500 hover:bg-blue-600 text-white py-4 md:py-6 transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg">
              <span className="mr-2">🎯</span>
              Go to My Trips
            </Button>
          </Link>

          <p className="text-sm underline text-gray-500">
            <Link href="https://www.instagram.com/leelitam">
              Need help? Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
