"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

interface AddLocationParams {
  name: string;
  address: string;
  lat: number;
  lng: number;
  photoUrl: string | null;
  placeId: string;
  listId: string;
}

export async function addLocation(params: AddLocationParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Verify user has access to this list through the trip
    const list = await db.list.findFirst({
      where: {
        id: params.listId,
        trip: {
          users: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!list) {
      return { error: "List not found or access denied" };
    }

    // Create the location
    const location = await db.location.create({
      data: {
        name: params.name,
        address: params.address,
        lat: params.lat,
        lng: params.lng,
        photoUrl: params.photoUrl,
        placeId: params.placeId,
        listId: params.listId,
      },
    });

    return {
      success: "Location added successfully",
      location: location,
    };
  } catch (error) {
    console.error("[ADD_LOCATION]", error);
    return { error: "Something went wrong" };
  }
}
