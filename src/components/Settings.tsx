import { useState } from "react";
import { User, Mail, Globe, Save } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "motion/react";

export function Settings() {
  const [formData, setFormData] = useState({
    name: "Admin User",
    email: "admin@finora.com",
    currency: "₺",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Ayarlar başarıyla kaydedildi!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Ayarlar</h1>
        <p className="text-gray-500 mt-1">Profil bilgilerinizi ve uygulama tercihlerini yönetin.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" /> Ad Soyad
              </label>
              <input
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4" /> E-posta Adresi
              </label>
              <input
                type="email"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Varsayılan Para Birimi
              </label>
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all bg-white"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="₺">₺ (TRY)</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
              </select>
            </div>
          </div>

          <Button type="submit" className="w-full rounded-xl bg-gray-900 hover:bg-gray-800 text-white py-6">
            <Save className="w-4 h-4 mr-2" /> Değişiklikleri Kaydet
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
