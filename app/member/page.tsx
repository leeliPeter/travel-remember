import React from "react";
import { auth, signOut } from "@/auth";

export default async function MemberPage() {
  const session = await auth();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div>MemberPage</div>
      <div>{JSON.stringify(session)}</div>
      <button
        className="bg-red-500 text-white p-2 rounded-md"
        onClick={async () => {
          "use server";
          await signOut();
        }}
      >
        Sign out
      </button>
    </div>
  );
}
