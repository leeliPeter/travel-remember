"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TripSchema } from "@/schemas";
import { useState } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CreateTripFormProps {
  onSubmit: (data: z.infer<typeof TripSchema>) => void;
}

export function CreateTripForm({ onSubmit }: CreateTripFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof TripSchema>>({
    resolver: zodResolver(TripSchema),
    defaultValues: {
      name: "",
      startDate: new Date(),
      endDate: new Date(),
      description: "",
    },
  });

  const handleSubmit = (formData: z.infer<typeof TripSchema>) => {
    const data = {
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
    };
    onSubmit(data);
  };

  return (
    <div className="p-2 sm:p-4 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
          Create New Trip
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 mt-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  Trip Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={loading}
                    placeholder="Enter trip name"
                    className="h-9 sm:h-10"
                  />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  Start Date
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="date"
                    value={
                      field.value instanceof Date
                        ? field.value.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                    disabled={loading}
                    className="h-9 sm:h-10"
                  />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">End Date</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="date"
                    value={
                      field.value instanceof Date
                        ? field.value.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                    disabled={loading}
                    className="h-9 sm:h-10"
                  />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  Description (Optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    disabled={loading}
                    placeholder="Enter trip description"
                    className="resize-none h-20 sm:h-24"
                  />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-2 sm:pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto text-sm sm:text-base py-2 px-4"
            >
              Create Trip
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
