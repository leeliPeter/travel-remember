"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ScheduleData } from "@/types/schedule";

interface UpdateScheduleParams {
  tripId: string;
  scheduleData: ScheduleData;
}

export async function updateSchedule({
  tripId,
  scheduleData,
}: UpdateScheduleParams) {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return { error: "Unauthorized" };
    }

    // Verify user has access to this trip
    const trip = await db.trip.findFirst({
      where: {
        id: tripId,
        users: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        schedule: true,
      },
    });

    if (!trip) {
      return { error: "Trip not found or access denied" };
    }

    // Convert scheduleData to a plain object for Prisma JSON field
    const scheduleDataJson = {
      days: scheduleData.days.map((day) => ({
        dayId: day.dayId,
        date: day.date,
        locations: day.locations.map((loc) => ({
          id: loc.id,
          name: loc.name,
          address: loc.address,
          lat: loc.lat,
          lng: loc.lng,
          photoUrl: loc.photoUrl,
          arrivalTime: loc.arrivalTime,
          departureTime: loc.departureTime,
          wayToCommute: loc.wayToCommute || "DRIVING",
          type: loc.type,
          createdAt: loc.createdAt,
          updatedAt: loc.updatedAt,
        })),
      })),
    };

    // Update or create schedule
    const updatedSchedule = await db.schedule.upsert({
      where: {
        tripId: tripId,
      },
      create: {
        tripId: tripId,
        scheduleData: scheduleDataJson,
        version: 1,
      },
      update: {
        scheduleData: scheduleDataJson,
        version: {
          increment: 1,
        },
      },
    });

    revalidatePath("/explore");
    return {
      success: "Schedule updated successfully",
      schedule: updatedSchedule,
    };
  } catch (error) {
    console.error("[UPDATE_SCHEDULE_ERROR]", error);
    return { error: "Failed to update schedule" };
  }
}
