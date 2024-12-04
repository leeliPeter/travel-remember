"use server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function getScheduleByTripId(tripId: string) {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return { error: "Unauthorized" };
    }

    // Verify user has access to this trip and get schedule
    const schedule = await db.schedule.findFirst({
      where: {
        tripId: tripId,
        trip: {
          users: {
            some: {
              userId: user.id,
            },
          },
        },
      },
      select: {
        id: true,
        scheduleData: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!schedule) {
      return { error: "Schedule not found or access denied" };
    }

    return { success: true, schedule };
  } catch (error) {
    console.error("[GET_SCHEDULE_ERROR]", error);
    return { error: "Failed to fetch schedule" };
  }
}
