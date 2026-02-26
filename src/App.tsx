import { useEffect, useState, useCallback } from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { 
  SignedIn, 
  SignedOut, 
  SignIn, 
  SignUp, 
  useAuth,
  useUser
} from "@clerk/clerk-react";
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

function AuthPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex flex-col items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-md">
              F
            </div>
            <span className="font-bold text-3xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              SubTrack
            </span>
          </Link>
          <p className="text-gray-500 text-sm font-medium">A Finora Product</p>
        </div>
        <div className="bg-white p-2 rounded-3xl shadow-xl border border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  const fetchSubscriptions = useCallback(async () => {
    if (!isSignedIn || !user) return;
    
    try {
      const token = await getToken();
      const response = await fetch(`/api/subscriptions?userId=${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Sunucu hatası: ${response.status}`);
        } else {
          throw new Error(`Sunucu hatası: ${response.status}. Beklenen JSON yanıtı alınamadı.`);
        }
      }

      const result = await response.json();
      if (result.success) {
        setSubscriptions(result.data || []);
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, getToken]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu aboneliği silmek istediğinize emin misiniz?")) return;
    
    try {
      const token = await getToken();
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        await fetchSubscriptions();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchSubscriptions();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, fetchSubscriptions]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <img src="/logo.svg" alt="Logo" className="w-12 h-12 opacity-20" />
          <div className="h-2 w-32 bg-gray-200 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route 
        path="/sign-in/*" 
        element={
          <AuthPage>
            <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
          </AuthPage>
        } 
      />
      <Route 
        path="/sign-up/*" 
        element={
          <AuthPage>
            <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
          </AuthPage>
        } 
      />

      {/* Protected App Routes */}
      <Route
        path="*"
        element={
          <>
            <SignedIn>
              <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans flex flex-col">
                {/* Navigation */}
                <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                      <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                          <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
                            F
                          </div>
                          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            SubTrack
                          </span>
                        </Link>
                        
                        <div className="hidden md:flex items-center gap-1">
                          <Link 
                            to="/" 
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              location.pathname === "/" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            Dashboard
                          </Link>
                          <Link 
                            to="/limits" 
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              location.pathname === "/limits" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            Limitler
                          </Link>
                          <Link 
                            to="/settings" 
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              location.pathname === "/settings" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            Ayarlar
                          </Link>
                          <Link 
                            to="/help" 
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              location.pathname === "/help" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            Yardım
                          </Link>
                        </div>
                      </div>
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
                    <Route path="/limits" element={<Limits subscriptions={subscriptions} />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/logout" element={<Logout />} />
                    {/* Catch all within SignedIn to redirect to Dashboard */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>

                {/* Footer */}
                <footer className="border-t border-gray-100 bg-white py-12">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                      <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                            F
                          </div>
                          <span className="font-bold text-gray-900">SubTrack</span>
                        </div>
                        <p className="text-xs text-gray-400">A Finora Product</p>
                      </div>
                      
                      <div className="flex gap-8 text-xs font-medium text-gray-400 uppercase tracking-widest">
                        <Link to="/help" className="hover:text-gray-900 transition-colors">Yardım</Link>
                        <Link to="/settings" className="hover:text-gray-900 transition-colors">Ayarlar</Link>
                        <Link to="/limits" className="hover:text-gray-900 transition-colors">Limitler</Link>
                      </div>

                      <div className="text-xs text-gray-400 font-medium">
                        &copy; {new Date().getFullYear()} SubTrack. All rights reserved.
                      </div>
                    </div>
                  </div>
                </footer>
              </div>
            </SignedIn>
            <SignedOut>
              {/* If signed out and trying to access any protected route, redirect to sign-in */}
              <Navigate to="/sign-in" replace />
            </SignedOut>
          </>
        }
      />
    </Routes>
  );
}
