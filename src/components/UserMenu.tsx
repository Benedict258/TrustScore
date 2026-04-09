import { auth, signInWithGoogle, logout } from "@/src/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, User, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function UserMenu() {
  const [user, loading] = useAuthState(auth);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      toast.success("Signed in successfully!");
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Login failed", { description: "Please try again." });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully!");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return <Loader2 className="w-5 h-5 animate-spin text-stone-400" />;
  }

  if (!user) {
    return (
      <Button 
        onClick={handleLogin}
        variant="outline" 
        size="sm"
        className="border-stone-200 text-stone-700 hover:bg-stone-50 gap-2"
      >
        <LogIn className="w-4 h-4" />
        Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 outline-none group">
          <Avatar className="w-8 h-8 border border-stone-200 group-hover:border-amber-400 transition-colors">
            <AvatarImage src={user.photoURL || ""} />
            <AvatarFallback className="bg-stone-100 text-stone-600 text-xs font-bold">
              {user.displayName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-xs font-bold text-stone-900 leading-none">{user.displayName}</span>
            <span className="text-[10px] text-stone-400 font-medium uppercase tracking-tighter">Verified Identity</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <User className="w-4 h-4" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2">
          <ShieldCheck className="w-4 h-4" />
          Verification Level
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="gap-2 text-rose-600 focus:text-rose-600">
          <LogOut className="w-4 h-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
