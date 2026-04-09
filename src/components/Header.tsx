import { ShieldCheck } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="bg-amber-600 p-2 rounded-xl">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900">TrustScore</h1>
          <p className="text-[10px] uppercase tracking-widest font-semibold text-stone-500">AI Credit Intelligence</p>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-4">
        <span className="text-xs font-medium text-stone-500 bg-stone-100 px-3 py-1 rounded-full">West Africa Edition</span>
      </div>
    </header>
  );
}
