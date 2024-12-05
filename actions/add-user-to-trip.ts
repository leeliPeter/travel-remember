"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface AddUserResponse {
  success?: string;
  error?: string;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
}

export const addUserToTrip = async (
  userId: string,
  tripId: string
): Promise<AddUserResponse> => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Check if user is already in the trip - now including user details
    const existingMember = await db.userTrip.findFirst({
      where: {
        userId: userId,
        tripId: tripId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (existingMember) {
      const userName = existingMember.user.name || "This user";
      return {
        error: "ALREADY_MEMBER",
        user: {
          id: existingMember.user.id,
          name: existingMember.user.name,
          email: existingMember.user.email,
          image: existingMember.user.image,
          role: "USER",
        },
      };
    }

    // Check if current user has permission to add users to this trip
    const currentUserTrip = await db.userTrip.findFirst({
      where: {
        userId: session.user.id,
        tripId: tripId,
      },
    });

    if (!currentUserTrip) {
      return { error: "You don't have permission to add users to this trip" };
    }

    // Add user to trip
    const userTrip = await db.userTrip.create({
      data: {
        userId: userId,
        tripId: tripId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    revalidatePath("/mytrips");

    return {
      success: "User added to trip successfully",
      user: {
        id: userTrip.user.id,
        name: userTrip.user.name,
        email: userTrip.user.email,
        image: userTrip.user.image,
        role: "USER",
      },
    };
  } catch (error) {
    console.error("[ADD_USER_TO_TRIP_ERROR]", error);
    return { error: "Failed to add user to trip" };
  }
};
