import { useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface AddSubscriptionModalProps {
  onSuccess: () => void;
}

export function AddSubscriptionModal({ onSuccess }: AddSubscriptionModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    currency: "₺",
    cycle: "MONTHLY",
    category: "Eğlence",
    startDate: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setOpen(false);
        setFormData({
          name: "",
          price: "",
          currency: "₺",
          cycle: "MONTHLY",
          category: "Eğlence",
          startDate: new Date().toISOString().split("T")[0],
        });
        onSuccess();
      } else {
        setError(result.error || "Abonelik eklenirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error adding subscription:", error);
      setError("Sunucuya bağlanırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Abonelik
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Abonelik Ekle</DialogTitle>
          <DialogDescription>
            Yeni bir abonelik ekleyerek harcamalarınızı takip etmeye başlayın.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-xl border border-red-100">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Platform Adı</label>
            <input
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
              placeholder="Netflix, Spotify, AWS..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Fiyat</label>
              <input
                required
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Para Birimi</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all bg-white"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="₺">₺ (TRY)</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Döngü</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all bg-white"
                value={formData.cycle}
                onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
              >
                <option value="MONTHLY">Aylık</option>
                <option value="YEARLY">Yıllık</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Kategori</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all bg-white"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Eğlence">Eğlence</option>
                <option value="Fatura">Fatura</option>
                <option value="Eğitim">Eğitim</option>
                <option value="Yazılım">Yazılım</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
            <input
              required
              type="date"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white"
          >
            {loading ? "Ekleniyor..." : "Aboneliği Kaydet"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
