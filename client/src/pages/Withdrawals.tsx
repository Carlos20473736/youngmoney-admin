import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export default function Withdrawals() {
  const utils = trpc.useUtils();
  const { data: pending, isLoading: pendingLoading } = trpc.withdrawals.pending.useQuery();
  const { data: all, isLoading: allLoading } = trpc.withdrawals.all.useQuery();
  
  const approve = trpc.withdrawals.approve.useMutation({
    onSuccess: () => {
      toast.success("Saque aprovado!");
      utils.withdrawals.pending.invalidate();
      utils.withdrawals.all.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const reject = trpc.withdrawals.reject.useMutation({
    onSuccess: () => {
      toast.success("Saque rejeitado!");
      utils.withdrawals.pending.invalidate();
      utils.withdrawals.all.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      completed: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Saques</h1>
        <p className="text-muted-foreground">
          Gerenciar solicitações de saque
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saques Pendentes</CardTitle>
          <CardDescription>{pending?.length || 0} saques aguardando aprovação</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending && pending.length > 0 ? (
                  pending.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>{new Date(withdrawal.createdAt).toLocaleString("pt-BR")}</TableCell>
                      <TableCell>Usuário #{withdrawal.userId}</TableCell>
                      <TableCell className="font-bold">{withdrawal.amount} pts</TableCell>
                      <TableCell>{withdrawal.method}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approve.mutate({ withdrawalId: withdrawal.id })}
                            disabled={approve.isPending}
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
                                reject.mutate({ withdrawalId: withdrawal.id, notes });
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
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum saque pendente
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Saques</CardTitle>
          <CardDescription>Histórico completo de saques</CardDescription>
        </CardHeader>
        <CardContent>
          {allLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {all && all.length > 0 ? (
                  all.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>{new Date(withdrawal.createdAt).toLocaleString("pt-BR")}</TableCell>
                      <TableCell>Usuário #{withdrawal.userId}</TableCell>
                      <TableCell className="font-bold">{withdrawal.amount} pts</TableCell>
                      <TableCell>{withdrawal.method}</TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
