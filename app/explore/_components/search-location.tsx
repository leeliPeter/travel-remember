import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Map from "./search-location/map";
export default function SearchLocation() {
  const name = "Japan";
  const formattedStartDate = "2024-01-01";
  const formattedEndDate = "2024-01-05";
  const [listName, setListName] = useState("");

  const description =
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle list creation here
    console.log("Creating list:", listName);
  };

  return (
    <div className="flex space-y-4 md:space-y-0 md:space-x-4 flex-col md:flex-row h-[80vh]">
      <div className="box1 w-full md:w-1/4  bg-white/20 flex-col flex p-2 space-y-3 rounded-lg">
        <div className="w-full bg-white rounded-lg flex justify-center py-3 space-y-2 flex-col items-center">
          <p className="text-xl font-bold w-[80%] text-center truncate capitalize">
            {name}
          </p>
          <div className="flex items-center justify-center">
            <p className="text-sm">{formattedStartDate}</p>
            <p className="text-sm mx-2">-</p>
            <p className="text-sm">{formattedEndDate}</p>
          </div>
          <p className="text-sm max-w-xs px-2 line-clamp-4 text-center">
            {description}
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-lg h-full flex-col flex px-3 py-3 items-center">
          <div className="text-xl font-bold pb-2">Save location to list</div>
          <div className="bg-white/90 rounded-lg w-full flex justify-center items-center">
            <form onSubmit={handleSubmit} className="space-y-4 w-full p-4">
              <Input
                type="text"
                placeholder="Enter list name"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="w-full"
              />
              <Button type="submit" className="w-full">
                Create List
              </Button>
            </form>
          </div>
        </div>
      </div>
      <div className="box2 w-full h-full md:w-3/4 bg-white rounded-lg">
        <Map />
      </div>
    </div>
  );
}
