import { db } from "@/lib/db";

export const getTripsByUserId = async (userId: string) => {
  try {
    const trips = await db.trip.findMany({
      where: {
        users: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
        lists: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return trips;
  } catch (error) {
    console.error("Error fetching trips:", error);
    return [];
  }
};
