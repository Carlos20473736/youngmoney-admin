import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, RefreshCw } from "lucide-react";
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

interface RankingUser {
  position: number;
  id: number;
  name: string;
  points: number;
}

export default function Ranking() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadRanking();
  }, []);

  async function loadRanking() {
    try {
      setLoading(true);
      const data = await api.getRanking("daily");
      // Mapear user_id para id e adicionar position
      const mappedData = data.map((user: any, index: number) => ({
        position: index + 1,
        id: user.id,
        name: user.name,
        points: user.points
      }));
      setRanking(mappedData);
    } catch (error) {
      console.error("Erro ao carregar ranking:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!confirm("Tem certeza que deseja resetar o ranking? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      setResetting(true);
      await api.resetRanking();
      toast.success("Ranking resetado com sucesso!");
      loadRanking();
    } catch (error) {
      toast.error("Erro ao resetar ranking");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Ranking Diário
            </span>
            <Button
              variant="destructive"
              onClick={handleReset}
              disabled={resetting}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {resetting ? "Resetando..." : "Resetar Ranking"}
            </Button>
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
                  <TableHead>Posição</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Pontos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.position <= 3 ? (
                        <Badge
                          variant={
                            user.position === 1
                              ? "default"
                              : user.position === 2
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            user.position === 1
                              ? "bg-yellow-500"
                              : user.position === 2
                              ? "bg-gray-400"
                              : "bg-orange-600"
                          }
                        >
                          #{user.position}
                        </Badge>
                      ) : (
                        <span className="font-mono">#{user.position}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono">{user.id}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {user.points.toLocaleString()} pts
                      </Badge>
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
