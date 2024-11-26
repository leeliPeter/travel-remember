"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

interface CreateListParams {
  name: string;
  tripId: string;
}

export async function createList(params: CreateListParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!params.tripId || !params.name) {
      return { error: "Missing required fields" };
    }

    // Check if user has access to this trip
    const userTrip = await db.userTrip.findFirst({
      where: {
        userId: session.user.id,
        tripId: params.tripId,
      },
    });

    if (!userTrip) {
      return { error: "Trip not found" };
    }

    const list = await db.list.create({
      data: {
        name: params.name,
        tripId: params.tripId,
      },
    });

    revalidatePath("/explore");
    return { success: "List created successfully", list };
  } catch (error) {
    console.error("Create list error:", error);
    return { error: "Something went wrong" };
  }
}
