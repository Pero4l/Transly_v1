"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { DUMMY_SHIPMENTS } from "@/lib/dummy-data";
import { PackagePlus, ArrowRight, ArrowUpRight, Box, Clock, MessageCircle, Send, X, ShieldAlert, Navigation } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "admin", text: "Hello! Need help with your deliveries? I'm the admin.", time: "10:00 AM" }
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages([...messages, { sender: "user", text: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setNewMessage("");
    // Simulate admin reply
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: "admin", text: "Thanks for reaching out! Looking into this now.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative pb-10">
      <Navbar />
      
      {/* Welcome Banner */}
      <div className="bg-orange-600 w-full pt-10 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back, Jane</h1>
              <p className="text-orange-100 mt-1">Here is the latest status of your logistical network.</p>
            </div>
            <Link href="/request">
              <Button className="bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-lg">
                <PackagePlus className="mr-2 h-5 w-5" />
                New Shipment
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 max-w-7xl -mt-10">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">In Transit</CardTitle>
              <div className="p-2 bg-amber-100 text-amber-600 rounded-full">
                <Clock className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">2</div>
              <p className="text-sm text-slate-500 mt-1 font-medium text-amber-600">Packages arriving soon</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Delivered</CardTitle>
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                <Box className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">14</div>
              <p className="text-sm text-slate-500 mt-1">Total delivered this month</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-orange-600 to-orange-800 text-white relative overflow-hidden">
             <ShieldAlert className="absolute -right-6 -bottom-6 w-32 h-32 text-white opacity-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-orange-100 relative z-10">
              <CardTitle className="text-sm font-semibold text-white uppercase tracking-wider">Pending Action</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-white">1</div>
              <p className="text-sm text-orange-200 mt-1">Draft shipment requires payment</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Active Shipments</h2>
          <Button variant="outline" size="sm" className="hidden sm:flex">View all history</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2 space-y-4">
            {DUMMY_SHIPMENTS.map((shipment) => (
              <Card key={shipment.id} className="card-hover border-0 shadow-sm flex flex-col hover:border-orange-200 hover:ring-1 hover:ring-orange-600 transition-all overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                       <CardTitle className="text-lg font-bold text-slate-900">{shipment.id}</CardTitle>
                       <Badge variant={shipment.status === 'delivered' ? 'success' : shipment.status === 'in-transit' ? 'warning' : 'default'} className="md:hidden">
                         {shipment.status.replace('-', ' ').toUpperCase()}
                       </Badge>
                    </div>
                    
                    <div className="flex items-center text-sm text-slate-600 mb-4 bg-slate-50 w-full rounded-md p-2 border border-slate-100">
                      <div className="font-semibold text-slate-800">{shipment.origin}</div>
                      <ArrowRight className="h-4 w-4 text-orange-600 mx-3 flex-shrink-0" />
                      <div className="font-semibold text-slate-800">{shipment.destination}</div>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                      <p><span className="text-slate-400">To:</span> <span className="font-medium text-slate-700">{shipment.recipient}</span></p>
                      <p><span className="text-slate-400">Placed:</span> <span className="font-medium text-slate-700">{shipment.date}</span></p>
                      <p><span className="text-slate-400">ETA:</span> <span className="font-medium text-slate-700">{shipment.estimatedDelivery}</span></p>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 sm:w-48 gap-3">
                    <Badge variant={shipment.status === 'delivered' ? 'success' : shipment.status === 'in-transit' ? 'warning' : 'default'} className="hidden md:inline-flex mb-2 shadow-sm">
                      {shipment.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                    <Link href={`/tracking?id=${shipment.id}`} className="w-full">
                      <Button variant="outline" className="w-full flex justify-between bg-white hover:bg-slate-50 border-slate-200">
                        Track
                        <Navigation className="h-4 w-4 text-slate-400" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="col-span-1 space-y-6">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold">Recent Updates</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                 <div className="flex gap-4">
                    <div className="h-2 w-2 mt-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_theme(colors.emerald.100)] flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Delivery Successful</h4>
                      <p className="text-xs text-slate-500">TRK-009842 arrived in Austin, TX.</p>
                      <span className="text-xs text-slate-400 mt-1 block">2 days ago</span>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="h-2 w-2 mt-2 rounded-full bg-amber-500 shadow-[0_0_0_4px_theme(colors.amber.100)] flex-shrink-0" />
                    <div>
                       <h4 className="text-sm font-semibold text-slate-900">In Transit</h4>
                       <p className="text-xs text-slate-500">TRK-009841 has departed the facility in Denver, CO.</p>
                       <span className="text-xs text-slate-400 mt-1 block">Yesterday</span>
                    </div>
                 </div>
                 <Button variant="link" className="w-full text-orange-600 mt-2">View timeline</Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-orange-50 border-orange-100">
              <CardContent className="p-6 text-center">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-orange-600">
                   <MessageCircle className="h-6 w-6" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900 mb-2">Need Help?</h3>
                 <p className="text-sm text-slate-600 mb-4">Our support team is available 24/7 to assist with your shipments.</p>
                 <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-sm" onClick={() => setIsChatOpen(true)}>
                   Open Support Chat
                 </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className="mb-4 w-[350px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[450px] animate-in slide-in-from-bottom-4 zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-orange-600 p-4 text-white flex justify-between items-center shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                    AD
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-orange-600"></div>
                </div>
                <div>
                  <h3 className="font-bold text-sm">Admin Support</h3>
                  <p className="text-xs text-orange-100">Usually replies in minutes</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close Chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 flex flex-col">
              <div className="text-center text-xs text-slate-400 my-2">Today</div>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-orange-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'
                  }`}>
                    {msg.text}
                    <div className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-orange-200' : 'text-slate-400'}`}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
              <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..." 
                className="flex-1 rounded-full bg-slate-50 border-slate-200 focus:bg-white"
              />
              <Button type="submit" size="icon" className="rounded-full h-10 w-10 shrink-0 bg-orange-600 hover:bg-orange-700 shadow-sm" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
        
        {!isChatOpen && (
          <Button 
            onClick={() => setIsChatOpen(true)}
            size="icon" 
            className="h-14 w-14 rounded-full bg-orange-600 hover:bg-orange-700 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
            aria-label="Open Chat"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  );
}
