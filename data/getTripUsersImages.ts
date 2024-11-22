"use server";

import { db } from "@/lib/db";

export async function getTripUsersImages(tripId: string) {
  try {
    const tripWithUsers = await db.trip.findUnique({
      where: { id: tripId },
      include: {
        users: {
          include: {
            user: {
              select: {
                image: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!tripWithUsers) return [];

    return tripWithUsers.users.map((userTrip) => ({
      image: userTrip.user.image || "/default-avatar.png",
      name: userTrip.user.name,
    }));
  } catch (error) {
    console.error("Error fetching trip users' images:", error);
    return [];
  }
}
