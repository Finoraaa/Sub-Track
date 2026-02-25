import { 
  User, 
  Settings as SettingsIcon, 
  ShieldAlert, 
  HelpCircle, 
  LogOut 
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="outline-none">
          <Avatar className="h-8 w-8 border border-gray-200 hover:border-gray-300 transition-colors">
            <AvatarImage src="https://picsum.photos/seed/admin/100/100" />
            <AvatarFallback className="text-xs font-bold text-gray-500">AU</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-2">
        <div className="flex items-center gap-2 p-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://picsum.photos/seed/admin/100/100" />
            <AvatarFallback>AU</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">Admin User</span>
            <span className="text-xs text-gray-500">admin@finora.com</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <Link to="/settings">
          <DropdownMenuItem className="gap-2 cursor-pointer">
            <User className="w-4 h-4" />
            Hesabım
          </DropdownMenuItem>
        </Link>
        <Link to="/settings">
          <DropdownMenuItem className="gap-2 cursor-pointer">
            <SettingsIcon className="w-4 h-4" />
            Ayarlar
          </DropdownMenuItem>
        </Link>
        <Link to="/limits">
          <DropdownMenuItem className="gap-2 cursor-pointer">
            <ShieldAlert className="w-4 h-4" />
            Harcama Limitleri
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <Link to="/help">
          <DropdownMenuItem className="gap-2 cursor-pointer">
            <HelpCircle className="w-4 h-4" />
            Yardım
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <Link to="/logout">
          <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
