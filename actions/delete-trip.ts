"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteTrip(tripId: string) {
  try {
    await db.trip.delete({
      where: { id: tripId },
    });

    revalidatePath("/mytrips");
    return { success: "Trip deleted successfully" };
  } catch (error) {
    console.error("Error deleting trip:", error);
    return { error: "Failed to delete trip" };
  }
}
