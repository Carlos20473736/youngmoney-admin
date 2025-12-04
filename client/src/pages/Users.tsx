import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, UserMinus, Ban, Shield, Users as UsersIcon, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface User {
  id: number;
  name: string;
  email: string;
  points: number;
  daily_points: number;
  created_at: string;
  banned: boolean;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await api.getUsers(page, 50, search);
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("pt-BR");
  }

  if (loading && users.length === 0) {
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
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Total de Usuários</p>
                <p className="text-3xl font-bold text-slate-900">{total}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <UsersIcon className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Usuários Ativos</p>
                <p className="text-3xl font-bold text-slate-900">
                  {users.filter(u => !u.banned).length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Usuários Banidos</p>
                <p className="text-3xl font-bold text-slate-900">
                  {users.filter(u => u.banned).length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Ban className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Gerenciar Usuários</h2>
                <p className="text-sm text-slate-500 font-normal mt-0.5">{total} usuários cadastrados</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                <Download className="w-4 h-4" />
                Exportar
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar usuário..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 w-64 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-bold text-slate-700">ID</TableHead>
                  <TableHead className="font-bold text-slate-700">Nome</TableHead>
                  <TableHead className="font-bold text-slate-700">Email</TableHead>
                  <TableHead className="font-bold text-slate-700">Pontos Totais</TableHead>
                  <TableHead className="font-bold text-slate-700">Pontos Diários</TableHead>
                  <TableHead className="font-bold text-slate-700">Cadastro</TableHead>
                  <TableHead className="font-bold text-slate-700">Status</TableHead>
                  <TableHead className="font-bold text-slate-700 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow 
                    key={user.id} 
                    className={`hover:bg-blue-50/50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    }`}
                  >
                    <TableCell className="font-mono text-slate-600 font-semibold">{user.id}</TableCell>
                    <TableCell className="font-semibold text-slate-900">{user.name}</TableCell>
                    <TableCell className="text-slate-600">{user.email}</TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 font-semibold px-3 py-1">
                        {user.points.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-slate-300 text-slate-700 font-semibold px-3 py-1">
                        {user.daily_points.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell>
                      {user.banned ? (
                        <Badge className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 font-semibold">
                          Banido
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-semibold">
                          Ativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          title="Adicionar pontos"
                          className="hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          title="Remover pontos"
                          className="hover:bg-orange-50 hover:border-orange-400 hover:text-orange-700 transition-colors"
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                        {user.banned ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            title="Desbanir"
                            className="hover:bg-green-50 hover:border-green-400 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-green-600" />
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            title="Banir"
                            className="hover:bg-red-50 hover:border-red-400 transition-colors"
                          >
                            <Ban className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-slate-50">
            <div className="text-sm font-semibold text-slate-600">
              Página {page} de {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 transition-colors"
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 transition-colors"
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
