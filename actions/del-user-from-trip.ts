"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface DeleteUserResponse {
  success?: string;
  error?: string;
}

export const deleteUserFromTrip = async (
  userIdToDelete: string,
  tripId: string
): Promise<DeleteUserResponse> => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Check if current user has permission to remove users from this trip
    const currentUserTrip = await db.userTrip.findFirst({
      where: {
        userId: session.user.id,
        tripId: tripId,
      },
    });

    if (!currentUserTrip) {
      return {
        error: "You don't have permission to remove users from this trip",
      };
    }

    // Don't allow users to remove themselves
    if (userIdToDelete === session.user.id) {
      return { error: "You cannot remove yourself from the trip" };
    }

    // Delete the user from the trip
    await db.userTrip.delete({
      where: {
        userId_tripId: {
          userId: userIdToDelete,
          tripId: tripId,
        },
      },
    });

    revalidatePath("/mytrips");

    return { success: "User removed from trip successfully" };
  } catch (error) {
    console.error("[DELETE_USER_FROM_TRIP_ERROR]", error);
    return { error: "Failed to remove user from trip" };
  }
};
