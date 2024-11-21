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
import { useState } from "react";

interface TripboxProps {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  onDelete?: () => void;
}

export default function Tripbox({
  id,
  name,
  startDate,
  endDate,
  description,
  onDelete,
}: TripboxProps) {
  const [isDeleting, setIsDeleting] = useState(false);

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

  return (
    <div className="flex flex-col relative justify-between py-4 items-center space-y-2 text-gray-800 bg-white/85 hover:bg-white/90 duration-500 rounded-xl h-48 w-full">
      <p className="text-xl font-bold">{name}</p>
      <div className="flex items-center justify-center">
        <p className="text-sm">{startDate}</p>
        <p className="text-sm mx-2">-</p>
        <p className="text-sm">{endDate}</p>
      </div>

      <p className="text-sm max-w-xs px-2 line-clamp-3 text-center">
        {description}
      </p>
      <Button className="bg-black text-white">Start a plan</Button>

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
