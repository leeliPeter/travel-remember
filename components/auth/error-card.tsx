import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import CardWrapper from "@/components/auth/card-wrapper";

export default function ErrorCard() {
  return (
    <CardWrapper
      headerLabel="Opps! Something went wrong"
      backButtonLabel="Back to Login"
      backButtonHref="/auth/login"
    >
      <div className="w-full flex items-center justify-center">
        <ExclamationTriangleIcon className="h-10 w-10 text-destructive" />
      </div>
    </CardWrapper>
  );
}
