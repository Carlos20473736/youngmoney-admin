import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Send, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Notification {
  id: number;
  user_id: number | null;
  user_name: string | null;
  title: string;
  message: string;
  created_at: string;
}

export default function Notifications() {
  const [points, setPoints] = useState("");
  const [sending, setSending] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      const data = await api.getNotifications(1, 50);
      setNotifications(data.notifications);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendToAll() {
    if (!points || isNaN(Number(points))) {
      toast.error("Digite uma quantidade válida de pontos");
      return;
    }

    const message = `Você recebeu ${points} pontos!`;

    try {
      setSending(true);
      await api.sendNotification(null, "Pontos Adicionados", message, Number(points));
      toast.success(`Notificação enviada: ${message}`);
      setPoints("");
      loadNotifications();
    } catch (error) {
      toast.error("Erro ao enviar notificação");
    } finally {
      setSending(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("pt-BR");
  }

  return (
    <div className="space-y-6">
      {/* Enviar Notificação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Enviar Pontos para Todos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Quantidade de Pontos
              </label>
              <Input
                type="number"
                placeholder="Ex: 500"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Mensagem automática: "Você recebeu {points || "X"} pontos!"
              </p>
            </div>
            <Button
              onClick={handleSendToAll}
              disabled={sending}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              {sending ? "Enviando..." : "Enviar para Todos"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Mensagem automática:</strong> "Você recebeu X pontos!"
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-900">
                <strong>Destinatários:</strong> Todos os usuários cadastrados
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-900">
                <strong>Emojis:</strong> Removidos automaticamente pelo app
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-900">
                <strong>Frequência:</strong> Evite enviar mais de 3 por dia
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-500">Carregando...</p>
          ) : notifications.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              Nenhuma notificação enviada ainda
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notif) => (
                  <TableRow key={notif.id}>
                    <TableCell>{notif.id}</TableCell>
                    <TableCell>
                      {notif.user_name || "Todos"}
                    </TableCell>
                    <TableCell>{notif.title}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {notif.message}
                    </TableCell>
                    <TableCell>{formatDate(notif.created_at)}</TableCell>
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
