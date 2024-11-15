import { FaUser } from "react-icons/fa";
import { ExitIcon } from "@radix-ui/react-icons";

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
      <div className=" absolute z-30 right-0 2xl:-right-40 md:top-10">
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
