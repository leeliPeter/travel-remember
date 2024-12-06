"use server";

import { getScheduleByTripNoLogin } from "@/data/get-schedule-bytrip-no-login";

export const getPublicSchedule = async (tripId: string) => {
  try {
    const result = await getScheduleByTripNoLogin(tripId);

    if (!result.success) {
      return { success: false };
    }

    return {
      success: true,
      trip: result.trip,
      schedule: result.schedule,
    };
  } catch (error) {
    return { success: false };
  }
};
