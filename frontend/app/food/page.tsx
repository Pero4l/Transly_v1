"use client";

import { useState, useEffect } from "react";
import { Utensils, ShoppingCart, Plus, Minus, X, Truck, User, MapPin, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/sessionContext";
import { toast } from "react-hot-toast";

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
}

interface CartItem extends FoodItem {
  quantity: number;
}

export default function FoodStorePage() {
  const { user, token } = useSession();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  // Delivery details
  const [deliveryType, setDeliveryType] = useState<'self' | 'third_party'>('self');
  const [address, setAddress] = useState(user?.address || "");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const res = await fetch("http://localhost:9400/food");
      const data = await res.json();
      setFoods(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch menu");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (food: FoodItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === food.id);
      if (existing) {
        return prev.map(item => item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...food, quantity: 1 }];
    });
    toast.success(`${food.name} added to cart`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const placeOrder = async () => {
    if (!token || !user) {
      toast.error("Please login to place an order");
      return;
    }
    if (!address) {
      toast.error("Please provide a delivery address");
      return;
    }

    setOrderLoading(true);
    try {
      const res = await fetch("http://localhost:9400/foodOrders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          deliveryType,
          deliveryAddress: address,
          receiverName: deliveryType === 'self' ? user.name : receiverName,
          receiverPhone: deliveryType === 'self' ? user.phone : receiverPhone,
          items: cart.map(item => ({ foodItemId: item.id, quantity: item.quantity }))
        })
      });

      if (res.ok) {
        const orderData = await res.json();
        toast.success("Order placed successfully! Tracking: " + orderData.shipment.trackingNumber);
        setCart([]);
        setIsCartOpen(false);
      } else {
        const errData = await res.json();
        toast.error(errData.message || "Failed to place order");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-orange-600 p-2.5 rounded-2xl shadow-lg ring-4 ring-orange-50">
                <Utensils className="h-6 w-6 text-white" />
             </div>
             <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Transly <span className="text-orange-600">Food</span></h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">Premium Delivery</p>
             </div>
          </div>

          <Button 
            onClick={() => setIsCartOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl flex gap-3 px-6 h-12 shadow-xl hover:shadow-2xl transition-all relative group"
          >
            <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold">Cart</span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] h-6 w-6 flex items-center justify-center rounded-full border-2 border-white font-black animate-in zoom-in duration-300">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
        <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 h-[300px] flex items-center px-12 group shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/40 to-transparent z-10" />
          <div className="z-20 max-w-xl space-y-4 animate-in slide-in-from-left-8 duration-700">
            <span className="px-4 py-1.5 bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full">Fastest Delivery</span>
            <h2 className="text-5xl font-black text-white leading-[1.1]">Craving Something <br/> Delicious?</h2>
            <p className="text-slate-400 font-medium">Order premium meals from Transly Kitchen and get them delivered to your doorstep in minutes.</p>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/2 opacity-40 group-hover:opacity-60 transition-opacity">
            <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="Hero" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1,2,3,4].map(n => <div key={n} className="h-80 bg-white rounded-[2.5rem] animate-pulse shadow-sm border border-slate-100" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            {foods.map((food) => (
              <div key={food.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
                <div className="aspect-[4/3] w-full overflow-hidden relative">
                   <img 
                    src={food.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop"} 
                    alt={food.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-slate-100">
                    <span className="text-orange-600 font-black text-lg">₦{food.price.toLocaleString()}</span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 truncate group-hover:text-orange-600 transition-colors">{food.name}</h3>
                  <p className="text-slate-500 text-xs line-clamp-2 mb-6 font-medium leading-relaxed">{food.description}</p>
                  <Button 
                    onClick={() => addToCart(food)}
                    className="mt-auto w-full bg-slate-50 hover:bg-orange-600 text-slate-800 hover:text-white rounded-2xl py-6 font-bold flex gap-2 transition-all border border-slate-100 hover:border-orange-500"
                  >
                    <Plus className="h-4 w-4" /> Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Your Basket</h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Transly Food Delivery</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} className="rounded-full hover:bg-white shadow-sm">
                <X className="h-6 w-6 text-slate-400" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <ShoppingCart className="h-16 w-16 mb-4" />
                  <p className="font-bold text-lg">Basket is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center animate-in slide-in-from-right-4 duration-300">
                        <div className="h-16 w-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                           <img src={item.imageUrl} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                          <p className="text-orange-600 font-extrabold text-xs">₦{item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-2xl border">
                          <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-400 hover:text-orange-600 transition-colors"><Minus className="h-3 w-3" /></button>
                          <span className="font-black text-sm text-slate-800 min-w-[20px] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-400 hover:text-orange-600 transition-colors"><Plus className="h-3 w-3" /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6 pt-6 border-t">
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest border-l-4 border-orange-600 pl-4">Delivery Setup</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                       <button 
                        onClick={() => setDeliveryType('self')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all ${deliveryType === 'self' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-100 bg-slate-50 grayscale opacity-60'}`}
                       >
                         <User className={`h-5 w-5 ${deliveryType === 'self' ? 'text-orange-600' : 'text-slate-400'}`} />
                         <span className={`text-[10px] font-black uppercase tracking-tight ${deliveryType === 'self' ? 'text-orange-700' : 'text-slate-500'}`}>For Myself</span>
                       </button>
                       <button 
                        onClick={() => setDeliveryType('third_party')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all ${deliveryType === 'third_party' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-100 bg-slate-50 grayscale opacity-60'}`}
                       >
                         <Truck className={`h-5 w-5 ${deliveryType === 'third_party' ? 'text-orange-600' : 'text-slate-400'}`} />
                         <span className={`text-[10px] font-black uppercase tracking-tight ${deliveryType === 'third_party' ? 'text-orange-700' : 'text-slate-500'}`}>Third Party</span>
                       </button>
                    </div>

                    <div className="space-y-4">
                      {deliveryType === 'third_party' && (
                        <>
                          <div className="animate-in slide-in-from-top-4 duration-300">
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Receiver Name</label>
                            <input 
                              value={receiverName}
                              onChange={e => setReceiverName(e.target.value)}
                              className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-orange-500 transition-all"
                              placeholder="Who is receiving?"
                            />
                          </div>
                          <div className="animate-in slide-in-from-top-4 duration-300">
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Receiver Phone</label>
                            <input 
                              value={receiverPhone}
                              onChange={e => setReceiverPhone(e.target.value)}
                              className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-orange-500 transition-all"
                              placeholder="Contact number"
                            />
                          </div>
                        </>
                      )}
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Delivery Address</label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-4.5 h-4 w-4 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                          <textarea 
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            className="w-full bg-slate-50 border-0 rounded-2xl pl-10 pr-4 py-4 text-sm font-medium focus:ring-2 focus:ring-orange-500 transition-all"
                            placeholder="Enter drop-off location"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 border-t bg-slate-50 shadow-inner">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-500 font-bold text-sm">Estimated Total</span>
                  <span className="text-2xl font-black text-slate-900">₦{total.toLocaleString()}</span>
                </div>
                <Button 
                  onClick={placeOrder}
                  disabled={orderLoading}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-8 rounded-[2rem] text-lg font-black shadow-xl hover:shadow-orange-600/30 transition-all group"
                >
                  {orderLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      Place Delivery Order
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </Button>
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">Safe & Secure Payment via Paystack</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
