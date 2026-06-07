import { LoginForm } from "@/components/auth/auth-form";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Log in",
  description: "Sign in to your Novora account.",
  path: "/login",
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-2">Welcome back</h1>
      <p className="text-center text-sm text-muted-foreground mb-6">
        Sign in to continue creating
      </p>
      {params.error && (
        <p className="mb-4 text-sm text-destructive text-center break-words">
          {decodeURIComponent(params.error)}
        </p>
      )}
      <LoginForm redirect={params.redirect} />
    </div>
  );
}
