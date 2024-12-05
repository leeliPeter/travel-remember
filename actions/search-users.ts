"use server";

import { db } from "@/lib/db";

export interface SearchedUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export const searchUsers = async (email: string) => {
  try {
    const users = await db.user.findMany({
      where: {
        email: {
          contains: email,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: 5, // Limit to 5 results
    });

    if (!users.length) {
      return { error: "No users found with this email" };
    }

    return { users };
  } catch (error) {
    console.error("[SEARCH_USERS_ERROR]", error);
    return { error: "Failed to search user" };
  }
};
