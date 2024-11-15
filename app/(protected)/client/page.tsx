"use client";

import { UserInfo } from "@/components/user-info";
import { clientCurrentUser } from "@/hooks/client-current-user";

export default function Client() {
  const user = clientCurrentUser();
  return (
    <div className="text-white">
      <UserInfo user={user} label="📱 Client User Info" />
    </div>
  );
}
