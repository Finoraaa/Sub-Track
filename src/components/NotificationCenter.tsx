import { Bell, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format, isBefore, addDays } from "date-fns";
import { tr } from "date-fns/locale";

interface NotificationCenterProps {
  subscriptions: any[];
}

export function NotificationCenter({ subscriptions }: NotificationCenterProps) {
  const upcomingPayments = (subscriptions || []).filter((sub) => {
    if (!sub?.nextPaymentDate) return false;
    try {
      const nextDate = new Date(sub.nextPaymentDate);
      const now = new Date();
      const threeDaysFromNow = addDays(now, 3);
      return isBefore(nextDate, threeDaysFromNow) && !isBefore(nextDate, now);
    } catch (e) {
      return false;
    }
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
          {upcomingPayments.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Yaklaşan Ödemeler</h4>
            <span className="text-xs text-gray-500">{upcomingPayments.length} Bildirim</span>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {upcomingPayments.length > 0 ? (
              upcomingPayments.map((sub) => (
                <div key={sub.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{sub.name}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(sub.nextPaymentDate), "d MMMM", { locale: tr })} • {sub.price} {sub.currency}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500">Şu an yaklaşan ödemeniz bulunmamaktadır.</p>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
