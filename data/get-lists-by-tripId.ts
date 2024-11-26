"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export const getListsByTripId = async (tripId: string) => {
  try {
    const session = await auth();
    console.log("Session:", session);

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const lists = await db.list.findMany({
      where: {
        tripId: tripId,
        trip: {
          users: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
      include: {
        locations: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Lists found:", lists);

    return { success: true, lists };
  } catch (error) {
    console.error("Error fetching lists:", error);
    return { error: "Failed to fetch lists" };
  }
};
