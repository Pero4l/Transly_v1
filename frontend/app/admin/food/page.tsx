"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Save, X, Utensils, IndianRupee, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/sessionContext";
import { toast } from "sonner";

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
}

export default function AdminFoodPage() {
  const { token } = useSession();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);

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
      toast.error("Failed to load food menu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      if (image) formData.append("image", image);

      const res = await fetch("http://localhost:9400/food", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        toast.success("Food item added!");
        setIsAdding(false);
        resetForm();
        fetchFoods();
      } else {
        toast.error("Failed to add food");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`http://localhost:9400/food/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Deleted successfully");
        fetchFoods();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Utensils className="h-6 w-6 text-orange-600" />
            Food Menu Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Add or update food items and prices for Transly Delivery</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl flex gap-2">
            <Plus className="h-4 w-4" /> Add Food Item
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border-t-4 border-orange-600 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">New Food Product</h2>
            <Button variant="ghost" onClick={() => setIsAdding(false)} className="text-slate-400">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <form onSubmit={handleAddFood} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Food Name</label>
                <input 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Smash Burger"
                  className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 transition-all font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the food..."
                  rows={3}
                  className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 transition-all font-medium text-slate-800"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Price (₦)</label>
                <input 
                  required
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 transition-all font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Food Image</label>
                <div className="relative group cursor-pointer">
                  <input 
                    type="file" 
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    accept="image/*"
                  />
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center group-hover:border-orange-500 transition-colors">
                    <ImageIcon className="h-8 w-8 text-slate-300 group-hover:text-orange-500 mb-2" />
                    <p className="text-sm font-medium text-slate-500">{image ? image.name : "Click to upload image"}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={uploading}
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 rounded-xl"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Food Item
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-sm border">
        {foods.length === 0 ? (
          <div className="text-center py-16">
            <Utensils className="h-12 w-12 text-slate-100 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">No food items added yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">Start building your menu by clicking the Add Food Item button at the top right.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods.map((food) => (
              <div key={food.id} className="group relative bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="aspect-video w-full bg-slate-100 relative">
                  {food.imageUrl ? (
                    <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Utensils className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-slate-600 hover:text-orange-600 shadow-lg">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(food.id)}
                      className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-slate-600 hover:text-red-600 shadow-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{food.name}</h3>
                    <span className="text-orange-600 font-extrabold text-lg">₦{food.price.toLocaleString()}</span>
                  </div>
                  <p className="text-slate-500 text-xs line-clamp-2 mb-4">{food.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${food.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {food.isAvailable ? "Available" : "Sold Out"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
