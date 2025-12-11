import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertCircle, Clock, RotateCcw, Zap, DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Settings() {
  const [rankingResetTime, setRankingResetTime] = useState("00:00");
  const [rouletteResetTime, setRouletteResetTime] = useState("00:00");
  const [isLoadingRanking, setIsLoadingRanking] = useState(false);
  const [isLoadingRoulette, setIsLoadingRoulette] = useState(false);
  const [isLoadingMonitag, setIsLoadingMonitag] = useState(false);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [showPayments, setShowPayments] = useState(false);

  const handleResetRanking = async () => {
    setIsLoadingRanking(true);
    try {
      const response = await fetch(
        `https://youngmoney-api-railway-production.up.railway.app/api/v1/reset/ranking.php?token=ym_reset_ranking_scheduled_2024_secure`,
        { method: "GET" }
      );
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`Ranking resetado! ${data.data?.payments?.total_created || 0} pagamentos criados.`);
        // Atualizar pagamentos após reset
        setTimeout(() => handleLoadPayments(), 1000);
      } else {
        toast.error("Erro ao resetar ranking");
      }
    } catch (error) {
      toast.error("Erro ao conectar com a API");
      console.error(error);
    } finally {
      setIsLoadingRanking(false);
    }
  };

  const handleLoadPayments = async () => {
    setIsLoadingPayments(true);
    try {
      const response = await fetch(
        `https://youngmoney-api-railway-production.up.railway.app/api/v1/payments/pending.php?token=ym_reset_ranking_scheduled_2024_secure&status=pending&limit=100`,
        { method: "GET" }
      );
      
      if (response.ok) {
        const data = await response.json();
        setPayments(data.data || []);
        setShowPayments(true);
        toast.success(`${data.data?.length || 0} pagamentos pendentes carregados`);
      } else {
        toast.error("Erro ao carregar pagamentos");
      }
    } catch (error) {
      toast.error("Erro ao conectar com a API");
      console.error(error);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const handleResetRoulette = async () => {
    setIsLoadingRoulette(true);
    try {
      const response = await fetch(
        `https://youngmoney-api-railway-production.up.railway.app/api/reset/roulette?time=${rouletteResetTime}`,
        { method: "GET" }
      );
      
      if (response.ok) {
        toast.success("Roleta resetada com sucesso!");
      } else {
        toast.error("Erro ao resetar roleta");
      }
    } catch (error) {
      toast.error("Erro ao conectar com a API");
      console.error(error);
    } finally {
      setIsLoadingRoulette(false);
    }
  };

  const handleResetMonitag = async () => {
    setIsLoadingMonitag(true);
    try {
      const response = await fetch(
        "https://monetag-postback-server-production.up.railway.app/api/reset?token=ym_reset_monetag_scheduled_2024_secure",
        { method: "GET" }
      );
      
      if (response.ok) {
        toast.success("MoniTag Tracking resetado com sucesso!");
      } else {
        toast.error("Erro ao resetar MoniTag Tracking");
      }
    } catch (error) {
      toast.error("Erro ao conectar com a API");
      console.error(error);
    } finally {
      setIsLoadingMonitag(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie resets e configurações do sistema
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Cuidado ao usar essas opções. Os resets são irreversíveis e afetarão todos os usuários.
        </AlertDescription>
      </Alert>

      {/* Reset Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Reset Ranking
          </CardTitle>
          <CardDescription>
            Reseta o ranking de pontos de todos os usuários e cria pagamentos automáticos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ranking-time">
              <Clock className="h-4 w-4 inline mr-2" />
              Horário de Reset (HH:MM)
            </Label>
            <Input
              id="ranking-time"
              type="time"
              value={rankingResetTime}
              onChange={(e) => setRankingResetTime(e.target.value)}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              Formato: 24 horas (ex: 00:00 para meia-noite, 14:30 para 14h30)
            </p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={handleResetRanking}
              disabled={isLoadingRanking}
              variant="destructive"
            >
              {isLoadingRanking ? "Resetando..." : "Executar Reset Ranking"}
            </Button>
            <Button
              onClick={handleLoadPayments}
              disabled={isLoadingPayments}
              variant="outline"
            >
              {isLoadingPayments ? "Carregando..." : "Ver Pagamentos Pendentes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pagamentos Pendentes */}
      {showPayments && payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pagamentos Pendentes do Ranking
            </CardTitle>
            <CardDescription>
              Total: {payments.length} pagamentos | Valor total: R$ {payments.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Posição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Chave PIX</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                      <TableCell>{payment.user_id}</TableCell>
                      <TableCell className="font-bold">{payment.position}º</TableCell>
                      <TableCell className="font-semibold">R$ {parseFloat(payment.amount).toFixed(2)}</TableCell>
                      <TableCell className="font-mono text-sm">{payment.pix_key?.substring(0, 10)}...</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payment.status === 'pending' ? 'Pendente' :
                           payment.status === 'completed' ? 'Completo' :
                           'Falhou'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(payment.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset Roleta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Reset Roleta
          </CardTitle>
          <CardDescription>
            Reseta o estado da roleta para todos os usuários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roulette-time">
              <Clock className="h-4 w-4 inline mr-2" />
              Horário de Reset (HH:MM)
            </Label>
            <Input
              id="roulette-time"
              type="time"
              value={rouletteResetTime}
              onChange={(e) => setRouletteResetTime(e.target.value)}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              Formato: 24 horas (ex: 00:00 para meia-noite, 14:30 para 14h30)
            </p>
          </div>
          <Button
            onClick={handleResetRoulette}
            disabled={isLoadingRoulette}
            variant="destructive"
          >
            {isLoadingRoulette ? "Resetando..." : "Executar Reset Roleta"}
          </Button>
        </CardContent>
      </Card>

      {/* Reset MoniTag Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Reset MoniTag Tracking
          </CardTitle>
          <CardDescription>
            Reseta todos os dados de tracking de anúncios MoniTag
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Este reset não possui horário configurável. Será executado imediatamente.
          </p>
          <Button
            onClick={handleResetMonitag}
            disabled={isLoadingMonitag}
            variant="destructive"
          >
            {isLoadingMonitag ? "Resetando..." : "Executar Reset MoniTag Tracking"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
