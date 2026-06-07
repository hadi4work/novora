import { SignupForm } from "@/components/auth/auth-form";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Sign up",
  description: "Create your free Novora account. 3 AI generations per day.",
  path: "/signup",
});

export default function SignupPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-2">Create your account</h1>
      <p className="text-center text-sm text-muted-foreground mb-6">
        Free to start — 3 generations per day
      </p>
      <SignupForm />
    </div>
  );
}
