import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TestingEngine, FatigueAnalysisResult } from '../core/testing-engine';
import { CreativeAgent } from '../core/mastra-agents';
import { 
  FlaskConical, 
  Activity, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Flame,
  PieChart,
  Sparkles
} from 'lucide-react';

export const DynamicTestingTab: React.FC = () => {
  const { campaigns, products, riskConfig } = useApp();
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || '');
  const [isGeneratingVariant, setIsGeneratingVariant] = useState(false);
  const [newVariantSuccess, setNewVariantSuccess] = useState<string | null>(null);

  const currentCamp = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];
  const currentProd = products.find(p => p.id === currentCamp?.productId) || products[0];

  // Evaluar fatiga para cada anuncio
  const adsWithFatigue = (currentCamp?.ads || []).map(ad => {
    const fatigueAnalysis = TestingEngine.evaluateFatigue(ad, currentProd);
    return {
      ad,
      fatigueAnalysis,
    };
  });

  const handleCreateAntiFatigueVariant = async (adName: string) => {
    setIsGeneratingVariant(true);
    setNewVariantSuccess(null);
    try {
      // Simula generación de variante con Creative Agent
      await new Promise(r => setTimeout(r, 700));
      setNewVariantSuccess(`Nueva variante fresca generada para "${adName}". Se le asignó el 15% del presupuesto ($42/día) en el pool experimental.`);
    } finally {
      setIsGeneratingVariant(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Testing Dinámico & Detección de Fatiga</h1>
        <p className="text-sm text-slate-400 mt-1">
          Ciclo continuo: 10 conceptos → Top 5 → Top 3 → Top 2 → Ganador (85% presupuesto) + Pool de Experimentación (15%). La fatiga se detecta antes de que destruya el ROAS.
        </p>
      </div>

      {/* Selector de Campaña */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-bold text-white">Campaña en Monitoreo de Testing:</span>
        </div>

        <select
          value={selectedCampaignId}
          onChange={(e) => setSelectedCampaignId(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
          aria-label="Campaña en monitoreo de testing"
        >
          {campaigns.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.platform.toUpperCase()})</option>
          ))}
        </select>
      </div>

      {/* FUNNEL VISUAL DEL CICLO DINÁMICO (Sección 7) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Embudo de Eliminación Dinámica (10 → 5 → 3 → 2 → Ganador)</h2>
          </div>
          <span className="text-xs text-slate-400">Regla 85/15 Activa</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          {/* Fase 1 */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block font-semibold">1. Generación</span>
            <div className="text-xl font-bold text-white mt-1">10 Conceptos</div>
            <p className="text-[10px] text-slate-400 mt-1">Ideados por Creative Agent</p>
          </div>

          {/* Fase 2 */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block font-semibold">2. Preselección</span>
            <div className="text-xl font-bold text-indigo-400 mt-1">Top 5</div>
            <p className="text-[10px] text-slate-400 mt-1">Puntuados por Strategist</p>
          </div>

          {/* Fase 3 */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block font-semibold">3. Testeo Inicial</span>
            <div className="text-xl font-bold text-indigo-300 mt-1">Top 3</div>
            <p className="text-[10px] text-slate-400 mt-1">Filtro de CPA inicial</p>
          </div>

          {/* Fase 4 */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block font-semibold">4. Finalistas</span>
            <div className="text-xl font-bold text-purple-300 mt-1">Top 2</div>
            <p className="text-[10px] text-slate-400 mt-1">Comparativa Head-to-Head</p>
          </div>

          {/* Fase 5 */}
          <div className="p-3 bg-emerald-950/40 rounded-lg border border-emerald-800 text-center">
            <span className="text-[11px] text-emerald-400 block font-semibold">5. Ganador & Escala</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">Ganador (85%)</div>
            <p className="text-[10px] text-emerald-300/80 mt-1">+15% Pool Experimental</p>
          </div>
        </div>

        {/* Explicación de la Regla de Capital */}
        <div className="mt-4 p-3 bg-slate-950 rounded-lg text-slate-400 text-xs flex items-center justify-between">
          <span>
            <strong>Disciplina de Capital:</strong> Nunca se entrega el 100% permanente a un ganador. El 15% restante se mantiene compitiendo con variantes para cuando ocurra fatiga.
          </span>
          <PieChart className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />
        </div>
      </div>

      {/* MONITOR DE FATIGA DE ANUNCIOS (Sección 8) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Monitoreo de Fatiga & Saturación de Creatividades</h2>
          </div>
          <span className="text-xs text-slate-400">Algoritmo de Detección Automática</span>
        </div>

        {newVariantSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{newVariantSuccess}</span>
          </div>
        )}

        <div className="space-y-4">
          {adsWithFatigue.map(({ ad, fatigueAnalysis }) => {
            const isFatigued = fatigueAnalysis.isFatigued;
            const score = fatigueAnalysis.fatigueScore;

            return (
              <div
                key={ad.id}
                className={`p-4 rounded-xl border transition-all text-xs ${
                  isFatigued
                    ? 'border-amber-700/60 bg-amber-950/20'
                    : 'border-slate-800 bg-slate-950'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-white text-sm">{ad.name}</strong>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        ad.isWinner ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        ad.isExperimental ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {ad.isWinner ? 'Ganador Actual' : ad.isExperimental ? 'Variante en Testeo' : 'Estándar'}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">Estado: {ad.status}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-slate-300 text-xs">
                      <div>
                        <span className="text-slate-500 text-[11px] block">Frecuencia</span>
                        <strong className={ad.metrics.frequency >= 3.0 ? 'text-amber-400 font-bold' : 'text-white'}>
                          {ad.metrics.frequency.toFixed(2)}x
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">CTR</span>
                        <strong className={ad.metrics.ctr < 1.0 ? 'text-amber-400 font-bold' : 'text-white'}>
                          {ad.metrics.ctr}%
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">CPA Actual</span>
                        <strong className="text-white">${ad.metrics.cpa}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Presupuesto Asignado</span>
                        <strong className="text-white">${ad.budgetAllocated}/día</strong>
                      </div>
                    </div>
                  </div>

                  {/* Indicador de Fatiga y Acción */}
                  <div className="sm:text-right shrink-0 space-y-2">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Nivel de Fatiga</span>
                      <span className={`text-base font-bold ${
                        score >= 60 ? 'text-amber-400' : score >= 35 ? 'text-yellow-400' : 'text-emerald-400'
                      }`}>
                        {score}/100 {score >= 60 && '⚠️'}
                      </span>
                    </div>

                    {isFatigued && ad.status !== 'PAUSED' && (
                      <button
                        onClick={() => handleCreateAntiFatigueVariant(ad.name)}
                        disabled={isGeneratingVariant}
                        className="bg-amber-600 hover:bg-amber-500 text-black px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isGeneratingVariant ? 'Creando...' : 'Crear Variante Anti-Fatiga'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Explicación de Diagnóstico */}
                <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{fatigueAnalysis.rationale}</span>
                  <span className="text-slate-500">Recomendación: {fatigueAnalysis.recommendation}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
