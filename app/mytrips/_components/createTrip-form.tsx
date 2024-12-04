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
import { addTrip } from "@/actions/add-trip";
import FormSuccess from "@/components/form-sucess";
import FormError from "@/components/form-error";

interface CreateTripFormProps {
  onSuccess?: (trip: any) => void;
}

export function CreateTripForm({ onSuccess }: CreateTripFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof TripSchema>>({
    resolver: zodResolver(TripSchema),
    defaultValues: {
      name: "",
      startDate: new Date(),
      endDate: new Date(),
      description: "",
    },
  });

  const handleSubmit = async (formData: z.infer<typeof TripSchema>) => {
    setError("");
    setSuccess("");

    const data = {
      ...formData,
      startDate:
        formData.startDate instanceof Date
          ? formData.startDate
          : new Date(formData.startDate),
      endDate:
        formData.endDate instanceof Date
          ? formData.endDate
          : new Date(formData.endDate),
    };
    console.log("start date", data.startDate);
    console.log("end date", data.endDate);

    startTransition(async () => {
      const response = await addTrip(data);
      if (response?.error) {
        setError(response.error);
      }
      if (response?.success) {
        setSuccess(response.success);
        form.reset(); // Reset form on success
        if (response.trip && onSuccess) {
          onSuccess(response.trip); // This will close the dialog and update the trips list
        }
      }
    });
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
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      date.setUTCHours(12, 0, 0, 0);
                      field.onChange(date);
                    }}
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
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      date.setUTCHours(12, 0, 0, 0);
                      field.onChange(date);
                    }}
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
          {success && <FormSuccess message={success} />}
          {error && <FormError message={error} />}
          <div className="flex justify-end pt-2 sm:pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto text-sm sm:text-base py-2 px-4"
            >
              {isPending ? "Creating..." : "Create Trip"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
