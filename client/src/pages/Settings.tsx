import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Trash2, AlertTriangle, Clock, DollarSign, Wallet, Zap, Plus, X } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function Settings() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetTimeDialog, setShowResetTimeDialog] = useState(false);
  const [showWithdrawalLimitsDialog, setShowWithdrawalLimitsDialog] = useState(false);
  const [showQuickValuesDialog, setShowQuickValuesDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [resetTime, setResetTime] = useState("21:00");
  const [newResetTime, setNewResetTime] = useState("21:00");
  const [isUpdatingTime, setIsUpdatingTime] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isUpdatingLimits, setIsUpdatingLimits] = useState(false);
  const [isUpdatingQuickValues, setIsUpdatingQuickValues] = useState(false);
  
  // Withdrawal limits
  const [withdrawalLimits, setWithdrawalLimits] = useState({
    min: 10,
    max: 1000
  });
  const [newWithdrawalLimits, setNewWithdrawalLimits] = useState({
    min: 10,
    max: 1000
  });

  // Quick withdrawal values
  const [quickWithdrawalValues, setQuickWithdrawalValues] = useState<number[]>([1, 10, 20, 50, 100]);
  const [newQuickWithdrawalValues, setNewQuickWithdrawalValues] = useState<number[]>([1, 10, 20, 50, 100]);
  const [newQuickValue, setNewQuickValue] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoadingSettings(true);
      const settings = await api.getSettings();
      if (settings.reset_time) {
        setResetTime(settings.reset_time);
        setNewResetTime(settings.reset_time);
      }
      if (settings.withdrawal_limits) {
        setWithdrawalLimits(settings.withdrawal_limits);
        setNewWithdrawalLimits(settings.withdrawal_limits);
      }
      if (settings.quick_withdrawal_values && settings.quick_withdrawal_values.length > 0) {
        setQuickWithdrawalValues(settings.quick_withdrawal_values);
        setNewQuickWithdrawalValues(settings.quick_withdrawal_values);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      // Se falhar, mantém os valores padrão
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleUpdateResetTime = async () => {
    // Validar formato de hora (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newResetTime)) {
      toast.error("Formato de hora inválido. Use HH:MM (ex: 21:00)");
      return;
    }

    setIsUpdatingTime(true);
    try {
      await api.updateSettings({ reset_time: newResetTime });
      setResetTime(newResetTime);
      toast.success(`Horário de reset atualizado para ${newResetTime}`);
      setShowResetTimeDialog(false);
    } catch (error) {
      toast.error("Erro ao atualizar horário de reset");
      console.error(error);
    } finally {
      setIsUpdatingTime(false);
    }
  };

  const handleUpdateWithdrawalLimits = async () => {
    // Validações
    if (newWithdrawalLimits.min < 1) {
      toast.error("O valor mínimo deve ser maior que R$ 0");
      return;
    }

    if (newWithdrawalLimits.max <= newWithdrawalLimits.min) {
      toast.error("O valor máximo deve ser maior que o mínimo");
      return;
    }

    if (newWithdrawalLimits.max > 100000) {
      toast.error("O valor máximo não pode exceder R$ 100.000");
      return;
    }

    setIsUpdatingLimits(true);
    try {
      await api.updateSettings({ 
        withdrawal_limits: newWithdrawalLimits 
      });
      setWithdrawalLimits(newWithdrawalLimits);
      toast.success("Limites de saque atualizados com sucesso!");
      setShowWithdrawalLimitsDialog(false);
    } catch (error) {
      toast.error("Erro ao atualizar limites de saque");
      console.error(error);
    } finally {
      setIsUpdatingLimits(false);
    }
  };

  const handleAddQuickValue = () => {
    const value = parseFloat(newQuickValue);
    if (isNaN(value) || value <= 0) {
      toast.error("Digite um valor válido");
      return;
    }
    if (newQuickWithdrawalValues.includes(value)) {
      toast.error("Este valor já existe");
      return;
    }
    if (newQuickWithdrawalValues.length >= 6) {
      toast.error("Máximo de 6 valores rápidos");
      return;
    }
    setNewQuickWithdrawalValues([...newQuickWithdrawalValues, value].sort((a, b) => a - b));
    setNewQuickValue("");
  };

  const handleRemoveQuickValue = (value: number) => {
    setNewQuickWithdrawalValues(newQuickWithdrawalValues.filter(v => v !== value));
  };

  const handleUpdateQuickValues = async () => {
    if (newQuickWithdrawalValues.length === 0) {
      toast.error("Adicione pelo menos um valor rápido");
      return;
    }

    setIsUpdatingQuickValues(true);
    try {
      await api.updateQuickWithdrawalValues(newQuickWithdrawalValues);
      setQuickWithdrawalValues(newQuickWithdrawalValues);
      toast.success("Valores rápidos atualizados com sucesso!");
      setShowQuickValuesDialog(false);
    } catch (error) {
      toast.error("Erro ao atualizar valores rápidos");
      console.error(error);
    } finally {
      setIsUpdatingQuickValues(false);
    }
  };

  const handleDeleteAllUsers = async () => {
    if (confirmText !== "DELETAR TUDO") {
      toast.error("Digite 'DELETAR TUDO' para confirmar");
      return;
    }

    setIsDeleting(true);
    try {
      const result = await api.deleteAllUsers();
      toast.success(`${result.deleted_count} usuários foram removidos com sucesso`);
      setShowDeleteDialog(false);
      setConfirmText("");
    } catch (error) {
      toast.error("Erro ao deletar usuários");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Configurações Gerais */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-purple-50">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Configurações do Sistema</h2>
              <p className="text-sm text-slate-500 font-normal mt-0.5">Gerencie as configurações globais do aplicativo</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Limites de Saque */}
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-slate-900">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-white" />
                    </div>
                    Limites de Saque
                  </h3>
                  {isLoadingSettings ? (
                    <p className="text-sm text-slate-600">Carregando...</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-white/80 backdrop-blur p-4 rounded-lg border border-green-200">
                          <p className="text-xs font-semibold text-slate-600 mb-1">Valor Mínimo</p>
                          <p className="text-2xl font-bold text-green-700">
                            R$ {withdrawalLimits.min.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-white/80 backdrop-blur p-4 rounded-lg border border-green-200">
                          <p className="text-xs font-semibold text-slate-600 mb-1">Valor Máximo</p>
                          <p className="text-2xl font-bold text-green-700">
                            R$ {withdrawalLimits.max.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 mt-4">
                        Configure os valores mínimo e máximo que os usuários podem solicitar para saque via PIX.
                      </p>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWithdrawalLimitsDialog(true)}
                  disabled={isLoadingSettings}
                  className="ml-4 hover:bg-green-50 hover:border-green-300 transition-colors"
                >
                  Configurar
                </Button>
              </div>
            </div>

            {/* Valores Rápidos de Saque */}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-slate-900">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    Valores Rápidos de Saque
                  </h3>
                  {isLoadingSettings ? (
                    <p className="text-sm text-slate-600">Carregando...</p>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {quickWithdrawalValues.map((value) => (
                          <div key={value} className="bg-white/80 backdrop-blur px-4 py-2 rounded-lg border-2 border-purple-200 font-bold text-purple-700">
                            R$ {value.toFixed(2)}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 mt-4">
                        Botões de valores rápidos que aparecem na tela de saque do aplicativo. Além destes, o botão "TUDO" sempre estará disponível.
                      </p>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuickValuesDialog(true)}
                  disabled={isLoadingSettings}
                  className="ml-4 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                >
                  Configurar
                </Button>
              </div>
            </div>

            {/* Horário de Reset */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-slate-900">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    Horário de Reset Diário
                  </h3>
                  {isLoadingSettings ? (
                    <p className="text-sm text-slate-600">Carregando...</p>
                  ) : (
                    <>
                      <div className="bg-white/80 backdrop-blur p-4 rounded-lg border border-blue-200 mt-4 inline-block">
                        <p className="text-xs font-semibold text-slate-600 mb-1">Horário Configurado</p>
                        <p className="text-3xl font-bold text-blue-700 font-mono">{resetTime}</p>
                      </div>
                      <p className="text-xs text-slate-600 mt-4">
                        Este horário determina quando o ranking diário será resetado e os pontos diários dos usuários serão zerados.
                      </p>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResetTimeDialog(true)}
                  disabled={isLoadingSettings}
                  className="ml-4 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  Alterar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zona de Perigo */}
      <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50 shadow-lg">
        <CardHeader className="border-b border-red-200">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-900">Zona de Perigo</h2>
              <p className="text-sm text-red-700 font-normal mt-0.5">Ações irreversíveis - use com extrema cautela</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="p-6 bg-white rounded-xl border-2 border-red-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-red-900 mb-2">
                    Remover Todos os Usuários
                  </h3>
                  <p className="text-sm text-red-700 mb-4">
                    Esta ação irá deletar permanentemente todos os usuários do sistema,
                    incluindo notificações, histórico de pontos e saques. Esta ação não
                    pode ser desfeita.
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                <Trash2 className="w-4 h-4" />
                Remover Todos os Usuários
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Configuração de Valores Rápidos */}
      <Dialog open={showQuickValuesDialog} onOpenChange={setShowQuickValuesDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              Configurar Valores Rápidos
            </DialogTitle>
            <DialogDescription className="text-base pt-4">
              Configure os valores que aparecerão como botões rápidos na tela de saque. O botão "TUDO" sempre estará disponível automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Valores Atuais</Label>
              <div className="flex flex-wrap gap-2">
                {newQuickWithdrawalValues.map((value) => (
                  <div key={value} className="flex items-center gap-2 bg-purple-100 px-3 py-2 rounded-lg border-2 border-purple-300">
                    <span className="font-bold text-purple-700">R$ {value.toFixed(2)}</span>
                    <button
                      onClick={() => handleRemoveQuickValue(value)}
                      className="text-purple-600 hover:text-purple-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {newQuickWithdrawalValues.length === 0 && (
                  <p className="text-sm text-slate-500">Nenhum valor adicionado</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-quick-value" className="text-base font-semibold">
                Adicionar Novo Valor (R$)
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    id="new-quick-value"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={newQuickValue}
                    onChange={(e) => setNewQuickValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddQuickValue();
                      }
                    }}
                    className="pl-10 text-lg"
                    placeholder="Ex: 50.00"
                  />
                </div>
                <Button
                  onClick={handleAddQuickValue}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Máximo de 6 valores. Pressione Enter ou clique em + para adicionar.
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-800">
                <strong>Dica:</strong> Adicione valores comuns como R$ 10, R$ 20, R$ 50, R$ 100. O botão "TUDO" (saldo completo) será adicionado automaticamente pelo app.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowQuickValuesDialog(false);
                setNewQuickWithdrawalValues(quickWithdrawalValues);
                setNewQuickValue("");
              }}
              disabled={isUpdatingQuickValues}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateQuickValues}
              disabled={isUpdatingQuickValues}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isUpdatingQuickValues ? "Salvando..." : "Salvar Valores"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Configuração de Limites de Saque */}
      <Dialog open={showWithdrawalLimitsDialog} onOpenChange={setShowWithdrawalLimitsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              Configurar Limites de Saque
            </DialogTitle>
            <DialogDescription className="text-base pt-4">
              Defina os valores mínimo e máximo que os usuários podem solicitar para saque via PIX.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="min-withdrawal" className="text-base font-semibold">
                Valor Mínimo de Saque (R$)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  id="min-withdrawal"
                  type="number"
                  min="1"
                  step="0.01"
                  value={newWithdrawalLimits.min}
                  onChange={(e) => setNewWithdrawalLimits({
                    ...newWithdrawalLimits,
                    min: parseFloat(e.target.value) || 0
                  })}
                  className="pl-10 text-lg font-semibold"
                  placeholder="10.00"
                />
              </div>
              <p className="text-xs text-slate-500">
                Valor mínimo que um usuário pode solicitar para saque
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-withdrawal" className="text-base font-semibold">
                Valor Máximo de Saque (R$)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  id="max-withdrawal"
                  type="number"
                  min="1"
                  step="0.01"
                  value={newWithdrawalLimits.max}
                  onChange={(e) => setNewWithdrawalLimits({
                    ...newWithdrawalLimits,
                    max: parseFloat(e.target.value) || 0
                  })}
                  className="pl-10 text-lg font-semibold"
                  placeholder="1000.00"
                />
              </div>
              <p className="text-xs text-slate-500">
                Valor máximo que um usuário pode solicitar para saque
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Nota:</strong> Os valores são em Reais (R$). Os usuários verão esses limites na tela de saque.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowWithdrawalLimitsDialog(false);
                setNewWithdrawalLimits(withdrawalLimits);
              }}
              disabled={isUpdatingLimits}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateWithdrawalLimits}
              disabled={isUpdatingLimits}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isUpdatingLimits ? "Salvando..." : "Salvar Limites"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Configuração de Horário de Reset */}
      <Dialog open={showResetTimeDialog} onOpenChange={setShowResetTimeDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              Configurar Horário de Reset
            </DialogTitle>
            <DialogDescription className="text-base pt-4">
              Configure o horário em que o ranking diário será resetado e os pontos diários dos usuários serão zerados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-time" className="text-base font-semibold">
                Horário de Reset (formato 24h)
              </Label>
              <Input
                id="reset-time"
                type="time"
                value={newResetTime}
                onChange={(e) => setNewResetTime(e.target.value)}
                className="font-mono text-lg"
              />
              <p className="text-xs text-slate-500">
                Exemplo: 21:00 para 9 da noite, 00:00 para meia-noite
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> O horário é baseado no fuso horário do servidor (GMT-3 - Brasília).
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowResetTimeDialog(false);
                setNewResetTime(resetTime);
              }}
              disabled={isUpdatingTime}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateResetTime}
              disabled={isUpdatingTime}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {isUpdatingTime ? "Salvando..." : "Salvar Horário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Exclusão de Todos os Usuários
            </DialogTitle>
            <DialogDescription className="text-base pt-4">
              Esta ação é <strong>irreversível</strong> e irá:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Deletar todos os usuários cadastrados</li>
                <li>Remover todo o histórico de pontos</li>
                <li>Excluir todas as notificações</li>
                <li>Apagar todos os registros de saques</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirm">
                Digite <strong>DELETAR TUDO</strong> para confirmar:
              </Label>
              <Input
                id="confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETAR TUDO"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setConfirmText("");
              }}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllUsers}
              disabled={confirmText !== "DELETAR TUDO" || isDeleting}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              {isDeleting ? "Deletando..." : "Confirmar Exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
