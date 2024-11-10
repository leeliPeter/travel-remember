"use server";

import * as z from "zod";

import { NewPasswordSchema } from "@/schemas";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail } from "@/data/user";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const newPassword = async (
  data: z.infer<typeof NewPasswordSchema>,
  token?: string | null
) => {
  if (!token) {
    return { error: "Token is required" };
  }

  const validatedFields = NewPasswordSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: "Invalid data" };
  }
  const { password } = validatedFields.data;
  const expisitingToken = await getPasswordResetTokenByToken(token);
  if (!expisitingToken) {
    return { error: "Invalid token" };
  }

  const hasExpired = expisitingToken.expires < new Date();
  if (hasExpired) {
    return { error: "Token has expired" };
  }

  const existingUser = await getUserByEmail(expisitingToken.email);
  if (!existingUser) {
    return { error: "User not found" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });

  await db.passwordResetToken.delete({
    where: { id: expisitingToken.id },
  });

  return { success: "Password updated" };
};
