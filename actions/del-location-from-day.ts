"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface DeleteLocationResponse {
  success?: string;
  error?: string;
}

export const deleteLocationFromDay = async (
  tripId: string,
  dayId: string,
  locationId: string
): Promise<DeleteLocationResponse> => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Get the current schedule
    const currentSchedule = await db.schedule.findUnique({
      where: {
        tripId: tripId,
      },
    });

    if (!currentSchedule) {
      return { error: "Schedule not found" };
    }

    // Parse the schedule data
    const scheduleData = currentSchedule.scheduleData as {
      days: {
        dayId: string;
        date: string;
        locations: {
          id: string;
          name: string;
          address: string;
          lat: number;
          lng: number;
          photoUrl?: string;
          arrivalTime?: string;
          departureTime?: string;
          type: string;
          createdAt: string;
          updatedAt: string;
          wayToCommute?: "DRIVING" | "WALKING" | "TRANSIT";
        }[];
      }[];
    };

    // Find the day and remove the location
    const updatedDays = scheduleData.days.map((day) => {
      if (day.dayId === dayId) {
        return {
          ...day,
          locations: day.locations.filter((loc) => loc.id !== locationId),
        };
      }
      return day;
    });

    // Update the schedule
    await db.schedule.update({
      where: {
        tripId: tripId,
      },
      data: {
        scheduleData: {
          ...scheduleData,
          days: updatedDays,
        },
        version: {
          increment: 1,
        },
      },
    });

    revalidatePath("/explore");

    return { success: "Location removed from day successfully" };
  } catch (error) {
    console.error("[DELETE_LOCATION_FROM_DAY_ERROR]", error);
    return { error: "Failed to remove location from day" };
  }
};
