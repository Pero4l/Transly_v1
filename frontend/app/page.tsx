import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, PackageSearch, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#fdba74] to-[#ea580c] opacity-25 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl mb-6">
              Logistics and delivery, <span className="text-orange-600">simplified.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 mb-10">
              Transly provides an intuitive platform to track, manage, and dispatch packages anywhere in the world. Fast, secure, and fully transparent.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/request">
                <Button size="lg" className="w-full sm:w-auto">
                  Send a Package <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/tracking">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Track Package
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center p-6 glass rounded-2xl">
              <div className="w-12 h-12 bg-orange-600/10 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Lightning Fast</h3>
              <p className="text-slate-600">Our optimized routing ensures your packages reach their destination in record time.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 glass rounded-2xl">
              <div className="w-12 h-12 bg-orange-600/10 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Secure & Insured</h3>
              <p className="text-slate-600">Every package is tracked continuously and fully insured against damage or loss.</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 glass rounded-2xl">
              <div className="w-12 h-12 bg-orange-600/10 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <PackageSearch className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Real-time Tracking</h3>
              <p className="text-slate-600">Know exactly where your delivery is at any given moment with our live tracking platform.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
