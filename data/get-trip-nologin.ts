"use server";

import { db } from "@/lib/db";

export async function getTripNoLogin(tripId: string) {
  try {
    const trip = await db.trip.findUnique({
      where: {
        id: tripId,
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
      return { success: false };
    }

    return { success: true, trip };
  } catch (error) {
    console.error("[GET_TRIP_NO_LOGIN]", error);
    return { success: false };
  }
}
