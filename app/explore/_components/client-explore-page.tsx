"use client";

import { useSearchParams } from "next/navigation";
import SearchLocation from "./search-location";
import PlanTrip from "./plan-trip";
import Share from "./share";

export default function ClientExplorePage() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "search";
  const tripId = searchParams.get("tripId");

  const renderContent = () => {
    switch (view) {
      case "plan":
        return <PlanTrip tripId={tripId} />;
      case "share":
        return <Share tripId={tripId} />;
      default:
        return <SearchLocation />;
    }
  };

  return <div>{renderContent()}</div>;
}
