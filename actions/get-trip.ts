"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function getTrip(tripId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const trip = await db.trip.findFirst({
      where: {
        id: tripId,
        users: {
          some: {
            userId: session.user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        description: true,
      },
    });

    if (!trip) {
      return { error: "Trip not found" };
    }

    return { success: true, trip };
  } catch (error) {
    console.error("[GET_TRIP]", error);
    return { error: "Something went wrong" };
  }
}
