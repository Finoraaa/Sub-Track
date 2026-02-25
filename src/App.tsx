import { useEffect, useState, useCallback } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { SummaryCards } from "./components/SummaryCards";
import { SubscriptionList } from "./components/SubscriptionList";
import { AddSubscriptionModal } from "./components/AddSubscriptionModal";
import { NotificationCenter } from "./components/NotificationCenter";
import { UserMenu } from "./components/UserMenu";
import { Settings } from "./components/Settings";
import { Limits } from "./components/Limits";
import { Help } from "./components/Help";
import { Logout } from "./components/Logout";

function Dashboard({ subscriptions, loading, fetchSubscriptions, handleDelete }: any) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Aboneliklerinizi ve harcamalarınızı buradan takip edin.</p>
        </div>
        <AddSubscriptionModal onSuccess={fetchSubscriptions} />
      </div>

      <SummaryCards subscriptions={subscriptions} loading={loading} />

      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Aboneliklerim</h2>
        </div>
        <SubscriptionList 
          subscriptions={subscriptions} 
          loading={loading} 
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}

export default function App() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const fetchSubscriptions = useCallback(async () => {
    try {
      const response = await fetch("/api/subscriptions");
      const result = await response.json();
      if (result.success) {
        setSubscriptions(result.data || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu aboneliği silmek istediğinize emin misiniz?")) return;
    
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchSubscriptions();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/logo.svg" alt="Finora Logo" className="w-8 h-8" />
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                SubTrack
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <NotificationCenter subscriptions={subscriptions} />
              <div className="w-px h-6 bg-gray-100 mx-2" />
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <Routes>
          <Route 
            path="/" 
            element={
              <Dashboard 
                subscriptions={subscriptions} 
                loading={loading} 
                fetchSubscriptions={fetchSubscriptions} 
                handleDelete={handleDelete} 
              />
            } 
          />
          <Route path="/settings" element={<Settings />} />
          <Route path="/limits" element={<Limits />} />
          <Route path="/help" element={<Help />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Finora Logo" className="w-5 h-5 opacity-50" />
            <span className="text-sm text-gray-400 font-medium">A Finora Product</span>
          </div>
          <div className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} SubTrack. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}
