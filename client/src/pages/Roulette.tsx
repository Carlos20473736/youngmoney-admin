import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RoulettePrize {
  value: number;
  description: string;
}

export default function Roulette() {
  const [prizes, setPrizes] = useState<Record<string, number>>({
    prize_1: 100,
    prize_2: 200,
    prize_3: 300,
    prize_4: 500,
    prize_5: 1000,
    prize_6: 2000,
    prize_7: 5000,
    prize_8: 10000,
  });
  
  const [maxDailySpins, setMaxDailySpins] = useState<number>(10);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const data = await api.getRouletteSettings();
      
      // Converter formato da API para o formato do estado
      const prizeValues: Record<string, number> = {};
      let maxSpins = 10; // Valor padrão
      
      Object.entries(data).forEach(([key, prize]) => {
        if (key === 'max_daily_spins') {
          maxSpins = (prize as RoulettePrize).value;
        } else {
          prizeValues[key] = (prize as RoulettePrize).value;
        }
      });
      
      setPrizes(prizeValues);
      setMaxDailySpins(maxSpins);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações da roleta");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      await api.updateRouletteSettings(prizes, maxDailySpins);
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setPrizes({
      prize_1: 100,
      prize_2: 200,
      prize_3: 300,
      prize_4: 500,
      prize_5: 1000,
      prize_6: 2000,
      prize_7: 5000,
      prize_8: 10000,
    });
    setMaxDailySpins(10);
    toast.info("Valores resetados para o padrão");
  }

  function handlePrizeChange(key: string, value: string) {
    const numValue = parseInt(value) || 0;
    setPrizes((prev) => ({
      ...prev,
      [key]: numValue,
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Valores da Roleta</h1>
        <p className="text-gray-600 mt-2">
          Configure os valores de prêmios da roleta (em desenvolvimento)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Configuração */}
        <Card>
          <CardHeader>
            <CardTitle>Configurar Prêmios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(prizes).map(([key, value], index) => (
              <div key={key}>
                <label className="text-sm font-medium mb-2 block">
                  Prêmio {index + 1}
                </label>
                <Input
                  type="number"
                  min="0"
                  step="10"
                  value={value}
                  onChange={(e) => handlePrizeChange(key, e.target.value)}
                  placeholder="Ex: 1000"
                />
              </div>
            ))}

            <div className="pt-4 border-t">
              <label className="text-sm font-medium mb-2 block">
                Giros Diários Máximos
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={maxDailySpins}
                onChange={(e) => setMaxDailySpins(parseInt(e.target.value) || 1)}
                placeholder="Ex: 10"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número máximo de giros que cada usuário pode fazer por dia
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </>
                )}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={saving}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview da Roleta */}
        <Card>
          <CardHeader>
            <CardTitle>Preview dos Valores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(prizes).map(([key, value], index) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-700">
                      Prêmio {index + 1}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      {value.toLocaleString("pt-BR")}
                    </div>
                    <div className="text-xs text-gray-500">pontos</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Total de prêmios:</strong>{" "}
                {Object.values(prizes)
                  .reduce((sum, val) => sum + val, 0)
                  .toLocaleString("pt-BR")}{" "}
                pontos
              </p>
              <p className="text-sm text-blue-900 mt-2">
                <strong>Média:</strong>{" "}
                {Math.round(
                  Object.values(prizes).reduce((sum, val) => sum + val, 0) / 8
                ).toLocaleString("pt-BR")}{" "}
                pontos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações */}
      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-900">
              <strong>⚠️ Em Desenvolvimento:</strong> A roleta está em fase de
              desenvolvimento. As configurações aqui definidas serão usadas
              quando a funcionalidade for ativada.
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-900">
              <strong>💡 Dica:</strong> Configure valores crescentes para tornar
              os prêmios maiores mais raros e emocionantes.
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-900">
              <strong>🎯 Recomendação:</strong> Mantenha uma boa distribuição
              entre prêmios pequenos (mais frequentes) e grandes (mais raros).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
