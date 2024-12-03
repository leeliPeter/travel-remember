"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export interface LocationPlanInput {
  locationId: string;
  arrivalTime?: string | null;
  departureTime?: string | null;
  order: number;
}

export interface DayScheduleInput {
  date: Date;
  order: number;
  locations: LocationPlanInput[];
}

export interface UpdateScheduleParams {
  tripId: string;
  days: DayScheduleInput[];
}

export async function updateSchedule(params: UpdateScheduleParams) {
  // Log incoming data for debugging
  console.log("Received params:", JSON.stringify(params, null, 2));

  // Initial validation
  if (!params) {
    console.error("Params is null or undefined");
    return { error: "No data provided" };
  }

  if (typeof params !== "object") {
    console.error("Params is not an object:", typeof params);
    return { error: "Invalid data format" };
  }

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Validate required fields
    if (!params.tripId) {
      console.error("Missing tripId");
      return { error: "Trip ID is required" };
    }

    if (!Array.isArray(params.days)) {
      console.error("Days is not an array");
      return { error: "Invalid days format" };
    }

    // Validate days structure
    for (const day of params.days) {
      if (!day.date || !(day.date instanceof Date)) {
        console.error("Invalid date in day:", day);
        return { error: "Invalid date format" };
      }

      if (!Array.isArray(day.locations)) {
        console.error("Locations is not an array in day:", day);
        return { error: "Invalid locations format" };
      }

      for (const loc of day.locations) {
        if (!loc.locationId || typeof loc.locationId !== "string") {
          console.error("Invalid location:", loc);
          return { error: "Invalid location data" };
        }
      }
    }

    // Create schedule with validated data
    const schedule = await db.schedule.upsert({
      where: {
        tripId: params.tripId,
      },
      create: {
        tripId: params.tripId,
        days: {
          create: params.days.map((day) => ({
            date: new Date(day.date),
            order: day.order,
            locationPlans: {
              create: day.locations.map((loc) => ({
                location: {
                  connect: {
                    id: loc.locationId.startsWith("loc_")
                      ? loc.locationId.split("_")[2]
                      : loc.locationId,
                  },
                },
                arrivalTime: loc.arrivalTime || null,
                departureTime: loc.departureTime || null,
                order: loc.order,
              })),
            },
          })),
        },
      },
      update: {
        days: {
          deleteMany: {},
          create: params.days.map((day) => ({
            date: new Date(day.date),
            order: day.order,
            locationPlans: {
              create: day.locations.map((loc) => ({
                location: {
                  connect: {
                    id: loc.locationId.startsWith("loc_")
                      ? loc.locationId.split("_")[2]
                      : loc.locationId,
                  },
                },
                arrivalTime: loc.arrivalTime || null,
                departureTime: loc.departureTime || null,
                order: loc.order,
              })),
            },
          })),
        },
      },
      include: {
        days: {
          include: {
            locationPlans: {
              include: {
                location: true,
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return { success: "Schedule updated successfully", schedule };
  } catch (error) {
    console.error("[UPDATE_SCHEDULE_ERROR]", error);
    return { error: "Something went wrong" };
  }
}
