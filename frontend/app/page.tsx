import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, PackageSearch, ShieldCheck, Zap, Utensils, Globe, Clock, Box, CheckCircle2, Star, Truck, Smartphone, MapPin, Search } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-orange-100 selection:text-orange-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-40 bg-slate-50 border-b border-slate-100 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-3/5 space-y-10 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="flex h-1.5 w-1.5 rounded-full bg-orange-600"></span>
                Directly from PickUp to your door
              </div>
              
              <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[0.95]">
                Logistics that<br/>
                <span className="text-orange-600">Moves Jos.</span>
              </h1>
              
              <p className="max-w-xl text-lg lg:text-xl text-slate-500 font-medium leading-relaxed">
                The most reliable delivery network in Plateau State. From Any PickUp Location to Delivery Location Within Jos, we handle your packages and food with professional care.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/request" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-64 h-14 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-200 group">
                    Send a Package
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/tracking" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-48 h-14 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold">
                    Track Now
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex -space-x-3">
                  {[
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop"
                  ].map((url, i) => (
                    <div key={i} className="w-12 h-12 rounded-lg border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                       <Image src={url} alt="User" width={48} height={48} className="object-cover h-full w-full" />
                    </div>
                  ))}
                </div>
                <div>
                   <div className="flex items-center gap-1 text-orange-500">
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                   </div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">400+ Verified Jos Users</p>
                </div>
              </div>
            </div>

            <div className="lg:w-2/5 relative">
               <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white group">
                  <Image 
                    src="/hero-biker.png" 
                    alt="Jos Delivery Biker" 
                    width={1200}
                    height={1600}
                    priority
                    className="w-full h-full object-cover aspect-[4/5] group-hover:scale-105 transition-transform duration-1000"
                  />

                  <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />
                  <div className="absolute top-6 left-6 right-6">
                     <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl flex items-center gap-4 border border-white">
                        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                           <Truck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Live Tracking</p>
                           <p className="text-sm font-bold text-slate-900 leading-none">Biker: Terminus → Rayfield</p>
                        </div>
                     </div>
                  </div>
               </div>
               
               {/* Decorative floating element */}
               <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-2xl border border-slate-100 z-20 hidden lg:block animate-bounce-subtle">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                     </div>
                     <div>
                        <p className="text-xs font-black text-slate-900 uppercase">Insured</p>
                        <p className="text-[10px] text-slate-400">Secure Delivery</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <div className="py-12 border-b border-slate-50 overflow-hidden bg-white">
        <div className="container mx-auto px-6">
           <div className="flex flex-wrap items-center justify-center gap-12 opacity-30 grayscale transition-all hover:opacity-50 hover:grayscale-0">
              <span className="text-xl font-black tracking-tighter text-slate-500 italic">EVERYONE</span>
              <span className="text-xl font-black tracking-tighter text-slate-500">METROLINE</span>
              <span className="text-xl font-black tracking-tighter text-slate-500 italic">SWIFTPACK</span>
              <span className="text-xl font-black tracking-tighter text-slate-500">NEXUSFLY</span>
              <span className="text-xl font-black tracking-tighter text-slate-500 italic">CITYDROP</span>
           </div>
        </div>
      </div>

      {/* Services Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-20 space-y-4">
             <h2 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.4em]">Our Core Services</h2>
             <p className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Professional solutions for <br/> the Jos community.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-12 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-500">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-8 shadow-sm border border-slate-100">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Inter-City Shipping</h3>
              <p className="text-slate-500 leading-relaxed font-medium text-sm">Send and receive packages across Jos and other major cities with guaranteed safety.</p>
            </div>

            <div className="group p-12 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-500">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-8 shadow-sm border border-slate-100">
                <Box className="w-6 h-6 text-slate-900" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Last-Mile Delivery</h3>
              <p className="text-slate-500 leading-relaxed font-medium text-sm">Hyper-local delivery from Terminus to every corner of Jos in under 45 minutes.</p>
            </div>

            <div className="group p-12 rounded-2xl bg-orange-600 shadow-xl shadow-orange-600/20 text-white">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-8 shadow-sm">
                <Utensils className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Transly Food</h3>
              <p className="text-orange-50/80 leading-relaxed font-medium text-sm mb-8">Premium meals from our kitchen to your Jos doorstep. Fresh, hot, and exceptionally fast.</p>
              <Link href="/food" className="inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:translate-x-1 transition-transform">
                Browse Menu <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-6">
           <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
              <h2 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.4em]">How It Works</h2>
              <p className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Delivery in three simple steps.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
              {/* Connector Line */}
              <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px border-t border-dashed border-slate-300 z-0" />
              
              <div className="relative z-10 text-center space-y-6">
                 <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-xl border border-slate-100 group-hover:scale-110 transition-transform">
                    <Search className="w-10 h-10 text-orange-600" />
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-xl font-bold text-slate-900">1. Request</h4>
                    <p className="text-slate-500 text-sm font-medium">Enter your pick-up and drop-off locations in Jos.</p>
                 </div>
              </div>

              <div className="relative z-10 text-center space-y-6">
                 <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-xl border border-slate-100 group-hover:scale-110 transition-transform">
                    <Truck className="w-10 h-10 text-orange-600" />
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-xl font-bold text-slate-900">2. Match</h4>
                    <p className="text-slate-500 text-sm font-medium">We instantly match you with the nearest available biker.</p>
                 </div>
              </div>

              <div className="relative z-10 text-center space-y-6">
                 <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-xl border border-slate-100 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-10 h-10 text-orange-600" />
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-xl font-bold text-slate-900">3. Delivered</h4>
                    <p className="text-slate-500 text-sm font-medium">Track your biker in real-time until they reach your door.</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-32 bg-slate-950 text-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="lg:w-1/2 space-y-12">
               <div className="space-y-4">
                  <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">The Transly Advantage</h2>
                  <p className="text-5xl font-black tracking-tight leading-tight">Built for Jos. <br/> Optimized for reliability.</p>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <div className="space-y-4">
                     <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800">
                        <CheckCircle2 className="w-5 h-5 text-orange-500" />
                     </div>
                     <h4 className="text-lg font-bold">Jos Local Experts</h4>
                     <p className="text-sm text-slate-400 leading-relaxed">Our bikers know every street in Jos, ensuring no delays.</p>
                  </div>
                  <div className="space-y-4">
                     <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800">
                        <CheckCircle2 className="w-5 h-5 text-orange-500" />
                     </div>
                     <h4 className="text-lg font-bold">Secure Logistics</h4>
                     <p className="text-sm text-slate-400 leading-relaxed">State-of-the-art tracking and background-verified riders.</p>
                  </div>
                  <div className="space-y-4">
                     <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800">
                        <CheckCircle2 className="w-5 h-5 text-orange-500" />
                     </div>
                     <h4 className="text-lg font-bold">Transparent Pricing</h4>
                     <p className="text-sm text-slate-400 leading-relaxed">No hidden fees. See your price before you book.</p>
                  </div>
                  <div className="space-y-4">
                     <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800">
                        <CheckCircle2 className="w-5 h-5 text-orange-500" />
                     </div>
                     <h4 className="text-lg font-bold">24/7 Local Support</h4>
                     <p className="text-sm text-slate-400 leading-relaxed">Dedicated agents in Jos ready to help you anytime.</p>
                  </div>
               </div>
            </div>

            <div className="lg:w-1/2 relative">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4 pt-12">
                     <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
                        <p className="text-3xl font-black mb-1">10k+</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Delivered in Jos</p>
                     </div>
                     <div className="bg-orange-600 p-8 rounded-2xl text-white">
                        <p className="text-3xl font-black mb-1">99.9%</p>
                        <p className="text-[10px] font-black text-orange-200 uppercase tracking-widest">Success Rate</p>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
                        <p className="text-3xl font-black mb-1">24/7</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Help</p>
                     </div>
                     <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 h-64 overflow-hidden relative group">
                        <Image src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" width={2070} height={1380} alt="Dashboard" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" />
                        <div className="relative z-10">
                           <p className="text-sm font-bold leading-tight">Optimized <br/> Jos Logistics</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}

      <section className="py-32 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-6">
           <div className="bg-white rounded-2xl p-12 lg:p-24 text-center space-y-10 border border-slate-200 shadow-xl">
              <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight">Experience the future of <br/> Jos logistics today.</h2>
              <p className="max-w-xl mx-auto text-lg text-slate-500 font-medium">Join thousands of Jos residents and businesses who trust Transly for their daily needs.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Link href="/signup">
                    <Button size="lg" className="h-14 px-10 rounded-lg font-bold bg-slate-900 text-white">Get Started Free</Button>
                 </Link>
                 <Link href="/request">
                    <Button variant="outline" size="lg" className="h-14 px-10 rounded-lg font-bold border-slate-200">Book a Biker</Button>
                 </Link>
              </div>
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
