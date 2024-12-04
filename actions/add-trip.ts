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
    const validatedFields = TripSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const { name, startDate, endDate, description } = validatedFields.data;

    // Create initial schedule data
    const initialScheduleData = {
      days: getDatesInRange(startDate, endDate).map((date, index) => ({
        dayId: `day-${index}`,
        date: date.toISOString(),
        locations: [],
      })),
    };

    // Create trip and schedule in a single transaction
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
        schedule: {
          create: {
            scheduleData: initialScheduleData,
            version: 1,
          },
        },
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
        schedule: true,
      },
    });

    console.log("Trip created successfully with schedule:", trip);
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

// Helper function to generate dates between start and end
function getDatesInRange(startDate: Date, endDate: Date) {
  const dates = [];
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}
