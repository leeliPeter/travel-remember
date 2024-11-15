"use client";

import { signOutAction } from "@/actions/signOut";

interface LogoutBtnProps {
  children: React.ReactNode;
}

export const LogoutBtn = ({ children }: LogoutBtnProps) => {
  const onClick = async () => {
    signOutAction();
  };

  return (
    <span className="cursor-pointer" onClick={onClick}>
      {children}
    </span>
  );
};
