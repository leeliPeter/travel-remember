"use server";

import { db } from "@/lib/db";

export interface TripUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
}

export const getUsersByTrip = async (tripId: string) => {
  try {
    const tripUsers = await db.userTrip.findMany({
      where: {
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

    if (!tripUsers) {
      return { error: "No users found for this trip" };
    }

    const formattedUsers = tripUsers.map((tripUser) => ({
      id: tripUser.user.id,
      name: tripUser.user.name,
      email: tripUser.user.email,
      image: tripUser.user.image,
      role: "USER", // You can extend this to include actual roles if needed
    }));

    return { users: formattedUsers };
  } catch (error) {
    console.error("[GET_USERS_BY_TRIP_ERROR]", error);
    return { error: "Failed to fetch trip users" };
  }
};
