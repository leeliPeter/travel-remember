"use client";

import { useSession } from "next-auth/react";
import { IoMdClose } from "react-icons/io";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useTransition, useRef } from "react";
import { updateUserInfoAction } from "@/actions/update-user-info";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FaUser } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-sucess";
import { UpdateUserInfoSchema } from "@/schemas";
import { LogoutBtn } from "@/components/auth/logout-btn";

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
import { uploadIcon } from "@/actions/upload-icon";
import { useRouter } from "next/navigation";
interface MemberPageProps {
  user?: ExtendedUser;
}

export function MemberPage({ user }: MemberPageProps) {
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setError(undefined);
    setSuccess(undefined);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
        );

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadResult = await uploadResponse.json();
        console.log("Upload result:", uploadResult);

        if (uploadResult.error) {
          throw new Error(uploadResult.error.message);
        }

        const optimizedUrl = uploadResult.secure_url.replace(
          "/upload/",
          "/upload/c_fill,w_200,h_200,g_face/"
        );

        const response = await uploadIcon({
          info: { secure_url: optimizedUrl },
        });

        if (response.error) {
          setError(response.error);
        }

        if (response.success) {
          setSuccess(response.success);
          await update();
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      } catch (error) {
        console.error("Upload error:", error);
        setError("Failed to upload image");
      }
    });
  };

  return (
    <div className=" mx-auto h-screen w-screen member-page flex items-center justify-center">
      <Card className="sm:max-w-[400px] w-[90vw]  sm:h-auto  relative     mx-auto">
        <IoMdClose
          className="absolute top-4 right-4 text-2xl cursor-pointer"
          onClick={() => router.back()}
        />
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl text-center">
            {user?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col justify-center -mt-2 sm:-mt-0 space-y-0 sm:space-y-4 mb-1 sm:mb-4 items-center">
            <Avatar className="h-16 w-16 mb-2 sm:mb-0">
              <AvatarImage src={user?.image || ""} />
              <AvatarFallback className="bg-gray-400 text-white">
                <FaUser className="w-14 h-14 mt-2" />
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-center   gap-1 sm:gap-3">
              <div className="relative w-full max-w-xs">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center gap-2 hover:bg-gray-100"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <div className="h-4 w-4 animate-spin  rounded-full border-2 border-gray-500 border-t-transparent" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span>Choose Image</span>
                    </>
                  )}
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={isPending}
                  className="hidden"
                />
              </div>

              <div className="text-center">
                <p className="text-xs my-2 text-gray-500">
                  Supported formats: JPG, PNG, GIF
                </p>
                <p className="text-xs text-gray-500">Maximum size: 5MB</p>
              </div>

              {isPending && (
                <p className="text-sm text-blue-500 animate-pulse">
                  Uploading your image...
                </p>
              )}
            </div>

            {/* {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-500">{success}</p>} */}
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2 sm:space-y-6"
            >
              <div className="space-y-2 sm:space-y-4 mb-2">
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
                          className="bg-gray-100 text-base"
                          style={{ fontSize: "16px" }}
                        />
                      </FormControl>
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
                          className="text-base"
                          style={{ fontSize: "16px" }}
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
                      <FormItem className="flex flex-row items-center  justify-between rounded-lg border p-4">
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
            <div className="mt-2 sm:mt-4">
              <LogoutBtn>
                <Button variant="destructive" className="w-full">
                  Log Out
                </Button>
              </LogoutBtn>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
