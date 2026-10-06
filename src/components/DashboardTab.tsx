import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Activity, 
  ShieldCheck, 
  Layers, 
  PauseCircle, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const DashboardTab: React.FC = () => {
  const { 
    totalSpendToday, 
    totalAttributedRevenueToday, 
    totalNetProfitToday, 
    overallROAS, 
    overallCPA, 
    overallCPC, 
    overallCTR, 
    totalConversionsToday, 
    estimatedAiSavings, 
    activeCampaignCount, 
    autoPausedAdsCount, 
    actionLogs,
    campaigns,
    runAutonomousCycle,
    isOptimizing
  } = useApp();

  const [activeChartMetric, setActiveChartMetric] = useState<'financial' | 'efficiency'>('financial');

  // Métricas por plataforma
  const metaSpend = campaigns.filter(c => c.platform === 'meta').reduce((a, b) => a + b.metrics.spend, 0);
  const metaRevenue = campaigns.filter(c => c.platform === 'meta').reduce((a, b) => a + b.metrics.attributedRevenue, 0);
  const metaROAS = metaSpend > 0 ? (metaRevenue / metaSpend).toFixed(2) : '0';

  const googleSpend = campaigns.filter(c => c.platform === 'google').reduce((a, b) => a + b.metrics.spend, 0);
  const googleRevenue = campaigns.filter(c => c.platform === 'google').reduce((a, b) => a + b.metrics.attributedRevenue, 0);
  const googleROAS = googleSpend > 0 ? (googleRevenue / googleSpend).toFixed(2) : '0';

  const tiktokSpend = campaigns.filter(c => c.platform === 'tiktok').reduce((a, b) => a + b.metrics.spend, 0);
  const tiktokRevenue = campaigns.filter(c => c.platform === 'tiktok').reduce((a, b) => a + b.metrics.attributedRevenue, 0);
  const tiktokROAS = tiktokSpend > 0 ? (tiktokRevenue / tiktokSpend).toFixed(2) : '0';

  // Datos simulados de tendencia horaria
  const hourlyData = [
    { hour: '00:00', spend: 25, revenue: 110, profit: 55, roas: 4.4, cpa: 19 },
    { hour: '04:00', spend: 40, revenue: 160, profit: 80, roas: 4.0, cpa: 20 },
    { hour: '08:00', spend: 120, revenue: 540, profit: 270, roas: 4.5, cpa: 18 },
    { hour: '12:00', spend: 280, revenue: 1220, profit: 590, roas: 4.35, cpa: 21 },
    { hour: '16:00', spend: 430, revenue: 1890, profit: 880, roas: 4.39, cpa: 20 },
    { hour: '20:00', spend: totalSpendToday, revenue: totalAttributedRevenueToday, profit: totalNetProfitToday, roas: overallROAS, cpa: overallCPA },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Título & Banner de Operación Inteligente */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Ejecutivo</h1>
          <p className="text-sm text-slate-400 mt-1">
            Supervisión consolidada de inversión omnicanal, atribución de ventas y control de riesgo determinista.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">Ahorro Estimado por IA</div>
            <div className="text-sm font-semibold text-emerald-400">
              +${estimatedAiSavings.toFixed(2)} USD preservados
            </div>
          </div>
          <button
            onClick={() => runAutonomousCycle()}
            disabled={isOptimizing}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isOptimizing ? 'Analizando...' : 'Ejecutar Ciclo de IA'}</span>
          </button>
        </div>
      </div>

      {/* Grid de Métricas Principales (KPIs requeridos en Sección 1) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Inversión hoy */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Inversión Hoy</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">${totalSpendToday.toFixed(2)}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">En presupuesto</span>
            <span>· Meta, Google, TikTok</span>
          </div>
        </div>

        {/* Ingresos Atribuidos */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Ingresos Atribuidos</span>
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">${totalAttributedRevenueToday.toFixed(2)}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalConversionsToday} pedidos procesados
          </div>
        </div>

        {/* Beneficio Neto Real */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Beneficio Neto</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">${totalNetProfitToday.toFixed(2)}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Limpio de Ads y costo producto
          </div>
        </div>

        {/* ROAS Global */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">ROAS Consolidado</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300">{overallROAS}x</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Objetivo mín: 3.20x
          </div>
        </div>

        {/* CPA Promedio */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">CPA Promedio</span>
            <BarChart3 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">${overallCPA.toFixed(2)}</div>
          <div className="text-[11px] text-emerald-400 mt-1">
            -$7.67 por debajo de CPA máx
          </div>
        </div>

        {/* CTR & CPC */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">CTR / CPC</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{overallCTR}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            CPC promedio: ${overallCPC}
          </div>
        </div>
      </div>

      {/* Segundo Bloque: Estado de Operación de IA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Campañas Activas</div>
            <div className="text-xl font-bold text-white mt-1">{activeCampaignCount} Campañas</div>
            <div className="text-xs text-slate-400 mt-0.5">Optimizadas por Decision Engine</div>
          </div>
          <Layers className="w-7 h-7 text-indigo-400 opacity-80" />
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Anuncios Pausados por IA</div>
            <div className="text-xl font-bold text-amber-400 mt-1">{autoPausedAdsCount} Anuncios</div>
            <div className="text-xs text-slate-400 mt-0.5">Por fatiga o CPA no rentable</div>
          </div>
          <PauseCircle className="w-7 h-7 text-amber-400 opacity-80" />
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Acciones Ejecutadas por IA</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{actionLogs.length} Decisiones</div>
            <div className="text-xs text-slate-400 mt-0.5">100% auditadas y clampadas</div>
          </div>
          <ShieldCheck className="w-7 h-7 text-emerald-400 opacity-80" />
        </div>
      </div>

      {/* Gráficos Principales e Interacción de Rendimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Inversión, Ingresos y Beneficio */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">Evolución Financiera Hoy</h2>
              <p className="text-xs text-slate-400">Curva horaria de inversión acumulada, ingresos y margen neto generado.</p>
            </div>

            {/* Segmented control para alternar vista */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
              <button
                onClick={() => setActiveChartMetric('financial')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeChartMetric === 'financial'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Inversión vs Ingresos vs Beneficio
              </button>
              <button
                onClick={() => setActiveChartMetric('efficiency')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeChartMetric === 'efficiency'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ROAS vs CPA
              </button>
            </div>
          </div>

          {/* Gráfico SVG limpio y nítido */}
          <div className="h-64 w-full relative flex flex-col justify-end">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-slate-700 w-full" />
              <div className="border-b border-slate-700 w-full" />
              <div className="border-b border-slate-700 w-full" />
              <div className="border-b border-slate-700 w-full" />
            </div>

            <div className="grid grid-cols-6 h-full items-end gap-3 z-10 pt-4">
              {hourlyData.map((d, index) => {
                const maxRevenue = 2600;
                const spendH = Math.min(100, (d.spend / maxRevenue) * 100 * 2.8);
                const revH = Math.min(100, (d.revenue / maxRevenue) * 100 * 2.8);
                const profH = Math.min(100, (d.profit / maxRevenue) * 100 * 2.8);

                return (
                  <div key={index} className="flex flex-col items-center h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-48">
                      {activeChartMetric === 'financial' ? (
                        <>
                          {/* Gasto */}
                          <div 
                            style={{ height: `${spendH}%` }} 
                            className="w-3.5 bg-slate-600 rounded-t group-hover:bg-slate-500 transition-all"
                            title={`Gasto: $${d.spend}`}
                          />
                          {/* Ingreso */}
                          <div 
                            style={{ height: `${revH}%` }} 
                            className="w-3.5 bg-indigo-500 rounded-t group-hover:bg-indigo-400 transition-all"
                            title={`Ingreso: $${d.revenue}`}
                          />
                          {/* Beneficio Neto */}
                          <div 
                            style={{ height: `${profH}%` }} 
                            className="w-3.5 bg-emerald-500 rounded-t group-hover:bg-emerald-400 transition-all"
                            title={`Beneficio: $${d.profit}`}
                          />
                        </>
                      ) : (
                        <>
                          {/* ROAS */}
                          <div 
                            style={{ height: `${d.roas * 18}%` }} 
                            className="w-5 bg-purple-500 rounded-t group-hover:bg-purple-400 transition-all"
                            title={`ROAS: ${d.roas}x`}
                          />
                          {/* CPA */}
                          <div 
                            style={{ height: `${d.cpa * 3.5}%` }} 
                            className="w-5 bg-sky-500 rounded-t group-hover:bg-sky-400 transition-all"
                            title={`CPA: $${d.cpa}`}
                          />
                        </>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-2">{d.hour}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leyenda limpia sin pills */}
          <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-slate-800 text-xs text-slate-300">
            {activeChartMetric === 'financial' ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-slate-600 rounded-sm" />
                  <span>Inversión Real (${totalSpendToday})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-indigo-500 rounded-sm" />
                  <span>Ingresos Ventas (${totalAttributedRevenueToday})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded-sm" />
                  <span>Beneficio Neto Real (${totalNetProfitToday})</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-purple-500 rounded-sm" />
                  <span>ROAS ({overallROAS}x)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-sky-500 rounded-sm" />
                  <span>CPA Adquisición (${overallCPA})</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Gráfico 2: Desglose por Plataforma Publicitaria */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Rendimiento por Plataforma</h2>
            <p className="text-xs text-slate-400 mt-0.5">Distribución coordinada mediante Zernio Omni-Ads Hub.</p>

            <div className="space-y-4 mt-6">
              {/* Meta */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 font-semibold text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Meta Ads (Instagram & FB)</span>
                  </div>
                  <span className="font-bold text-white">${metaSpend} USD</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>ROAS: <strong className="text-purple-300">{metaROAS}x</strong></span>
                  <span>Ingreso: ${metaRevenue} USD</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div style={{ width: `${(metaSpend / totalSpendToday) * 100}%` }} className="bg-blue-500 h-full" />
                </div>
              </div>

              {/* Google */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 font-semibold text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Google Ads (Search & PMax)</span>
                  </div>
                  <span className="font-bold text-white">${googleSpend} USD</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>ROAS: <strong className="text-purple-300">{googleROAS}x</strong></span>
                  <span>Ingreso: ${googleRevenue} USD</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div style={{ width: `${(googleSpend / totalSpendToday) * 100}%` }} className="bg-red-500 h-full" />
                </div>
              </div>

              {/* TikTok */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 font-semibold text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-teal-400" />
                    <span>TikTok Ads (Spark UGC)</span>
                  </div>
                  <span className="font-bold text-white">${tiktokSpend} USD</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>ROAS: <strong className="text-teal-300">{tiktokROAS}x</strong></span>
                  <span>Ingreso: ${tiktokRevenue} USD</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div style={{ width: `${(tiktokSpend / totalSpendToday) * 100}%` }} className="bg-teal-400 h-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Conexión activa mediante Zernio Provider. Sin dependencias directas en código de cliente.
          </div>
        </div>
      </div>

      {/* Feed en Vivo de Decisiones Recientes del Motor de IA */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Últimas Decisiones de AllSender AI</h2>
            <p className="text-xs text-slate-400">Transparencia total: cada acción fue filtrada por el Risk Engine antes de ejecutarse.</p>
          </div>
          <span className="text-xs text-indigo-400 font-medium">Auditoría en tiempo real</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {actionLogs.slice(0, 3).map((log) => (
            <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{log.productName}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-indigo-400 font-medium">{log.campaignName}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">{log.timestamp}</span>
                </div>
                <div className="text-slate-300 text-xs">
                  {log.reasoning}
                </div>
                {log.approvedAction.riskClamped && (
                  <div className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Risk Clamped: {log.approvedAction.clampingReason}</span>
                  </div>
                )}
              </div>

              <div className="sm:text-right shrink-0">
                <div className="font-semibold text-emerald-400">
                  {log.executedAction}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Agente: {log.aiAgent} ({log.aiModel})
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
