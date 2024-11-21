"use server";

import { db } from "@/lib/db";
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
    console.log("Received values:", values);

    const validatedFields = TripSchema.safeParse(values);

    if (!validatedFields.success) {
      console.log("Validation errors:", validatedFields.error.errors);
      return {
        error: "Invalid fields!",
        details: validatedFields.error.errors,
      };
    }

    const { name, startDate, endDate, description } = validatedFields.data;

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
        users: {
          create: {
            userId: user.id,
          },
        },
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
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
