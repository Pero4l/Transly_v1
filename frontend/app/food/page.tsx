"use client";

import { useState, useEffect } from "react";
import {
  Utensils,
  ShoppingCart,
  Plus,
  Minus,
  X,
  Truck,
  User,
  MapPin,
  Loader2,
  ArrowRight,
  Menu,
  Bell,
  Check,
  LayoutDashboard,
  PackageSearch,
  Users,
  MessageCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/sessionContext";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useGoogleMaps } from "@/components/providers/GoogleMapsProvider";
import { Autocomplete } from "@react-google-maps/api";
import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import Image from "next/image";

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
  const router = useRouter();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Delivery details
  const [deliveryType, setDeliveryType] = useState<"self" | "third_party">(
    "self",
  );
  const [address, setAddress] = useState(user?.address || "");
  const [distance, setDistance] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [settings, setSettings] = useState({
    FOOD_BASE_FARE: "100",
    FOOD_PRICE_PER_KM: "200",
    FOOD_ORIGIN_LOCATION: "Transly Kitchen, Jos",
  });
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    fetchFoods();
    if (user && token) {
      fetchNotifications();
      fetchSettings();
      const socket = getSocket();
      socket.emit("join_personal_room", user.id);
      socket.on("notification", (data: any) => {
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            message: data.message,
            read: false,
            createdAt: data.createdAt || new Date().toISOString(),
            type: data.type || "info",
          },
          ...prev,
        ]);
      });
      return () => {
        socket.off("notification");
      };
    }
  }, [user, token]);

  const fetchSettings = async () => {
    try {
      const res = await apiFetch("/admin/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings((prev) => ({
            ...prev,
            FOOD_BASE_FARE:
              data.settings.FOOD_BASE_FARE || data.settings.BASE_FARE || "100",
            FOOD_PRICE_PER_KM:
              data.settings.FOOD_PRICE_PER_KM ||
              data.settings.PRICE_PER_MILE ||
              "200",
            FOOD_ORIGIN_LOCATION:
              data.settings.FOOD_ORIGIN_LOCATION || "Transly Kitchen, Jos",
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const calculateDistance = (destAddress: string) => {
    if (!isLoaded || !destAddress) return;

    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [settings.FOOD_ORIGIN_LOCATION],
        destinations: [destAddress],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (
          status === "OK" &&
          response &&
          response.rows[0].elements[0].status === "OK"
        ) {
          const distInMeters = response.rows[0].elements[0].distance.value;
          const distInKm = distInMeters / 1000;
          setDistance(distInKm);

          const base = parseFloat(settings.FOOD_BASE_FARE || "100");
          const rate = parseFloat(settings.FOOD_PRICE_PER_KM || "200");
          const fee = base + distInKm * rate;
          setDeliveryFee(fee);
        } else {
          console.error("Distance Matrix failed:", status);
          setDeliveryFee(parseFloat(settings.FOOD_BASE_FARE || "100"));
        }
      },
    );
  };

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch("/notifications", {}, token);
      const data = await res.json();
      if (data.success) setNotifications(data.notifications);
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await apiFetch(
        "/notifications/read-all",
        { method: "PUT" },
        token,
      );
      if (res.ok)
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchFoods = async () => {
    try {
      const res = await apiFetch("/food");
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
    setCart((prev) => {
      const existing = prev.find((item) => item.id === food.id);
      if (existing) {
        return prev.map((item) =>
          item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { ...food, quantity: 1 }];
    });
    toast.success(`${food.name} added to cart`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
      const res = await apiFetch(
        "/foodOrders",
        {
          method: "POST",
          body: JSON.stringify({
            deliveryType,
            deliveryAddress: address,
            receiverName: deliveryType === "self" ? user.name : receiverName,
            receiverPhone: deliveryType === "self" ? user.phone : receiverPhone,
            items: cart.map((item) => ({
              foodItemId: item.id,
              quantity: item.quantity,
            })),
            distance: distance,
          }),
        },
        token,
      );

      if (res.ok) {
        const orderData = await res.json();
        const shipmentId = orderData.shipmentId;

        if (shipmentId) {
          toast.success("Order placed! Initializing payment...");
          try {
            const payRes = await apiFetch(
              "/payment/initialize",
              {
                method: "POST",
                body: JSON.stringify({ shipmentId }),
              },
              token,
            );

            if (payRes.ok) {
              const payData = await payRes.json();
              if (payData.authorization_url) {
                // Redirect to Paystack
                window.location.href = payData.authorization_url;
                return;
              }
            } else {
              toast.error(
                "Failed to initialize payment, please pay from dashboard",
              );
            }
          } catch (payErr) {
            console.error("Payment Init Error:", payErr);
            toast.error("An error occurred during payment setup");
          }
        } else {
          toast.success("Order placed successfully!");
        }

        setCart([]);
        setIsCartOpen(false);
        router.push("/dashboard");
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
      <div className="bg-white border-b sticky top-0 z-40 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Transly Logo"
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
              />
              <div className="sm:block border-l pl-3 border-slate-200">
                <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">
                  Food
                </h1>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">
                  Premium Delivery in Jos
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-600 hover:bg-slate-50 rounded-lg"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {showNotifications && (
                <div className="absolute -left-36 mt-2 w-72 md:w-80 bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden z-[100]">
                  <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-semibold text-slate-800 text-sm">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-orange-600 hover:underline flex items-center"
                      >
                        <Check className="h-3 w-3 mr-1" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n: any) => (
                        <div
                          key={n.id}
                          className={`p-3 border-b border-slate-50 text-sm ${n.read ? "opacity-60 bg-white" : "bg-orange-50/50"}`}
                        >
                          <p className="text-slate-800 font-medium">
                            {n.message}
                          </p>
                          <span className="text-xs text-slate-500 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={() => setIsCartOpen(true)}
              variant="ghost"
              size="icon"
              className="relative text-slate-600 hover:bg-slate-50 rounded-lg group"
            >
              <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[9px] h-5 w-5 flex items-center justify-center rounded-full border-2 border-white font-black animate-in zoom-in duration-300 shadow-sm">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </Button>

            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100"
            >
              <div className="h-6 w-6 rounded-md bg-slate-200 overflow-hidden">
                <User className="h-full w-full p-1 text-slate-500" />
              </div>
              <span className="text-xs font-bold text-slate-700">
                {user?.name?.split(" ")[0] || "Profile"}
              </span>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-10 space-y-12">
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 h-[300px] flex items-center px-12 group shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/40 to-transparent z-10" />
          <div className="z-20 max-w-xl space-y-4 animate-in slide-in-from-left-8 duration-700">
            <span className="px-4 py-1.5 bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-md">
              Fastest Delivery in Jos
            </span>
            <h2 className="text-5xl font-black text-white leading-[1.1]">
              Craving Something <br /> Delicious?
            </h2>
            <p className="text-slate-300 font-medium">
              Order premium meals from Transly Kitchen and get them delivered to
              your Jos doorstep in minutes.
            </p>
          </div>
          <div className="absolute right-0 top-0 h-full w-full opacity-70 group-hover:opacity-60 transition-opacity">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
              className="w-full h-full object-cover"
              alt="Hero"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-80 bg-white rounded-2xl animate-pulse shadow-sm border border-slate-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            {foods.map((food) => (
              <div
                key={food.id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
              >
                <div className="aspect-[4/3] w-full overflow-hidden relative">
                  <img
                    src={
                      food.imageUrl ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop"
                    }
                    alt={food.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-lg shadow-xl border border-slate-100">
                    <span className="text-orange-600 font-black text-lg">
                      ₦{food.price.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 truncate group-hover:text-orange-600 transition-colors">
                    {food.name}
                  </h3>
                  <p className="text-slate-500 text-xs line-clamp-2 mb-6 font-medium leading-relaxed">
                    {food.description}
                  </p>
                  <Button
                    onClick={() => addToCart(food)}
                    className="mt-auto w-full bg-orange-500 hover:bg-orange-600 text-slate-800 hover:text-white rounded-lg py-6 font-bold flex gap-2 transition-all border border-slate-100 hover:border-orange-500"
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
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Your Basket
                </h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                  Transly Food Delivery Jos
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(false)}
                className="rounded-lg hover:bg-white shadow-sm"
              >
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
                      <div
                        key={item.id}
                        className="flex gap-4 items-center animate-in slide-in-from-right-4 duration-300"
                      >
                        <div className="h-16 w-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          <img
                            src={item.imageUrl}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-sm">
                            {item.name}
                          </h4>
                          <p className="text-orange-600 font-extrabold text-xs">
                            ₦{item.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="text-slate-400 hover:text-orange-600 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-black text-sm text-slate-800 min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="text-slate-400 hover:text-orange-600 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6 pt-6 border-t">
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest border-l-4 border-orange-600 pl-4">
                      Delivery Setup
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setDeliveryType("self")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${deliveryType === "self" ? "border-orange-500 bg-orange-50/50" : "border-slate-100 bg-slate-50 grayscale opacity-60"}`}
                      >
                        <User
                          className={`h-5 w-5 ${deliveryType === "self" ? "text-orange-600" : "text-slate-400"}`}
                        />
                        <span
                          className={`text-[10px] font-black uppercase tracking-tight ${deliveryType === "self" ? "text-orange-700" : "text-slate-500"}`}
                        >
                          For Myself
                        </span>
                      </button>
                      <button
                        onClick={() => setDeliveryType("third_party")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${deliveryType === "third_party" ? "border-orange-500 bg-orange-50/50" : "border-slate-100 bg-slate-50 grayscale opacity-60"}`}
                      >
                        <Truck
                          className={`h-5 w-5 ${deliveryType === "third_party" ? "text-orange-600" : "text-slate-400"}`}
                        />
                        <span
                          className={`text-[10px] font-black uppercase tracking-tight ${deliveryType === "third_party" ? "text-orange-700" : "text-slate-500"}`}
                        >
                          Third Party
                        </span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {deliveryType === "third_party" && (
                        <>
                          <div className="animate-in slide-in-from-top-4 duration-300">
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">
                              Receiver Name
                            </label>
                            <input
                              value={receiverName}
                              onChange={(e) => setReceiverName(e.target.value)}
                              className="w-full bg-slate-50 border-0 rounded-xl p-4 text-sm font-medium focus:ring-0 focus:outline-none transition-all"
                              placeholder="Who is receiving?"
                            />
                          </div>
                          <div className="animate-in slide-in-from-top-4 duration-300">
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">
                              Receiver Phone
                            </label>
                            <input
                              value={receiverPhone}
                              onChange={(e) => setReceiverPhone(e.target.value)}
                              className="w-full bg-slate-50 border-0 rounded-xl p-4 text-sm font-medium focus:ring-0 focus:outline-none transition-all"
                              placeholder="Contact number"
                            />
                          </div>
                        </>
                      )}
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">
                          Delivery Address in Jos
                        </label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-5 h-4 w-4 text-slate-400 group-focus-within:text-orange-600 transition-colors z-10" />
                          {isLoaded ? (
                            <Autocomplete
                              onLoad={(autocomplete) => {
                                autocompleteRef.current = autocomplete;
                              }}
                              onPlaceChanged={() => {
                                if (autocompleteRef.current) {
                                  const place =
                                    autocompleteRef.current.getPlace();
                                  if (place.formatted_address) {
                                    setAddress(place.formatted_address);
                                    calculateDistance(place.formatted_address);
                                  }
                                }
                              }}
                            >
                              <input
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full bg-slate-50 border-0 rounded-xl pl-10 pr-4 py-4 text-sm font-medium focus:ring-0 focus:outline-none transition-all"
                                placeholder="Enter Jos drop-off location"
                              />
                            </Autocomplete>
                          ) : (
                            <input
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              className="w-full bg-slate-50 border-0 rounded-xl pl-10 pr-4 py-4 text-sm font-medium focus:ring-0 focus:outline-none transition-all"
                              placeholder="Loading maps..."
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 border-t bg-slate-50 shadow-inner space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-bold">
                      Items Total
                    </span>
                    <span className="text-slate-900 font-bold">
                      ₦{total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-bold">
                      Delivery Fee (Jos)
                    </span>
                    <span className="text-orange-600 font-bold">
                      ₦{deliveryFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <span className="text-slate-900 font-extrabold">
                      Total Amount
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      ₦{(total + deliveryFee).toLocaleString()}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={placeOrder}
                  disabled={orderLoading}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-8 rounded-xl text-lg font-black shadow-xl transition-all group"
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
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
                  Safe & Secure Payment via Paystack
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="absolute top-0 right-0 bottom-0 w-72 bg-white flex flex-col p-6 space-y-2 shadow-2xl animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center mb-8">
              <span className="font-black text-xl text-slate-900">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-slate-400" />
              </Button>
            </div>

            <Link
              href={user?.role === "admin" ? "/admin" : "/dashboard"}
              className="flex items-center px-4 py-3 text-sm font-semibold rounded-lg bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all"
            >
              <LayoutDashboard className="h-5 w-5 mr-3 text-slate-400" />
              Dashboard
            </Link>

            <Link
              href="/profile"
              className="flex items-center px-4 py-3 text-sm font-semibold rounded-lg bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all"
            >
              <User className="h-5 w-5 mr-3 text-slate-400" />
              Profile Settings
            </Link>

            {user?.role !== "admin" && user?.role !== "driver" && (
              <Link
                href="/request"
                className="flex items-center px-4 py-3 text-sm font-semibold rounded-lg bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all"
              >
                <Send className="h-5 w-5 mr-3 text-slate-400" />
                Send Package
              </Link>
            )}

            <Link
              href="/tracking"
              className="flex items-center px-4 py-3 text-sm font-semibold rounded-lg bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all"
            >
              <PackageSearch className="h-5 w-5 mr-3 text-slate-400" />
              Track Package
            </Link>

            <Link
              href="/food"
              className="flex items-center px-4 py-3 text-sm font-semibold rounded-lg bg-orange-600 text-white shadow-lg"
            >
              <Utensils className="h-5 w-5 mr-3" />
              Order Food
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
