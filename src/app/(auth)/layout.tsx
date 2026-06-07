import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Logo href="/" size="md" className="mb-8" />
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
