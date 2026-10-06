import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiskEngine, ProposedAction, RiskEvaluationResult } from '../core/risk-engine';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  DollarSign, 
  Percent,
  Play,
  RotateCcw
} from 'lucide-react';

export const RiskEngineTab: React.FC = () => {
  const { 
    riskConfig, 
    updateRiskConfig, 
    products, 
    campaigns, 
    totalSpendToday,
    autonomousMode 
  } = useApp();

  // Estado del Simulador Interactivo de Riesgo
  const [simProduct, setSimProduct] = useState(products[0]?.id || '');
  const [simActionType, setSimActionType] = useState<'INCREASE_BUDGET' | 'REDUCE_BUDGET' | 'PAUSE'>('INCREASE_BUDGET');
  const [simDeltaPercent, setSimDeltaPercent] = useState<number>(80); // +80% por defecto para replicar el ejemplo del usuario
  const [simCurrentBudget, setSimCurrentBudget] = useState<number>(100);
  const [simStockOverride, setSimStockOverride] = useState<number>(45);
  const [simResult, setSimResult] = useState<RiskEvaluationResult | null>(null);

  const selectedProd = products.find(p => p.id === simProduct) || products[0];

  const handleRunSimulation = () => {
    const proposal: ProposedAction = {
      type: simActionType,
      deltaPercent: simActionType === 'INCREASE_BUDGET' ? Math.abs(simDeltaPercent) : -Math.abs(simDeltaPercent),
      currentBudget: simCurrentBudget,
      campaignId: 'camp_simulation',
      source: 'LLM_AGENT',
      reasoning: 'Simulación de orden generada por agente LLM',
    };

    const dummyMetrics = {
      spend: 150,
      attributedRevenue: 600,
      netProfit: 250,
      conversions: 8,
      roas: 4.0,
      cpa: 18.75,
      cpc: 0.6,
      ctr: 2.9,
      cpm: 18,
      frequency: 1.4,
      impressions: 8300,
      clicks: 250,
      lastUpdated: new Date().toISOString(),
    };

    const modifiedProd = {
      ...selectedProd,
      stock: simStockOverride,
    };

    const result = RiskEngine.evaluateAndClamp(
      proposal,
      riskConfig,
      autonomousMode,
      modifiedProd,
      dummyMetrics,
      totalSpendToday
    );

    setSimResult(result);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Risk Engine & Guardrail Architecture</h1>
        <p className="text-sm text-slate-400 mt-1">
          Capa de autoridad soberana. Ningún modelo de lenguaje (OpenAI, Claude, DeepSeek, etc.) tiene acceso directo a presupuestos o plataformas de anuncios. Cada orden es filtrada, clampada y auditada aquí.
        </p>
      </div>

      {/* Grid: Parámetros del Risk Engine */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Parámetros de Seguridad de la Cuenta</h2>
          </div>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Guardrails Activos (0 violaciones permitidas)</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
          {/* Max Daily Increase */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <label className="block text-slate-300 font-medium mb-1">
              Incremento Máximo Diario
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={riskConfig.maxDailyIncreasePct}
                onChange={(e) => updateRiskConfig({ maxDailyIncreasePct: Number(e.target.value) })}
                className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold"
              />
              <span className="text-slate-400 font-medium">% por 24h</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Si la IA pide +80%, el motor clampa estrictamente a +{riskConfig.maxDailyIncreasePct}%.
            </p>
          </div>

          {/* Max Daily Reduction */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <label className="block text-slate-300 font-medium mb-1">
              Reducción Máxima Diaria
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={riskConfig.maxDailyReductionPct}
                onChange={(e) => updateRiskConfig({ maxDailyReductionPct: Number(e.target.value) })}
                className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold"
              />
              <span className="text-slate-400 font-medium">% por 24h</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Evita frenazos bruscos que reinicien el aprendizaje del algoritmo.
            </p>
          </div>

          {/* Presupuesto Máximo Diario Cuenta */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <label className="block text-slate-300 font-medium mb-1">
              Presupuesto Máximo Diario
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={riskConfig.maxDailyBudget}
                onChange={(e) => updateRiskConfig({ maxDailyBudget: Number(e.target.value) })}
                className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold"
              />
              <span className="text-slate-400 font-medium">USD / día</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Techo de gasto absoluto para toda la cuenta.
            </p>
          </div>

          {/* Porcentaje de Experimentación */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <label className="block text-slate-300 font-medium mb-1">
              Pool de Experimentación
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={riskConfig.experimentationPercent}
                onChange={(e) => updateRiskConfig({ experimentationPercent: Number(e.target.value) })}
                className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold"
              />
              <span className="text-slate-400 font-medium">% del total</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              El {100 - riskConfig.experimentationPercent}% va a ganadores, el {riskConfig.experimentationPercent}% a nuevas variantes.
            </p>
          </div>

          {/* Mínimo de Conversiones */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <label className="block text-slate-300 font-medium mb-1">
              Mínimo de Conversiones
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={riskConfig.minConversionsBeforeAction}
                onChange={(e) => updateRiskConfig({ minConversionsBeforeAction: Number(e.target.value) })}
                className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold"
              />
              <span className="text-slate-400 font-medium">ventas</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Impide tomar decisiones drásticas con solo 1 o 2 ventas fortuitas.
            </p>
          </div>

          {/* Stock Mínimo para Escalar */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <label className="block text-slate-300 font-medium mb-1">
              Stock Mínimo para Escalar
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={riskConfig.minStockForScale}
                onChange={(e) => updateRiskConfig({ minStockForScale: Number(e.target.value) })}
                className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold"
              />
              <span className="text-slate-400 font-medium">unidades</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Bloquea escalado si el inventario corre riesgo de quiebre de stock.
            </p>
          </div>

          {/* Pérdida Máxima Diaria */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <label className="block text-slate-300 font-medium mb-1">
              Corte Preventivo por Pérdida
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={riskConfig.maxDailyLoss}
                onChange={(e) => updateRiskConfig({ maxDailyLoss: Number(e.target.value) })}
                className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold"
              />
              <span className="text-slate-400 font-medium">USD</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Pausa de emergencia en caso de fallos de tracking de la plataforma.
            </p>
          </div>

          {/* ROAS Mínimo Piso */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <label className="block text-slate-300 font-medium mb-1">
              Piso Mínimo de ROAS
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                step="0.1"
                value={riskConfig.minROAS}
                onChange={(e) => updateRiskConfig({ minROAS: Number(e.target.value) })}
                className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold"
              />
              <span className="text-slate-400 font-medium">ROAS piso</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Límite de corte absoluto en cualquier canal.
            </p>
          </div>
        </div>
      </div>

      {/* SIMULADOR INTERACTIVO DE RIESGO: Pon a prueba el Clamping del LLM */}
      <div className="bg-slate-900/90 border border-indigo-950/80 rounded-xl p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800 mb-5">
          <Zap className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-base font-bold text-white">Simulador Interactivo de Risk Clamping</h2>
            <p className="text-xs text-slate-400">
              Prueba en tiempo real cómo el Risk Engine frena o modifica una petición arbitraria del LLM.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Producto a Evaluar</label>
            <select
              value={simProduct}
              onChange={(e) => setSimProduct(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
              aria-label="Producto a evaluar"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Acción Solicitada por IA</label>
            <select
              value={simActionType}
              onChange={(e) => setSimActionType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
              aria-label="Acción solicitada por IA"
            >
              <option value="INCREASE_BUDGET">INCREASE_BUDGET (Escalar)</option>
              <option value="REDUCE_BUDGET">REDUCE_BUDGET (Reducir)</option>
              <option value="PAUSE">PAUSE (Pausar)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">
              Magnitud Solicitada (% delta)
            </label>
            <input
              type="number"
              value={simDeltaPercent}
              onChange={(e) => setSimDeltaPercent(Number(e.target.value))}
              placeholder="Ej. 80 para +80%"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">
              Stock Simulado (unidades)
            </label>
            <input
              type="number"
              value={simStockOverride}
              onChange={(e) => setSimStockOverride(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Presupuesto actual del anuncio: <strong>${simCurrentBudget}/día</strong>.
          </div>

          <button
            onClick={handleRunSimulation}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Ejecutar Evaluación de Riesgo</span>
          </button>
        </div>

        {/* Resultado del Clamping */}
        {simResult && (
          <div className="mt-6 p-4 rounded-xl border bg-slate-950 border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">Dictamen Oficial del Risk Engine:</span>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                simResult.approvedAction.riskClamped 
                  ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {simResult.approvedAction.riskClamped ? 'ACCIÓN CLAMPADA POR RIESGO' : 'APROBADO SIN MODIFICACIÓN'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-900 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Acción Solicitada (LLM):</span>
                <strong className="text-white text-sm">
                  {simResult.requestedAction.type} {simResult.requestedAction.delta} (${simResult.requestedAction.budgetProposed}/día)
                </strong>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Acción Aprobada (Risk Engine):</span>
                <strong className="text-emerald-400 text-sm">
                  {simResult.approvedAction.type} {simResult.approvedAction.delta}
                </strong>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Requiere Aprobación Manual:</span>
                <strong className={simResult.requiresUserApproval ? 'text-amber-400' : 'text-slate-200'}>
                  {simResult.requiresUserApproval ? 'SÍ (Modo Asistido/Manual)' : 'NO (Auto-ejecutable)'}
                </strong>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg text-slate-300">
              <strong className="text-slate-200">Motivo del Ajuste:</strong> {simResult.reason}
            </div>

            {simResult.guardrailBreaches.length > 0 && (
              <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-amber-300 text-[11px]">
                <strong className="block mb-1">Infracciones de Guardrail Detectadas:</strong>
                <ul className="list-disc pl-4 space-y-0.5">
                  {simResult.guardrailBreaches.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
