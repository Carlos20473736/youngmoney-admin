import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  Trophy, 
  DollarSign, 
  Settings,
  Menu,
  X,
  Disc3,
  ChevronRight,
  LogOut,
  User
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Usuários", href: "/users", icon: Users },
  { name: "Notificações", href: "/notifications", icon: Bell },
  { name: "Ranking", href: "/ranking", icon: Trophy },
  { name: "Saques", href: "/withdrawals", icon: DollarSign },
  { name: "Roleta", href: "/roulette", icon: Disc3 },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50 ring-2 ring-purple-400/30">
                <span className="text-white font-bold text-lg">YM</span>
              </div>
              <div>
                <span className="font-bold text-white text-lg block">YoungMoney</span>
                <span className="text-xs text-slate-400">Admin Panel</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile */}
          <div className="px-4 py-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3 px-3 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">Administrador</div>
                <div className="text-xs text-slate-400 truncate">admin@youngmoney.com</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">
              Menu Principal
            </div>
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30"
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                  <span className="flex-1">{item.name}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700/50 space-y-3">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all duration-200 group">
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Sair</span>
            </button>
            <div className="text-xs text-slate-500 text-center px-3">
              <div className="font-semibold text-slate-400">v1.0.0</div>
              <div className="mt-1">© 2024 YoungMoney</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-slate-200/50 shadow-sm">
          <div className="h-20 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Menu className="w-6 h-6 text-slate-700" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  {navigation.find((item) => item.href === location)?.name || "Dashboard"}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Bem-vindo ao painel administrativo
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
