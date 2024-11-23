import { User } from "@prisma/client";

export type ExtendedUser = {
  name: string | null;
  id: string;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  role: "ADMIN" | "USER";
  isTwoFactorEnabled: boolean;
};
