"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function deleteLocation(locationId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Verify user has access to this location through the list and trip
    const location = await db.location.findFirst({
      where: {
        id: locationId,
        list: {
          trip: {
            users: {
              some: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!location) {
      return { error: "Location not found or access denied" };
    }

    await db.location.delete({
      where: {
        id: locationId,
      },
    });

    return { success: "Location deleted successfully" };
  } catch (error) {
    console.error("[DELETE_LOCATION]", error);
    return { error: "Something went wrong" };
  }
}
