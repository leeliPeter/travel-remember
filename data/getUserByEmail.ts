import { db } from "@/lib/db";

export interface SearchedUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export const getUserByEmail = async (email: string) => {
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
      take: 5,
    });

    if (!users.length) {
      return { error: "No users found with this email" };
    }

    return { users };
  } catch (error) {
    console.error("[GET_USER_BY_EMAIL_ERROR]", error);
    return { error: "Failed to search user" };
  }
};
