import { Button } from "@/components/ui/button";
import { IoMdClose } from "react-icons/io";

interface TripboxProps {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
}

export default function Tripbox({
  name,
  startDate,
  endDate,
  description,
}: TripboxProps) {
  return (
    <div className="flex flex-col relative cursor-pointer justify-between py-7 items-center space-y-2 text-gray-800 bg-white/85 hover:bg-white/90 duration-500 rounded-xl h-44 w-full ">
      <p className="text-xl font-bold">{name}</p>
      <div className="flex items-center justify-center">
        <p className="text-sm">{startDate}</p>
        <p className="text-sm mx-2">-</p>
        <p className="text-sm ">{endDate}</p>
      </div>

      <p className="text-sm max-w-xs px-2 line-clamp-3  text-center">
        {description}
      </p>
      {/* <Button className="bg-black  text-white ">Start a plan</Button> */}
      {/* <IoMdClose className="text-2xl absolute top-1 cursor-pointer right-3" /> */}
    </div>
  );
}
