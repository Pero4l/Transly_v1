"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { useSession } from "@/lib/sessionContext";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const { refreshSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

 
  

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

     console.log("Refresh session: ",refreshSession);

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.token) localStorage.setItem("transly_token", data.token);
        await refreshSession();
        toast.info("Initializing session...");
        let target = "/dashboard";
        if (data.user.role === 'admin') target = "/admin";
        else if (data.user.role === 'driver') target = "/driver";

        // Reliable routing for iOS/Mobile
        router.push(target);
        setTimeout(() => {
          if (window.location.pathname !== target) {
            window.location.replace(target);
          }
        }, 2000);
        
        toast.success("Welcome back!");
      } else {
        const errorMsg = data.error || "Login failed";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = "Network error. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  
  const { useGoogleLogin } = require("@react-oauth/google");
  
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse: any) => {
        setLoading(true);
        try {
            // Usually we'd get profile info using the access_token or send a code/id_token to backend
            // For @react-oauth/google, we can get user info using the access_token
            const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });
            const profile = await profileRes.json();
            
            const res = await fetch("https://transly-wr1m.onrender.com/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ 
                    name: profile.name, 
                    email: profile.email,
                    googleId: profile.sub,
                    image: profile.picture
                }),
            });
            const data = await res.json();
            if (data.success) {
                await refreshSession();
                toast.success("Signed in with Google!");
                router.push("/dashboard");
            } else {
                toast.error(data.error || "Google Sign-In failed");
            }
        } catch (err) {
            toast.error("Network error during Google Sign-In");
        } finally {
            setLoading(false);
        }
    },
    onError: () => toast.error("Google Login Failed")
  });

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
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Enter your email and password to sign in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
                  <Link href="/forgot-password" title="Reset your password" className="text-xs text-orange-600 hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button className="w-full text-md h-12" type="submit" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </div>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <Button variant="outline" className="w-full h-12" type="button" onClick={() => (googleLogin as any)()} disabled={loading}>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Gmail
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-0 pb-6">
            <div className="text-center text-sm text-slate-600">
              Don't have an account? <Link href="/signup" className="text-orange-600 hover:underline font-medium">Create one</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
