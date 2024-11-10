import crypto from "crypto";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { db } from "@/lib/db";
export const generateTwoFactorToken = async (email: string) => {
  const token = crypto.randomInt(100_000, 1_000_000).toString();
  const expires = new Date(Date.now() + 1000 * 60 * 15);
  const existingToken = await getTwoFactorTokenByEmail(email);
  if (existingToken) {
    await db.twoFactorToken.delete({
      where: { id: existingToken.id },
    });
  }
  const twoFactorToken = await db.twoFactorToken.create({
    data: {
      token,
      expires,
      email,
    },
  });
  return twoFactorToken;
};
