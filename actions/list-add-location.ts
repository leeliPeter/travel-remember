"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { LocationToAdd } from "@/types";

export async function addLocationToList(
  listId: string,
  location: LocationToAdd
) {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return { error: "Unauthorized" };
    }

    // Verify user has access to this list through the trip
    const list = await db.list.findFirst({
      where: {
        id: listId,
        trip: {
          users: {
            some: {
              userId: user.id,
            },
          },
        },
      },
    });

    if (!list) {
      return { error: "List not found or access denied" };
    }

    // Add location to the list
    const newLocation = await db.location.create({
      data: {
        name: location.name,
        address: location.address,
        lat: location.lat,
        lng: location.lng,
        photoUrl: location.photoUrl || null,
        listId: listId,
      },
    });

    revalidatePath("/explore");
    return { success: "Location added to list", location: newLocation };
  } catch (error) {
    console.error("[ADD_LOCATION_TO_LIST]", error);
    return { error: "Failed to add location to list" };
  }
}

export async function removeLocationFromList(locationId: string) {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return { error: "Unauthorized" };
    }

    // Verify user has access to this location through the trip
    const location = await db.location.findFirst({
      where: {
        id: locationId,
        list: {
          trip: {
            users: {
              some: {
                userId: user.id,
              },
            },
          },
        },
      },
    });

    if (!location) {
      return { error: "Location not found or access denied" };
    }

    // Remove the location
    await db.location.delete({
      where: {
        id: locationId,
      },
    });

    revalidatePath("/explore");
    return { success: "Location removed from list" };
  } catch (error) {
    console.error("[REMOVE_LOCATION_FROM_LIST]", error);
    return { error: "Failed to remove location from list" };
  }
}
