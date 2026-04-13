"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ArrowLeft, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("https://transly-wr1m.onrender.com/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("OTP sent to your email!");
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(data.error || "Failed to send reset email");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2 text-orange-600 font-bold text-2xl">
            <Package className="h-8 w-8" />
            <span>Transly</span>
          </Link>
        </div>

        <Card className="glass border-0 shadow-xl rounded-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
            <CardDescription>
              Enter your email and we'll send you an OTP to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="email">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button className="w-full text-md h-12" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-0 pb-6">
            <Link href="/login" className="text-center text-sm text-slate-600 hover:text-orange-600 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
