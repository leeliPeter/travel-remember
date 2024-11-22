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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FaUser } from "react-icons/fa";
import { getTripUsersImages } from "@/data/getTripUsersImages";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AdjustTripForm } from "./adjust-trip-form";

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

export default function Tripbox({
  id,
  name,
  startDate,
  endDate,
  description,
  onUpdate,
  onDelete,
}: TripboxProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [userImages, setUserImages] = useState<UserImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);

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
      <div className="flex -space-x-2 overflow-hidden">
        {!isLoading &&
          userImages.map((user, index) => (
            <div
              key={index}
              className="relative inline-block ring-2 ring-white"
              title={user.name || "User"}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image || ""} />
                <AvatarFallback className="bg-gray-400 text-white">
                  <FaUser className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </div>
          ))}
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
        <Button className="w-20">Plan</Button>
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
    </div>
  );
}
