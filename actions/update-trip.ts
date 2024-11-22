"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { TripSchema } from "@/schemas";
import * as z from "zod";

export async function updateTrip(
  tripId: string,
  values: z.infer<typeof TripSchema>
) {
  try {
    const validatedFields = TripSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const { name, startDate, endDate, description } = validatedFields.data;

    const updatedTrip = await db.trip.update({
      where: { id: tripId },
      data: {
        name,
        startDate,
        endDate,
        description,
      },
    });

    revalidatePath("/mytrips");
    return { success: "Trip updated successfully!", trip: updatedTrip };
  } catch (error) {
    console.error("[UPDATE_TRIP_ERROR]", error);
    return { error: "Something went wrong while updating the trip." };
  }
}
