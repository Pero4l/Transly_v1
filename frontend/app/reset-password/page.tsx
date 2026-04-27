"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Package, Lock, Key, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import Image from "next/image";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "https://transly-wr1m.onrender.com/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, password }),
        },
      );
      const data = await res.json();

      if (data.success) {
        toast.success("Password reset successfully! Please login.");
        router.push("/login");
      } else {
        toast.error(data.error || "Failed to reset password");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white border border-slate-200 shadow-xl rounded-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription>
          Enter the 6-character OTP sent to your email and your new password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="otp">
              OTP Code
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                id="otp"
                type="text"
                placeholder="AB34EF"
                value={otp}
                onChange={(e) => setOtp(e.target.value.toUpperCase())}
                required
                maxLength={6}
                className="pl-10 uppercase font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="password"
            >
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              className="w-full text-md h-12"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : null}
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-0 pb-6">
        <Link
          href="/login"
          className="text-center text-sm text-slate-600 hover:text-orange-600 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Transly Logo"
              width={180}
              height={60}
              className="h-12 w-auto object-contain"
            />
          </Link>
        </div>
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
