import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Trophy, Medal, Award, RefreshCw } from "lucide-react";

export default function Ranking() {
  const utils = trpc.useUtils();
  const { data: topUsers, isLoading } = trpc.ranking.top.useQuery({ limit: 20 });
  
  const updateRankings = trpc.ranking.update.useMutation({
    onSuccess: () => {
      toast.success("Rankings atualizados!");
      utils.ranking.top.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ranking</h1>
          <p className="text-muted-foreground">
            Top usuários por pontos
          </p>
        </div>
        <Button
          onClick={() => updateRankings.mutate()}
          disabled={updateRankings.isPending}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar Rankings
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 20 Usuários</CardTitle>
          <CardDescription>Usuários com mais pontos</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Posição</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Tarefas</TableHead>
                  <TableHead>Streak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topUsers && topUsers.length > 0 ? (
                  topUsers.map((user, index) => (
                    <TableRow key={user.id} className={index < 3 ? "bg-muted/50" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPositionIcon(index + 1)}
                          <span className="font-bold">#{index + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.balance} pts</Badge>
                      </TableCell>
                      <TableCell>{user.tasksCompleted}</TableCell>
                      <TableCell>{user.currentStreak} dias</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum usuário no ranking
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
