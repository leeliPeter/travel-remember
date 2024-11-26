"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function deleteList(listId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Check if user has access to this list through the trip
    const list = await db.list.findFirst({
      where: {
        id: listId,
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
      return { error: "List not found" };
    }

    await db.list.delete({
      where: {
        id: listId,
      },
    });

    revalidatePath("/explore");
    return { success: "List deleted successfully" };
  } catch (error) {
    console.error("[DELETE_LIST]", error);
    return { error: "Something went wrong" };
  }
}
