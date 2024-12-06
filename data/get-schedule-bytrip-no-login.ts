"use server";
import { db } from "@/lib/db";

export async function getScheduleByTripNoLogin(tripId: string) {
  try {
    if (!tripId) {
      return { success: false };
    }

    const schedule = await db.schedule.findFirst({
      where: {
        tripId: tripId,
      },
      select: {
        id: true,
        scheduleData: true,
        version: true,
        createdAt: true,
        updatedAt: true,
        trip: {
          select: {
            name: true,
            description: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!schedule || !schedule.trip) {
      return { success: false };
    }

    return {
      success: true,
      schedule: schedule,
      trip: {
        name: schedule.trip.name,
        description: schedule.trip.description,
        startDate: schedule.trip.startDate,
        endDate: schedule.trip.endDate,
      },
    };
  } catch (error) {
    console.error("[GET_PUBLIC_SCHEDULE_ERROR]", error);
    return { success: false };
  }
}
