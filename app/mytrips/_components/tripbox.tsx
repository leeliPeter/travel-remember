import { Button } from "@/components/ui/button";
import { IoMdClose } from "react-icons/io";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteTrip } from "@/actions/delete-trip";
import { useState, useEffect } from "react";
import { IoMdPersonAdd } from "react-icons/io";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FaUser } from "react-icons/fa";
import { getTripUsersImages } from "@/data/getTripUsersImages";
import { FaTrashCan } from "react-icons/fa6";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdjustTripForm } from "./adjust-trip-form";
import Link from "next/link";
import { getUsersByTrip, TripUser } from "@/actions/get-users-by-trip";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { searchUsers, SearchedUser } from "@/actions/search-users";
import { addUserToTrip } from "@/actions/add-user-to-trip";
import { deleteUserFromTrip } from "@/actions/del-user-from-trip";
import { useSession } from "next-auth/react";

interface TripboxProps {
  id: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  description: string | null;
  onUpdate?: (updatedTrip: any) => void;
  onDelete?: () => void;
}

interface UserImage {
  image: string;
  name: string | null;
}

interface InviteError {
  userId: string;
  message: string;
}

export default function Tripbox({
  id,
  name,
  startDate,
  endDate,
  description,
  onUpdate,
  onDelete,
}: TripboxProps) {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [userImages, setUserImages] = useState<UserImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [tripUsers, setTripUsers] = useState<TripUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [isNotFoundDialogOpen, setIsNotFoundDialogOpen] = useState(false);
  const [inviteErrors, setInviteErrors] = useState<InviteError[]>([]);

  useEffect(() => {
    const loadUserImages = async () => {
      try {
        const images = await getTripUsersImages(id);
        setUserImages(images);
      } catch (error) {
        console.error("Error loading user images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserImages();
  }, [id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteTrip(id);
      onDelete?.();
    } catch (error) {
      console.error("Failed to delete trip:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAdjustSuccess = (updatedTrip: any) => {
    if (onUpdate) {
      onUpdate(updatedTrip);
    }
    setIsAdjustDialogOpen(false);
  };

  const handleShowUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const result = await getUsersByTrip(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.users) {
        setTripUsers(result.users);
        setIsUsersDialogOpen(true);
      }
    } catch (error) {
      console.error("Error loading trip members:", error);
      toast.error("Failed to load trip members");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;

    setIsSearching(true);
    try {
      const result = await searchUsers(searchEmail);
      if (result.error) {
        setIsNotFoundDialogOpen(true);
        setSearchResults([]);
      } else if (result.users) {
        setSearchResults(result.users);
        setIsSearchDialogOpen(true);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search user");
    } finally {
      setIsSearching(false);
    }
  };

  const handleInviteUser = async (user: SearchedUser) => {
    try {
      const result = await addUserToTrip(user.id, id);

      if (result.error === "ALREADY_MEMBER") {
        const memberUser = result.user!;
        setInviteErrors((current) => [
          ...current,
          {
            userId: user.id,
            message: `${
              memberUser.name || "This user"
            } is already a member of this trip`,
          },
        ]);

        setTimeout(() => {
          setInviteErrors((current) =>
            current.filter((error) => error.userId !== user.id)
          );
        }, 3000);
        return;
      }

      if (result.error) {
        toast.error(result.error);
        setIsSearchDialogOpen(false);
        return;
      }

      if (result.success && result.user) {
        const newUser = result.user;

        setIsSearchDialogOpen(false);
        setSearchEmail("");
        setSearchResults([]);
        setInviteErrors([]);

        setTripUsers((current) => {
          return [
            ...current,
            {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              image: newUser.image,
              role: newUser.role,
            },
          ];
        });

        const images = await getTripUsersImages(id);
        setUserImages(images);

        setTimeout(() => {
          toast.success(result.success);
        }, 100);
      }
    } catch (error) {
      console.error("Error inviting user to trip:", error);
      toast.error("Failed to add user to trip");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const result = await deleteUserFromTrip(userId, id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success(result.success);

        setTripUsers((current) => current.filter((user) => user.id !== userId));

        const images = await getTripUsersImages(id);
        setUserImages(images);
      }
    } catch (error) {
      console.error("Error removing user from trip:", error);
      toast.error("Failed to remove user from trip");
    }
  };

  const formattedStartDate =
    startDate instanceof Date
      ? startDate.toLocaleDateString()
      : new Date(startDate).toLocaleDateString();

  const formattedEndDate =
    endDate instanceof Date
      ? endDate.toLocaleDateString()
      : new Date(endDate).toLocaleDateString();

  return (
    <div className="flex flex-col relative justify-between py-4 items-center space-y-2 text-gray-800 bg-white/85 hover:bg-white/90 duration-500 rounded-xl h-60 w-full">
      <p className="text-xl font-bold w-[80%] text-center truncate capitalize">
        {name}
      </p>
      <div className="flex items-center justify-center">
        <p className="text-sm">{formattedStartDate}</p>
        <p className="text-sm mx-2">-</p>
        <p className="text-sm">{formattedEndDate}</p>
      </div>
      <div
        className="flex hover:scale-105 duration-300 cursor-pointer items-center space-x-2 overflow-hidden"
        onClick={handleShowUsers}
      >
        {!isLoading &&
          userImages.map((user, index) => (
            <div
              key={index}
              className="relative inline-block"
              title={user.name || "User"}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image || ""} />
                <AvatarFallback className="bg-gray-400 text-white">
                  <FaUser className="w-6 h-6 mt-2" />
                </AvatarFallback>
              </Avatar>
            </div>
          ))}
        <p className="text-black flex items-end justify-center h-7 w-7 hover:text-blue-500 cursor-pointer hover:scale-110 duration-300">
          <IoMdPersonAdd className="text-xl" />
        </p>
      </div>
      <p className="text-sm max-w-xs px-2 line-clamp-3 text-center">
        {description}
      </p>
      <div className="flex items-center  justify-between space-x-4">
        <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-20">
              Adjust
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90%] sm:w-full sm:max-w-[425px] rounded-xl">
            <AdjustTripForm
              trip={{
                id,
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                description,
              }}
              onSuccess={handleAdjustSuccess}
            />
          </DialogContent>
        </Dialog>
        <Link href={`/explore?view=search&tripId=${id}`}>
          <Button className="w-20">Plan</Button>
        </Link>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="absolute top-1 right-3">
            <IoMdClose className="text-2xl cursor-pointer" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="w-[90%] sm:w-full rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your trip. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
        <DialogContent className="w-[90%] sm:w-full sm:max-w-[425px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold mb-2">
              Trip Members
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Search user by email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchEmail.trim()}
                size="sm"
              >
                {isSearching ? "..." : "Search"}
              </Button>
            </div>

            <div className="pt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">
                Current Members
              </p>
              <div className="space-y-2">
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                  </div>
                ) : tripUsers.length > 0 ? (
                  tripUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-50"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback className="bg-gray-400 text-white">
                          <FaUser className="w-8 h-8 mt-2" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">
                          {user.name || "Unnamed User"}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      {session?.user?.id !== user.id && (
                        <AlertDialog>
                          <AlertDialogTrigger>
                            <FaTrashCan className="text-black cursor-pointer hover:text-red-600 duration-300" />
                          </AlertDialogTrigger>
                          <AlertDialogContent className="w-[90%] sm:w-full rounded-xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove{" "}
                                {user.name || "this user"} from the trip? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No members found
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
        <DialogContent className="w-[90%] sm:w-full sm:max-w-[425px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold mb-2">
              Search Results
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div key={user.id} className="flex flex-col">
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 border">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.image || ""} />
                      <AvatarFallback className="bg-gray-400 text-white">
                        <FaUser className="w-8 h-8 mt-2" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {user.name || "Unnamed User"}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleInviteUser(user)}
                    >
                      Invite
                    </Button>
                  </div>
                  {inviteErrors.find((error) => error.userId === user.id) && (
                    <div className="text-center mt-2 text-amber-600 text-sm bg-amber-50 p-2 rounded-md border border-amber-200">
                      {
                        inviteErrors.find((error) => error.userId === user.id)
                          ?.message
                      }
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No users found matching "{searchEmail}"
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isNotFoundDialogOpen}
        onOpenChange={setIsNotFoundDialogOpen}
      >
        <DialogContent className="w-[90%] sm:w-full sm:max-w-[425px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold mb-2">
              User Not Found
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaUser className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <p className="text-gray-600 mb-2">No user found with email:</p>
              <p className="font-medium text-gray-800 mb-4">{searchEmail}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
