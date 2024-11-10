"use client";
import React, { useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { signIn } from "next-auth/react";

const formSchema = z
  .object({
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.confirmPassword !== undefined) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

interface MemberProps {
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export default function Member({
  onClose,
  initialMode = "login",
}: MemberProps) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      console.log(values);
      // Add your authentication logic here
      onClose(); // Close the form after successful submission
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="flex z-50 justify-center items-center fixed inset-0 bg-gray-800/80 backdrop-blur-sm animate-in fade-in duration-300 p-4 sm:p-6"
      onClick={handleBackdropClick}
    >
      <div className="w-full" onClick={(e) => e.stopPropagation()}>
        <Card className="w-full sm:w-[420px] max-w-[420px] mx-auto relative border-none shadow-2xl bg-white/95 dark:bg-gray-900/95">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 sm:right-5 sm:top-5 text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:rotate-90"
          >
            <IoCloseSharp size={24} />
          </button>

          <CardHeader className="space-y-4 pb-6 pt-6 sm:pb-8 sm:pt-8">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {isLogin ? "Welcome Back!" : "Create Account"}
            </CardTitle>
            <p className="text-center text-muted-foreground text-sm px-4 sm:px-6">
              {isLogin
                ? "Enter your credentials to access your account"
                : "Sign up to get started with our service"}
            </p>
          </CardHeader>

          <CardContent className="px-4 sm:px-8 pb-6 sm:pb-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 sm:space-y-7"
              >
                <div className="space-y-4 sm:space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="Email"
                            className="h-11 sm:h-12 transition-all duration-200 hover:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Password"
                            className="h-11 sm:h-12 transition-all duration-200 hover:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!isLogin && (
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Confirm Password"
                              className="h-11 sm:h-12 transition-all duration-200 hover:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 sm:h-12 font-semibold shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 text-base"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Loading..."
                    : isLogin
                    ? "Sign In"
                    : "Create Account"}
                </Button>

                <div className="relative py-2 sm:py-3">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-3 sm:px-4 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-5">
                  <Button
                    variant="outline"
                    type="button"
                    className="h-11 sm:h-12 hover:bg-primary/5 hover:border-primary transition-all duration-200 hover:-translate-y-0.5 text-sm sm:text-base"
                    onClick={() => {
                      setIsLoading(true);
                      signIn("google", { redirect: false, callbackUrl: "/" });
                    }}
                    disabled={isLoading}
                  >
                    <FaGoogle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    className="h-11 sm:h-12 hover:bg-primary/5 hover:border-primary transition-all duration-200 hover:-translate-y-0.5 text-sm sm:text-base"
                    onClick={() => {
                      setIsLoading(true);
                      signIn("github", { redirect: false, callbackUrl: "/" });
                    }}
                    disabled={isLoading}
                  >
                    <FaGithub className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Github
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-primary/80 underline transition-all duration-200"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      form.reset();
                    }}
                  >
                    {isLogin
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Sign in"}
                  </button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
