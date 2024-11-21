"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { TripSchema } from "@/schemas";
import { currentUser } from "@/lib/auth";
import * as z from "zod";

export async function addTrip(values: z.infer<typeof TripSchema>) {
  const user = await currentUser();
  if (!user?.id) {
    console.log("user not found");
    return { error: "User not found" };
  }

  try {
    // Log the incoming values
    console.log("Received values:", values);

    const validatedFields = TripSchema.safeParse(values);

    if (!validatedFields.success) {
      // Log the specific validation errors
      console.log("Validation errors:", validatedFields.error.errors);
      return {
        error: "Invalid fields!",
        details: validatedFields.error.errors,
      };
    }

    const { name, startDate, endDate, description } = validatedFields.data;

    // Log the parsed data
    console.log("Parsed data:", {
      name,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      description,
    });

    const trip = await db.trip.create({
      data: {
        name,
        startDate,
        endDate,
        description,
        userId: user.id,
      },
      include: {
        user: true,
      },
    });

    console.log("Trip created successfully:", trip);
    revalidatePath("/mytrips");
    return { success: "Trip created!", trip };
  } catch (error) {
    console.error("[ADD_TRIP_ERROR]", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Something went wrong while creating the trip." };
  }
}
