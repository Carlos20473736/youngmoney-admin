import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";

export default function Notifications() {
  const [userId, setUserId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "success" | "warning" | "reward" | "ranking">("info");
  
  const utils = trpc.useUtils();
  const { data: notifications, isLoading } = trpc.notifications.list.useQuery();
  
  const sendNotification = trpc.notifications.create.useMutation({
    onSuccess: () => {
      toast.success("Notificação enviada com sucesso!");
      utils.notifications.list.invalidate();
      setUserId("");
      setTitle("");
      setMessage("");
      setType("info");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notificações</h1>
        <p className="text-muted-foreground">
          Enviar notificações para usuários
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enviar Nova Notificação</CardTitle>
          <CardDescription>Envie notificações para usuários específicos ou para todos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="userId">ID do Usuário (vazio = todos)</Label>
              <Input
                id="userId"
                type="number"
                placeholder="Deixe vazio para enviar a todos"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="warning">Aviso</SelectItem>
                  <SelectItem value="reward">Recompensa</SelectItem>
                  <SelectItem value="ranking">Ranking</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Título da notificação"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Conteúdo da notificação..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
          <Button
            onClick={() => {
              if (!title || !message) {
                toast.error("Preencha título e mensagem");
                return;
              }
              sendNotification.mutate({
                userId: userId ? parseInt(userId) : undefined,
                title,
                message,
              });
            }}
            disabled={sendNotification.isPending}
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar Notificação
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notificações</CardTitle>
          <CardDescription>Últimas notificações enviadas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Destinatário</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Mensagem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications && notifications.length > 0 ? (
                notifications.map((notif) => (
                  <TableRow key={notif.id}>
                    <TableCell>{new Date(notif.createdAt).toLocaleString("pt-BR")}</TableCell>
                    <TableCell>{notif.userId ? `Usuário #${notif.userId}` : "Todos"}</TableCell>
                    <TableCell>
                      <Badge>{notif.type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{notif.title}</TableCell>
                    <TableCell className="max-w-md truncate">{notif.message}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhuma notificação enviada
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
