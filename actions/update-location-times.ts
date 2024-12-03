"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

interface UpdateLocationTimesParams {
  locationPlanId: string;
  arrivalTime?: string;
  departureTime?: string;
}

export async function updateLocationTimes(params: UpdateLocationTimesParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Verify user has access to this location through the schedule and trip
    const locationPlan = await db.locationPlan.findFirst({
      where: {
        id: params.locationPlanId,
        daySchedule: {
          schedule: {
            trip: {
              users: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          },
        },
      },
    });

    if (!locationPlan) {
      return { error: "Location plan not found or access denied" };
    }

    // Update the times
    const updatedLocationPlan = await db.locationPlan.update({
      where: {
        id: params.locationPlanId,
      },
      data: {
        arrivalTime: params.arrivalTime,
        departureTime: params.departureTime,
      },
    });

    return {
      success: "Times updated successfully",
      locationPlan: updatedLocationPlan,
    };
  } catch (error) {
    console.error("[UPDATE_LOCATION_TIMES_ERROR]", error);
    return { error: "Something went wrong" };
  }
}
