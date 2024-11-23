"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useTransition } from "react";
import { updateUserInfoAction } from "@/actions/update-user-info";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-sucess";
import { UpdateUserInfoSchema } from "@/schemas";

import * as z from "zod";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ExtendedUser } from "@/next-auth";

interface MemberPageProps {
  user?: ExtendedUser;
}

export function MemberPage({ user }: MemberPageProps) {
  // const user = clientCurrentUser();
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const form = useForm<z.infer<typeof UpdateUserInfoSchema>>({
    resolver: zodResolver(UpdateUserInfoSchema),
    defaultValues: {
      name: user?.name || "",
      isTwoFactorEnabled: user?.isTwoFactorEnabled || false,
    },
  });

  const onSubmit = async (values: z.infer<typeof UpdateUserInfoSchema>) => {
    setError(undefined);
    setSuccess(undefined);
    startTransition(() => {
      updateUserInfoAction(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
          }
          if (data.success) {
            update();
            setSuccess(data.success);
          }
        })
        .catch(() => {
          setError("Page Seomthing went wrong");
        });
    });
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-[600px] w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl text-center">
            Update Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={() => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          value={user?.email || ""}
                          disabled
                          className="bg-gray-100"
                        />
                      </FormControl>
                      <FormDescription>Email cannot be changed</FormDescription>
                    </FormItem>
                  )}
                />

                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your name"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Two Factor Switch */}
                {user?.isOAuth ? null : (
                  <FormField
                    control={form.control}
                    name="isTwoFactorEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Two Factor Authentication
                          </FormLabel>
                          <FormDescription>
                            Add an extra layer of security to your account
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isPending}
                            variant={field.value ? "success" : "danger"}
                            aria-label="Toggle two factor authentication"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {error && <FormError message={error} />}
              {success && <FormSuccess message={success} />}

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
