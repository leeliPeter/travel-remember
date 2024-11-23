"use server";
import * as z from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { UpdateUserInfoSchema } from "@/schemas";
import { getUserById } from "@/data/user";

export const updateUserInfoAction = async (
  values: z.infer<typeof UpdateUserInfoSchema>
) => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "Unauthorized" };
    }
    if (!user.id) {
      return { error: "Unauthorized" };
    }
    const dbUser = await getUserById(user.id);

    if (!dbUser) {
      return { error: "Unauthorized" };
    }
    if (user.isOAuth) {
      values.email = undefined;
      values.isTwoFactorEnabled = undefined;
    }
    const validatedFields = UpdateUserInfoSchema.safeParse(values);

    if (!validatedFields.success) {
      const errorMessage =
        validatedFields.error.errors[0]?.message || "Invalid input";
      return { error: errorMessage };
    }

    await db.user.update({
      where: { id: user.id },
      data: { ...values },
    });

    return { success: "Updated successfully!" };
  } catch (error) {
    return { error: "Something went wrong!" };
  }
};
