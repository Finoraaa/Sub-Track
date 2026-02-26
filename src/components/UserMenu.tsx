import { useUser, UserButton } from "@clerk/clerk-react";

export function UserMenu() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="hidden md:flex flex-col items-end mr-1">
        <span className="text-sm font-semibold text-gray-900 leading-none">
          {user.fullName || user.username || "Kullanıcı"}
        </span>
        <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-medium">
          Premium Plan
        </span>
      </div>
      <UserButton 
        afterSignOutUrl="/sign-in"
        appearance={{
          elements: {
            avatarBox: "h-9 w-9 border border-gray-200 hover:border-gray-300 transition-all",
            userButtonPopoverCard: "rounded-2xl border border-gray-100 shadow-xl",
            userButtonTrigger: "outline-none focus:ring-2 focus:ring-gray-900/10 rounded-full"
          }
        }}
      />
    </div>
  );
}
