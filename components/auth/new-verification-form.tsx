"use client";
import React, { useState, useEffect, useCallback } from "react";
import { BeatLoader } from "react-spinners";
import { useSearchParams, useRouter } from "next/navigation";
import { newVerification } from "@/actions/new-verification";
import CardWrapper from "@/components/auth/card-wrapper";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-sucess";

export default function NewVerificationForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const onSubmit = useCallback(async () => {
    setError("");
    setSuccess("");
    if (!token) {
      setError("Token does not exist");
      return;
    }
    newVerification(token)
      .then((data) => {
        setError(data?.error || "");
        setSuccess(data?.success || "");

        if (data?.success) {
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
        }
      })
      .catch(() => {
        setError("Something went wrong");
      });
  }, [token, router]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel="Confirming your verification"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <div className="flex items-center w-full justify-center">
        {!error && !success && <BeatLoader />}
        {success && <FormSuccess message={success} />}
        {error && <FormError message={error} />}
      </div>
    </CardWrapper>
  );
}
