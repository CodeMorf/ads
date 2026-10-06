import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AdsAnalystAgent, 
  StrategistAgent, 
  CreativeAgent, 
  OptimizationAgent, 
  JudgeAgent, 
  MastraMemoryStore 
} from '../core/mastra-agents';
import { OpenRouterGateway } from '../integrations/openrouter';
import { 
  Cpu, 
  Sparkles, 
  BrainCircuit, 
  History, 
  Search, 
  CheckCircle2, 
  Play, 
  Layers,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const AIBrainTab: React.FC = () => {
  const { products, campaigns } = useApp();
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || '');
  const [memoryQuery, setMemoryQuery] = useState('');
  const [isExecutingAgent, setIsExecutingAgent] = useState<string | null>(null);
  const [agentOutput, setAgentOutput] = useState<{ agent: string; output: any } | null>(null);

  const currentProd = products.find(p => p.id === selectedProduct) || products[0];
  const memoryItems = memoryQuery ? MastraMemoryStore.query(memoryQuery) : MastraMemoryStore.getAll();
  const settings = OpenRouterGateway.getSettings();

  const agents = [
    {
      id: 'analyst',
      name: 'Ads Analyst',
      profile: 'ANALYSIS_MODEL' as const,
      modelUsed: settings.selectedModels.ANALYSIS_MODEL,
      roleDescription: 'Analiza continuamente CTR, CPC, CPM, CPA, ROAS, conversiones, frecuencia y desgaste.',
      actionLabel: 'Ejecutar Diagnóstico Analítico',
    },
    {
      id: 'strategist',
      name: 'Strategist Agent',
      profile: 'STRATEGY_MODEL' as const,
      modelUsed: settings.selectedModels.STRATEGY_MODEL,
      roleDescription: 'Define qué ángulos y audiencias probar, distribución presupuestaria y mitigación de cuellos de botella.',
      actionLabel: 'Diseñar Estrategia de Prueba',
    },
    {
      id: 'creative',
      name: 'Creative Agent',
      profile: 'CREATIVE_MODEL' as const,
      modelUsed: settings.selectedModels.CREATIVE_MODEL,
      roleDescription: 'Genera 10 conceptos con hooks psicológicos, headlines persuasivos, copys y prompts para imagen/video.',
      actionLabel: 'Generar 5 Nuevos Conceptos',
    },
    {
      id: 'optimizer',
      name: 'Optimization Agent',
      profile: 'FAST_MODEL' as const,
      modelUsed: settings.selectedModels.FAST_MODEL,
      roleDescription: 'Emite recomendaciones operativas: PAUSE, REDUCE_BUDGET, INCREASE_BUDGET, CREATE_VARIANT.',
      actionLabel: 'Generar Recomendación Operativa',
    },
    {
      id: 'judge',
      name: 'Judge Agent',
      profile: 'JUDGE_MODEL' as const,
      modelUsed: settings.selectedModels.JUDGE_MODEL,
      roleDescription: 'Tribunal superior que audita decisiones de alto impacto económico (> $500 o escala mayor).',
      actionLabel: 'Evaluar Decisión de Alto Impacto',
    },
  ];

  const handleRunAgent = async (agentId: string) => {
    setIsExecutingAgent(agentId);
    setAgentOutput(null);

    try {
      if (agentId === 'analyst') {
        const dummyMetrics = campaigns[0]?.metrics || {
          spend: 280, attributedRevenue: 1246, netProfit: 546, conversions: 14,
          roas: 4.45, cpa: 20.0, cpc: 0.72, ctr: 2.85, cpm: 20.5, frequency: 1.6, impressions: 13650, clicks: 389, lastUpdated: ''
        };
        const res = await AdsAnalystAgent.analyze(dummyMetrics, currentProd, 15);
        setAgentOutput({ agent: 'Ads Analyst', output: res });
      } else if (agentId === 'strategist') {
        const res = await StrategistAgent.planStrategy(currentProd, 'Escalar ventas con CPA < $' + currentProd.maxProfitableCPA);
        setAgentOutput({ agent: 'Strategist Agent', output: res });
      } else if (agentId === 'creative') {
        const res = await CreativeAgent.generateConcepts(currentProd, 3);
        setAgentOutput({ agent: 'Creative Agent', output: res });
      } else if (agentId === 'optimizer') {
        const dummyAd = campaigns[0]?.ads[0] || {
          id: 'ad_dummy', campaignId: 'c1', name: 'Ad UGC',
          creative: {} as any, metrics: campaigns[0]?.metrics,
          status: 'ACTIVE', fatigueScore: 20, isWinner: true, isExperimental: false, platform: 'meta', budgetAllocated: 150, createdAt: ''
        };
        const res = await OptimizationAgent.recommend(dummyAd, currentProd);
        setAgentOutput({ agent: 'Optimization Agent', output: res });
      } else if (agentId === 'judge') {
        const res = await JudgeAgent.reviewHighImpactDecision(
          'Reasignar 40% del presupuesto diario hacia TikTok Ads',
          850,
          `Producto ${currentProd.name}. Margen unitario resguardado. Stock: ${currentProd.stock} unidades.`
        );
        setAgentOutput({ agent: 'Judge Agent', output: res });
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsExecutingAgent(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">AI Ads Brain (Mastra Multi-Agent Hub)</h1>
        <p className="text-sm text-slate-400 mt-1">
          Ecosistema de agentes especializados coordinados bajo Mastra. Cada agente opera con un modelo específico asignado vía OpenRouter y respeta el principio central de no tocar dinero sin autorización del Risk Engine.
        </p>
      </div>

      {/* Selector de Producto para Contexto del Cerebro */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-5 h-5 text-indigo-400" />
          <div>
            <div className="text-xs font-semibold text-white">Contexto de Producto Activo</div>
            <div className="text-[11px] text-slate-400">Los agentes calibran sus decisiones con base en los márgenes de este producto.</div>
          </div>
        </div>

        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
          aria-label="Seleccionar producto"
        >
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} (CPA Máx: ${p.maxProfitableCPA} | ROAS Mín: {p.minProfitableROAS}x)
            </option>
          ))}
        </select>
      </div>

      {/* Grid de los 5 Agentes de Mastra */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map((ag) => {
          const isBusy = isExecutingAgent === ag.id;

          return (
            <div
              key={ag.id}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-white">{ag.name}</h2>
                    <div className="text-[11px] text-indigo-400 font-mono mt-0.5">
                      {ag.modelUsed}
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Activo y en espera" />
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {ag.roleDescription}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleRunAgent(ag.id)}
                  disabled={isBusy}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
                  <span>{isBusy ? 'Procesando en OpenRouter...' : ag.actionLabel}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visualizador de Salida de Agente en Vivo */}
      {agentOutput && (
        <div className="bg-slate-900 border border-indigo-900/70 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-white">Respuesta Generada por {agentOutput.agent}</span>
              <span className="text-slate-400">· Modelo: {agentOutput.output.modelUsed}</span>
            </div>
            <div className="text-slate-400">
              Latencia: {agentOutput.output.latencyMs}ms | Tokens: {agentOutput.output.tokensConsumed}
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-200">
            <div className="font-semibold text-indigo-300 mb-1">Resumen del Razonamiento:</div>
            <p className="p-3 bg-slate-950 rounded-lg text-slate-300 leading-relaxed font-sans">
              {agentOutput.output.summary}
            </p>

            <div className="mt-3">
              <div className="font-semibold text-slate-400 mb-1">Estructura de Datos Producida:</div>
              <pre className="p-3 bg-slate-950 rounded-lg text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-56">
                {JSON.stringify(agentOutput.output.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 11: MEMORIA DE MASTRA */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <h2 className="text-base font-bold text-white">Mastra Long-Term Memory Hub</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Base de conocimiento contextual persistente: creatividades ganadoras pasadas, patrones de fatiga, estacionalidad y audiencias más rentables.
            </p>
          </div>

          {/* Buscador de Memoria */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={memoryQuery}
              onChange={(e) => setMemoryQuery(e.target.value)}
              placeholder="Buscar en la memoria..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Lista de Registros en Memoria */}
        <div className="divide-y divide-slate-800/80 mt-2">
          {memoryItems.map((item) => (
            <div key={item.id} className="py-3.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{item.productName}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-purple-400 font-medium">{item.category}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">{item.date}</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold">
                  Confianza: {(item.confidenceScore * 100).toFixed(0)}%
                </div>
              </div>

              <div className="text-slate-300 font-medium">
                {item.summary}
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg text-slate-400 text-[11px] space-y-1">
                <div>
                  <strong className="text-slate-200">Aprendizaje Clave:</strong> {item.keyTakeaway}
                </div>
                <div>
                  <strong className="text-slate-200">Evidencia Numérica:</strong> {item.metricsProof}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
