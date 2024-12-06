"use server";

import { getScheduleNoLogin } from "@/data/get-schedule-nologin";

export const getPublicSchedule = async (tripId: string) => {
  try {
    const result = await getScheduleNoLogin(tripId);

    if (!result.success) {
      return { success: false };
    }

    return {
      success: true,
      schedule: result.schedule,
    };
  } catch (error) {
    return { success: false };
  }
};
