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
import { useState, useTransition } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FormSuccess from "@/components/form-sucess";
import FormError from "@/components/form-error";
import { updateTrip } from "@/actions/update-trip";

interface AdjustTripFormProps {
  trip: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    description: string | null;
  };
  onSuccess?: (updatedTrip: any) => void;
}

export function AdjustTripForm({ trip, onSuccess }: AdjustTripFormProps) {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof TripSchema>>({
    resolver: zodResolver(TripSchema),
    defaultValues: {
      name: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      description: trip.description || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof TripSchema>) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      const response = await updateTrip(trip.id, values);

      if (response?.error) {
        setError(response.error);
      }

      if (response?.success) {
        setSuccess(response.success);
        form.reset();
        if (onSuccess) {
          const updatedTrip = {
            ...trip,
            ...values,
          };
          setTimeout(() => {
            onSuccess(updatedTrip);
          }, 500);
        }
      }
    });
  };

  return (
    <div className="p-0 px-1 sm:p-4 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
          Adjust Trip Details
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-1 md:space-y-2 lg:space-y-4 mt-4"
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
                    disabled={isPending}
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
                    disabled={isPending}
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
                    disabled={isPending}
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
                    disabled={isPending}
                    placeholder="Enter trip description"
                    className="resize-none h-20 sm:h-24"
                  />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />

          {success && <FormSuccess message={success} />}
          {error && <FormError message={error} />}

          <div className="flex justify-end pt-2 sm:pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto text-sm sm:text-base py-2 px-4"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
