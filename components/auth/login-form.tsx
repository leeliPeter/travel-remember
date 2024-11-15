"use client";

import CardWrapper from "./card-wrapper";
import * as z from "zod";
import { LoginSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import FormSuccess from "../form-sucess";
import FormError from "../form-error";
import { login } from "@/actions/login";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const searchParams = useSearchParams();
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Account already linked to another provider"
      : "";
  const [error, setError] = useState<string | undefined>(urlError);
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      code: "",
    },
  });
  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    const response = await login(values);

    if (response?.error) {
      setError(response.error);
    }

    if (response?.success) {
      setSuccess(response.success);
      if (response.redirectTo) {
        router.push(response.redirectTo);
      }
    }

    if (response?.twoFactor) {
      setShowTwoFactor(true);
    }
  };

  return (
    <CardWrapper
      headerLabel="Welcome back"
      backButtonLabel="Don't have an account?"
      backButtonHref="/auth/register"
      showSocial={true}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {showTwoFactor && (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two factor code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Two factor code"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {!showTwoFactor && (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Email"
                          disabled={isPending}
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Password"
                          disabled={isPending}
                        />
                      </FormControl>
                      <Button
                        variant="link"
                        className="p-0 font-normal"
                        size="sm"
                        asChild
                      >
                        <Link href="/auth/reset">Forgot password?</Link>
                      </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
          {success && <FormSuccess message={success} />}
          {(error || urlError) && <FormError message={error || urlError} />}
          <Button type="submit" className="w-full" disabled={isPending}>
            {showTwoFactor ? "Verify" : "Login"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}
