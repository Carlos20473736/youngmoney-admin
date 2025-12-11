import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Check, X, DollarSign, TrendingDown, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Withdrawals() {
  const utils = trpc.useUtils();
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<number | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  
  const { data: pending, isLoading: pendingLoading } = trpc.withdrawals.pending.useQuery();
  const { data: all, isLoading: allLoading } = trpc.withdrawals.all.useQuery();
  
  const approve = trpc.withdrawals.approve.useMutation({
    onSuccess: () => {
      toast.success("Saque aprovado com sucesso!");
      utils.withdrawals.pending.invalidate();
      utils.withdrawals.all.invalidate();
      setSelectedWithdrawal(null);
    },
    onError: (error) => {
      toast.error(`Erro ao aprovar: ${error.message}`);
    },
  });
  
  const reject = trpc.withdrawals.reject.useMutation({
    onSuccess: () => {
      toast.success("Saque rejeitado!");
      utils.withdrawals.pending.invalidate();
      utils.withdrawals.all.invalidate();
      setSelectedWithdrawal(null);
      setRejectNotes("");
    },
    onError: (error) => {
      toast.error(`Erro ao rejeitar: ${error.message}`);
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      completed: "outline",
    };
    const labels: Record<string, string> = {
      pending: "Pendente",
      approved: "Aprovado",
      rejected: "Rejeitado",
      completed: "Completo",
    };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  const totalPending = pending?.length || 0;
  const totalAmount = pending?.reduce((sum, w) => sum + (w.amount || 0), 0) || 0;
  const totalApproved = all?.filter(w => w.status === "approved").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Saques</h1>
        <p className="text-muted-foreground">
          Visualize e processe solicitações de saque dos usuários
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saques Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPending}</div>
            <p className="text-xs text-muted-foreground">
              Total: R$ {totalAmount.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saques Aprovados</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApproved}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando processamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10.000:1</div>
            <p className="text-xs text-muted-foreground">
              10.000 pontos = R$ 1,00
            </p>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Ao aprovar um saque, o sistema transferirá os fundos para a chave PIX do usuário. Certifique-se de que os dados estão corretos antes de aprovar.
        </AlertDescription>
      </Alert>

      {/* Saques Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Saques Pendentes
          </CardTitle>
          <CardDescription>
            {totalPending} saque(s) aguardando aprovação - Total: R$ {totalAmount.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Valor (R$)</TableHead>
                    <TableHead>Chave PIX</TableHead>
                    <TableHead>Tipo PIX</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending && pending.length > 0 ? (
                    pending.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell className="text-sm">
                          {new Date(withdrawal.createdAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{withdrawal.userName}</p>
                            <p className="text-xs text-muted-foreground">ID: {withdrawal.userId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-green-600">
                          R$ {withdrawal.amount?.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {withdrawal.pixKey?.substring(0, 15)}...
                        </TableCell>
                        <TableCell className="text-sm">
                          <Badge variant="outline">{withdrawal.pixKeyType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => approve.mutate({ id: withdrawal.id })}
                              disabled={approve.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                const notes = prompt("Motivo da rejeição:");
                                if (notes) {
                                  reject.mutate({ id: withdrawal.id });
                                }
                              }}
                              disabled={reject.isPending}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        ✅ Nenhum saque pendente
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Saques */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Saques</CardTitle>
          <CardDescription>Todos os saques processados</CardDescription>
        </CardHeader>
        <CardContent>
          {allLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Valor (R$)</TableHead>
                    <TableHead>Chave PIX</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {all && all.length > 0 ? (
                    all.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell className="text-sm">
                          {new Date(withdrawal.createdAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{withdrawal.userName}</p>
                            <p className="text-xs text-muted-foreground">ID: {withdrawal.userId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">
                          R$ {withdrawal.amount?.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {withdrawal.pixKey?.substring(0, 15)}...
                        </TableCell>
                        <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Nenhum saque registrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
