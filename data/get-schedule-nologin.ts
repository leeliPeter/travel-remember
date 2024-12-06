"use server";

import { db } from "@/lib/db";

export async function getScheduleNoLogin(tripId: string) {
  try {
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
      },
    });

    if (!schedule) {
      return { success: false };
    }

    return { success: true, schedule };
  } catch (error) {
    console.error("[GET_SCHEDULE_NO_LOGIN]", error);
    return { success: false };
  }
}
