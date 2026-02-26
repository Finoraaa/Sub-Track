import { useState } from "react";
import { ShieldAlert, TrendingDown, Wallet } from "lucide-react";
import { motion } from "motion/react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "../lib/utils";

const Progress = ({ value, className }: { value: number; className?: string }) => (
  <ProgressPrimitive.Root
    className={cn("relative h-4 w-full overflow-hidden rounded-full bg-gray-100", className)}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 transition-all duration-500 ease-in-out",
        value > 90 ? "bg-red-500" : value > 70 ? "bg-orange-500" : "bg-emerald-500"
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
);

export function Limits({ subscriptions = [] }: { subscriptions: any[] }) {
  const [limit, setLimit] = useState(2500);
  
  const currentSpending = subscriptions.reduce((acc, sub) => {
    const price = sub.price || 0;
    if (sub.cycle === "YEARLY") return acc + price / 12;
    return acc + price;
  }, 0);

  const percentage = Math.min((currentSpending / limit) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Harcama Limitleri</h1>
        <p className="text-gray-500 mt-1">Aylık bütçenizi belirleyin ve harcamalarınızı kontrol altında tutun.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold">Aylık Bütçe</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-500">Mevcut Harcama</p>
                <p className="text-2xl font-bold text-gray-900">{currentSpending.toLocaleString("tr-TR")} ₺</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Bütçe Sınırı</p>
                <input
                  type="number"
                  className="text-xl font-bold text-gray-900 bg-transparent border-b border-gray-200 focus:border-gray-900 outline-none w-24 text-right"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                />
                <span className="ml-1 font-bold">₺</span>
              </div>
            </div>

            <Progress value={percentage} />
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">%{percentage.toFixed(1)} kullanıldı</span>
              <span className={cn("font-medium", percentage > 90 ? "text-red-500" : "text-emerald-500")}>
                {(limit - currentSpending).toLocaleString("tr-TR")} ₺ kaldı
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold">Uyarılar</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex gap-3">
              <TrendingDown className="w-5 h-5 text-gray-400" />
              <p className="text-sm text-gray-600">
                Bütçenizin %80'ine ulaştığınızda size bir bildirim göndereceğiz.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex gap-3">
              <ShieldAlert className="w-5 h-5 text-gray-400" />
              <p className="text-sm text-gray-600">
                Limitinizi aştığınızda yeni abonelik eklemeleri için onay isteyeceğiz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
