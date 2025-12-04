import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Bell, TrendingUp, Trophy, Wallet, ArrowUp, ArrowDown, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Stats {
  totalUsers: number;
  pointsToday: number;
  notificationsSent: number;
  pendingWithdrawals: number;
}

interface ChartData {
  date: string;
  users: number;
  points: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    pointsToday: 0,
    notificationsSent: 0,
    pendingWithdrawals: 0,
  });

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Carregar estatísticas do dashboard
        const statsData = await api.getDashboardStats();
        setStats(statsData);

        // Carregar dados do gráfico (últimos 7 dias)
        const chartDataResponse = await api.getChartData(7);
        setChartData(chartDataResponse);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        // Em caso de erro, manter valores zerados
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const statCards = [
    {
      title: "Total de Usuários",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
      change: "+12.5%",
      changeType: "up" as const,
    },
    {
      title: "Pontos Distribuídos Hoje",
      value: stats.pointsToday.toLocaleString(),
      icon: Trophy,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-500",
      change: "+8.2%",
      changeType: "up" as const,
    },
    {
      title: "Notificações Enviadas",
      value: stats.notificationsSent.toLocaleString(),
      icon: Bell,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-500",
      change: "+23.1%",
      changeType: "up" as const,
    },
    {
      title: "Saques Pendentes",
      value: stats.pendingWithdrawals.toLocaleString(),
      icon: Wallet,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      iconBg: "bg-gradient-to-br from-orange-500 to-red-500",
      change: "-5.4%",
      changeType: "down" as const,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-purple-600 border-r-blue-600 absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`}></div>
            <CardHeader className="relative flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">
                {stat.title}
              </CardTitle>
              <div className={`p-3 rounded-xl ${stat.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-end justify-between">
                <div className="text-4xl font-bold text-slate-900">{stat.value}</div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                  stat.changeType === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.changeType === "up" ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">vs. último período</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Users Growth Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                Crescimento de Usuários
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Activity className="w-4 h-4" />
                Últimos 7 dias
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-end justify-between gap-3 px-2">
              {chartData.map((data, index) => {
                const maxUsers = Math.max(...chartData.map((d) => d.users));
                const height = maxUsers > 0 ? (data.users / maxUsers) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-3 group">
                    <div className="text-sm font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {data.users}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg transition-all duration-300 hover:from-blue-700 hover:to-cyan-500 shadow-lg hover:shadow-xl relative overflow-hidden"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/20"></div>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">{data.date}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Points Distribution Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                Pontos Distribuídos
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Activity className="w-4 h-4" />
                Últimos 7 dias
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-end justify-between gap-3 px-2">
              {chartData.map((data, index) => {
                const maxPoints = Math.max(...chartData.map((d) => d.points));
                const height = maxPoints > 0 ? (data.points / maxPoints) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-3 group">
                    <div className="text-sm font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(data.points / 1000).toFixed(0)}k
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-pink-400 rounded-t-lg transition-all duration-300 hover:from-purple-700 hover:to-pink-500 shadow-lg hover:shadow-xl relative overflow-hidden"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/20"></div>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">{data.date}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="group relative p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-dashed border-purple-300 hover:border-purple-500 hover:shadow-lg transition-all duration-300 text-left overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/10 group-hover:to-blue-500/10 transition-all duration-300"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div className="font-bold text-slate-900 text-lg mb-1">Enviar Notificação</div>
                <div className="text-sm text-slate-600">
                  Enviar para todos os usuários
                </div>
              </div>
            </button>

            <button className="group relative p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-dashed border-blue-300 hover:border-blue-500 hover:shadow-lg transition-all duration-300 text-left overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="font-bold text-slate-900 text-lg mb-1">Resetar Ranking</div>
                <div className="text-sm text-slate-600">
                  Reiniciar ranking manualmente
                </div>
              </div>
            </button>

            <button className="group relative p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-dashed border-green-300 hover:border-green-500 hover:shadow-lg transition-all duration-300 text-left overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-500/0 group-hover:from-green-500/10 group-hover:to-emerald-500/10 transition-all duration-300"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div className="font-bold text-slate-900 text-lg mb-1">Aprovar Saques</div>
                <div className="text-sm text-slate-600">
                  {stats.pendingWithdrawals} pendentes
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
