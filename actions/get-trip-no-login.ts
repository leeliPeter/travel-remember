"use server";

import { getTripNoLogin } from "@/data/get-trip-nologin";

export const getPublicTrip = async (tripId: string) => {
  try {
    const result = await getTripNoLogin(tripId);

    if (!result.success) {
      return { success: false };
    }

    return {
      success: true,
      trip: result.trip,
    };
  } catch (error) {
    return { success: false };
  }
};
