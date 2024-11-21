import { getTripsByUserId } from "@/data/getTripByUserId";
import { currentUser } from "@/lib/auth";
import ClientTripPage from "./_components/client-page";

export default async function TripPage() {
  const user = await currentUser();
  const trips = user?.id ? await getTripsByUserId(user.id) : [];

  return <ClientTripPage initialTrips={trips} />;
}
