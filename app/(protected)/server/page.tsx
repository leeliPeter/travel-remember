import { currentUser } from "@/lib/auth";

import { UserInfo } from "@/components/user-info";

export default async function Server() {
  const user = await currentUser();
  return (
    <div className="text-white">
      <UserInfo user={user} label="💻 Server User Info" />
    </div>
  );
}
