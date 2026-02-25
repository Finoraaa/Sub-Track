import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Loader2 } from "lucide-react";
import { motion } from "motion/react";

export function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto">
          <LogOut className="w-10 h-10 text-gray-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Güle Güle!</h1>
          <p className="text-gray-500">Güvenli bir şekilde çıkış yapılıyor...</p>
        </div>
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
      </motion.div>
    </div>
  );
}
