"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function VerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("We are verifying your transaction with Paystack...");

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setMessage("No transaction reference provided.");
      return;
    }

    const verifyTransaction = async () => {
      try {
        const token = localStorage.getItem("transly_token");
        const res = await fetch("https://transly-wr1m.onrender.com/payment/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reference }),
        });

        const data = await res.json();
        if (data.success) {
          setStatus("success");
          setMessage("Payment verified successfully! Your shipment will now be dispatched.");
        } else {
          setStatus("error");
          setMessage(data.error || "Payment verification failed.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("A network error occurred while verifying the payment.");
      }
    };

    verifyTransaction();
  }, [reference]);

  return (
    <div className="min-h-screen bg-slate-50 pb-12 overflow-x-hidden w-full">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16 flex justify-center items-center">
         <Card className="max-w-md w-full text-center border-0 shadow-2xl shadow-orange-950/5 rounded-3xl overflow-hidden relative">
            <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-orange-600 absolute top-0 left-0" />
            <CardContent className="pt-12 pb-10 px-8 flex flex-col items-center">
                {status === "loading" && (
                    <>
                        <div className="bg-orange-50 p-6 rounded-full mb-6">
                            <Loader2 className="h-12 w-12 text-orange-600 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2 font-display">Verifying Payment</h2>
                        <p className="text-slate-500">{message}</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="bg-emerald-50 p-6 rounded-full mb-6">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2 font-display">Transaction Secured!</h2>
                        <p className="text-slate-500 mb-8">{message}</p>
                        
                        <Button onClick={() => router.push("/dashboard")} className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl font-bold">
                            Return to Dashboard
                        </Button>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="bg-red-50 p-6 rounded-full mb-6">
                            <XCircle className="h-12 w-12 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2 font-display">Verification Failed</h2>
                        <p className="text-slate-500 mb-8">{message}</p>
                        
                        <Button onClick={() => router.push("/dashboard")} className="w-full border-2 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 h-12 rounded-xl font-bold">
                            Go to Dashboard and Contact Support
                        </Button>
                    </>
                )}
            </CardContent>
         </Card>
      </main>
    </div>
  );
}
