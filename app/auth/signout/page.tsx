"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

export default function SignOutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const performSignOut = async () => {
      try {
        await logout();
        router.push("/");
      } catch (error) {
        console.error("Error signing out:", error);
        // Even if there's an error, redirect to home
        router.push("/");
      }
    };

    performSignOut();
  }, [logout, router]);

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-16rem)]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-16 w-16 animate-spin text-green-400" />
        <h1 className="text-2xl font-bold mt-4">Signing out...</h1>
        <p className="text-muted-foreground">You will be redirected shortly.</p>
      </div>
    </div>
  );
}
