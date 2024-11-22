import { FaUser } from "react-icons/fa";
import { ExitIcon } from "@radix-ui/react-icons";
import { IoPerson } from "react-icons/io5";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutBtn } from "@/components/auth/logout-btn";
import { currentUser } from "@/lib/auth";

export const UserNav = async () => {
  const user = await currentUser();
  return (
    <div className="absolute container ">
      <div className="flex items-center gap-4  text-white absolute z-30 md:-right-0  md:top-10">
        <div className="text-white font-semibold">{user?.email}</div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src={user?.image || ""} />
              <AvatarFallback className="bg-gray-400 overflow-hidden text-white">
                <FaUser className="w-8 h-8 mt-2" />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40" align="end">
            <Link href="/member">
              <DropdownMenuItem>
                <IoPerson className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
            </Link>
            <LogoutBtn>
              <DropdownMenuItem>
                <ExitIcon className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </LogoutBtn>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
