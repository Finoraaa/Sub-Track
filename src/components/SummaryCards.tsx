import { CreditCard, Calendar, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

interface SummaryCardsProps {
  subscriptions: any[];
  loading?: boolean;
}

export function SummaryCards({ subscriptions = [], loading }: SummaryCardsProps) {
  const calculateMonthlyTotal = () => {
    return (subscriptions || []).reduce((acc, sub) => {
      const price = sub?.price || 0;
      if (sub?.cycle === "YEARLY") {
        return acc + price / 12;
      }
      return acc + price;
    }, 0);
  };

  const monthlyTotal = calculateMonthlyTotal();
  const upcomingCount = (subscriptions || []).length;

  const cards = [
    {
      title: "Aylık Toplam",
      value: `${monthlyTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Aktif Abonelik",
      value: subscriptions.length.toString(),
      icon: CreditCard,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Yaklaşan Ödemeler",
      value: upcomingCount.toString(),
      icon: Calendar,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-white border border-gray-100 rounded-2xl animate-pulse shadow-sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-xl ${card.bg}`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{card.title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
