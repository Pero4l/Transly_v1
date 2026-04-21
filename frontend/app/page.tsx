import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, PackageSearch, ShieldCheck, Zap, Utensils, Globe, Clock, Box } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-100 selection:text-orange-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-[0.03] scale-110 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
           <div className="absolute top-24 left-0 w-72 h-72 bg-orange-400/20 blur-[120px] rounded-full" />
           <div className="absolute bottom-24 right-0 w-96 h-96 bg-slate-400/10 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Now Live in Nigeria — Starting with Jos
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
              Modern Logistics & <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">Premium Delivery.</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg lg:text-xl text-slate-500 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              Transly is the end-to-end OS for modern commerce. Ship packages worldwide, manage warehousing, and order premium meals—all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
              <Link href="/request" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-80 h-16 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-lg font-black shadow-2xl shadow-orange-600/20 group transition-all">
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/tracking" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-48 h-16 rounded-2xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 font-bold">
                  Track Package
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group p-10 rounded-[2.5rem] bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-2xl transition-all duration-500">
              <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-orange-600/20 group-hover:rotate-6 transition-transform">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Nigeria-wide Shipping</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Efficient interstate logistics spanning across Nigeria with real-time tracking and secure handling.</p>
            </div>

            <div className="group p-10 rounded-[2.5rem] bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-2xl transition-all duration-500">
              <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-slate-900/20 group-hover:rotate-6 transition-transform">
                <Box className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Smart Warehousing</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Automated inventory management and secure storage solutions for businesses of all sizes.</p>
            </div>

            <div className="group p-10 rounded-[2.5rem] bg-orange-600 shadow-2xl shadow-orange-600/30 transform lg:scale-105">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-lg group-hover:rotate-6 transition-transform">
                <Utensils className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Transly Food</h3>
              <p className="text-orange-50 font-medium leading-relaxed mb-8">Premium meals from our kitchen to your doorstep. Fast, fresh, and exceptionally delicious.</p>
              <Link href="/food">
                 <button className="flex items-center gap-2 text-white font-black text-sm uppercase tracking-widest group/btn">
                   Order Food <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                 </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase - Food focus */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2 relative">
               <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-200/50 blur-[80px] rounded-full" />
               <div className="relative rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200">
                  <img 
                    src="https://images.unsplash.com/photo-1526367790999-0150786486a9?q=80&w=2070&auto=format&fit=crop" 
                    alt="Food Delivery" 
                    className="w-full h-full object-cover aspect-[4/5] hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-xl">
                    <div className="flex items-center gap-4 mb-2">
                       <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <ShieldCheck className="w-6 h-6 text-white" />
                       </div>
                       <p className="font-bold text-slate-900 italic">"The fastest meal I've ever ordered!"</p>
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-14">— Sarah Jenkins, Lagos</p>
                  </div>
               </div>
            </div>
            
            <div className="lg:w-1/2 space-y-10">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Hungry? We’ve got <br/> you covered.
                </h2>
                <p className="text-lg text-slate-500 font-medium font-serif">
                  Our dedicated food fleet ensures your meals arrive precisely as the chef intended. No cold fries, no missing sodas—just perfect delivery.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">30 Min Delivery</h4>
                  <p className="text-sm text-slate-400 font-medium">Hyper-local routing for record-breaking speeds.</p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-slate-900" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Live Tracking</h4>
                  <p className="text-sm text-slate-400 font-medium">Watch your order move in real-time on our map.</p>
                </div>
              </div>

              <Link href="/food" className="inline-block">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-10 h-16 text-lg font-black group">
                  Explore The Menu
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="py-20 bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            <div className="space-y-2">
              <p className="text-4xl lg:text-6xl font-black text-white italic tracking-tighter">1M+</p>
              <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.3em]">Packages Delivered</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl lg:text-6xl font-black text-white italic tracking-tighter">99.9%</p>
              <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.3em]">Delivery Success</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl lg:text-6xl font-black text-white italic tracking-tighter">24/7</p>
              <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.3em]">Premium Support</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl lg:text-6xl font-black text-white italic tracking-tighter">150+</p>
              <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.3em]">Corporate Partners</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
