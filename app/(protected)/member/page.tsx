"use client";
import { clientCurrentUser } from "@/hooks/client-current-user";
import { signOutAction } from "@/actions/signOut";

export default function MemberPage() {
  const user = clientCurrentUser();
  const onClick = async () => {
    await signOutAction();
  };

  return (
    <div className="">
      <div>MemberPage</div>
      <div>{JSON.stringify(user)}</div>
      <button
        className="bg-red-500 text-white p-2 rounded-md"
        onClick={onClick}
      >
        Sign out
      </button>
    </div>
  );
}
