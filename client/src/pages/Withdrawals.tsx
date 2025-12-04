import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Withdrawal {
  id: number;
  user_id: number;
  user_name: string;
  amount: number;
  pix_key: string;
  status: string;
  created_at: string;
  processed_at: string | null;
}

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    loadWithdrawals();
  }, []);

  async function loadWithdrawals() {
    try {
      setLoading(true);
      const data = await api.getWithdrawals("pending");
      setWithdrawals(data);
    } catch (error) {
      console.error("Erro ao carregar saques:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: number) {
    try {
      setProcessing(id);
      await api.approveWithdrawal(id);
      toast.success("Saque aprovado!");
      loadWithdrawals();
    } catch (error) {
      toast.error("Erro ao aprovar saque");
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(id: number) {
    const reason = prompt("Motivo da rejeição:");
    if (!reason) return;

    try {
      setProcessing(id);
      await api.rejectWithdrawal(id, reason);
      toast.success("Saque rejeitado");
      loadWithdrawals();
    } catch (error) {
      toast.error("Erro ao rejeitar saque");
    } finally {
      setProcessing(null);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("pt-BR");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Saques Pendentes ({withdrawals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Chave PIX</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="font-mono">{withdrawal.id}</TableCell>
                    <TableCell className="font-medium">
                      {withdrawal.user_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-600">
                        R$ {withdrawal.amount.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {withdrawal.pix_key}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(withdrawal.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600"
                          onClick={() => handleApprove(withdrawal.id)}
                          disabled={processing === withdrawal.id}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(withdrawal.id)}
                          disabled={processing === withdrawal.id}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
