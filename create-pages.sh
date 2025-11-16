#!/bin/bash

# Users.tsx
cat > client/src/pages/Users.tsx << 'EOF'
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  
  const { data: users, isLoading } = searchQuery 
    ? trpc.appUsers.search.useQuery({ query: searchQuery })
    : trpc.appUsers.list.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
        <p className="text-muted-foreground">
          Gerenciar usuários do YoungMoney
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            {users?.length || 0} usuários cadastrados
          </CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Ranking</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.balance} pts</TableCell>
                      <TableCell>#{user.rankPosition || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "default" : "destructive"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/users/${user.id}`)}
                        >
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum usuário encontrado
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
EOF

# UserDetails.tsx
cat > client/src/pages/UserDetails.tsx << 'EOF'
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { useRoute } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { useLocation } from "wouter";

export default function UserDetails() {
  const [, params] = useRoute("/users/:id");
  const userId = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  
  const [points, setPoints] = useState("");
  const [description, setDescription] = useState("");
  
  const utils = trpc.useUtils();
  const { data: user, isLoading } = trpc.appUsers.getById.useQuery({ id: userId });
  const { data: transactions } = trpc.appUsers.getTransactions.useQuery({ userId });
  
  const addPoints = trpc.appUsers.addPoints.useMutation({
    onSuccess: () => {
      toast.success("Pontos adicionados com sucesso!");
      utils.appUsers.getById.invalidate({ id: userId });
      utils.appUsers.getTransactions.invalidate({ userId });
      setPoints("");
      setDescription("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const removePoints = trpc.appUsers.removePoints.useMutation({
    onSuccess: () => {
      toast.success("Pontos removidos com sucesso!");
      utils.appUsers.getById.invalidate({ id: userId });
      utils.appUsers.getTransactions.invalidate({ userId });
      setPoints("");
      setDescription("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <div>Usuário não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/users")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Saldo Atual</Label>
              <p className="text-2xl font-bold">{user.balance} pontos</p>
            </div>
            <div>
              <Label>Total Ganho</Label>
              <p className="text-lg">{user.totalEarned} pontos</p>
            </div>
            <div>
              <Label>Total Sacado</Label>
              <p className="text-lg">{user.totalWithdrawn} pontos</p>
            </div>
            <div>
              <Label>Posição no Ranking</Label>
              <p className="text-lg">#{user.rankPosition || "-"}</p>
            </div>
            <div>
              <Label>Tarefas Completadas</Label>
              <p className="text-lg">{user.tasksCompleted}</p>
            </div>
            <div>
              <Label>Streak Atual</Label>
              <p className="text-lg">{user.currentStreak} dias</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Pontos</CardTitle>
            <CardDescription>Adicionar ou remover pontos manualmente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="points">Quantidade de Pontos</Label>
              <Input
                id="points"
                type="number"
                placeholder="100"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Motivo da alteração..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  if (!points || !description) {
                    toast.error("Preencha todos os campos");
                    return;
                  }
                  addPoints.mutate({
                    userId,
                    amount: parseInt(points),
                    description,
                  });
                }}
                disabled={addPoints.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  if (!points || !description) {
                    toast.error("Preencha todos os campos");
                    return;
                  }
                  removePoints.mutate({
                    userId,
                    amount: parseInt(points),
                    description,
                  });
                }}
                disabled={removePoints.isPending}
              >
                <Minus className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>Últimas transações deste usuário</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions && transactions.length > 0 ? (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{new Date(tx.createdAt).toLocaleString("pt-BR")}</TableCell>
                    <TableCell>{tx.type}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell className={tx.amount > 0 ? "text-green-500" : "text-red-500"}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount} pts
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Nenhuma transação
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
EOF

echo "✅ Páginas criadas com sucesso!"
