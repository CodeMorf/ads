import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PlatformType, CreativeConcept } from '../types';
import { CreativeAgent, StrategistAgent } from '../core/mastra-agents';
import { 
  Rocket, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  ShieldCheck, 
  DollarSign, 
  Globe, 
  Target,
  CheckCircle2
} from 'lucide-react';

export const CampaignLauncherTab: React.FC = () => {
  const { products, launchNewCampaign } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchedSuccess, setLaunchedSuccess] = useState(false);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [campaignName, setCampaignName] = useState('Escala Q4 — Funnel Automatizado');
  const [targetGoal, setTargetGoal] = useState('Vender 100 unidades manteniendo mínimo $25 USD de beneficio neto por venta');
  const [targetUnits, setTargetUnits] = useState(100);
  const [targetCountry, setTargetCountry] = useState('Estados Unidos, España, México');
  const [dailyBudget, setDailyBudget] = useState(150);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('meta');
  
  // Creatividades generadas por IA
  const [generatedConcepts, setGeneratedConcepts] = useState<CreativeConcept[]>([]);
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);
  const [aiStrategySummary, setAiStrategySummary] = useState('');

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  // Cálculo automático del objetivo financiero:
  // CPA Máximo Admisible = Beneficio antes de Ads - Beneficio neto objetivo
  const profitBeforeAds = selectedProduct ? selectedProduct.profitBeforeAds : 50;
  const targetProfitPerUnit = selectedProduct ? selectedProduct.minProfitTarget : 25;
  const calculatedMaxAdmissibleCPA = Math.max(0, profitBeforeAds - targetProfitPerUnit);
  const totalProjectedRevenue = targetUnits * selectedProduct.sellingPrice;
  const totalProjectedNetProfit = targetUnits * targetProfitPerUnit;

  // Paso 6: Generar Creatividades con Creative Agent
  const handleGenerateCreatives = async () => {
    setIsGenerating(true);
    try {
      const creativeRes = await CreativeAgent.generateConcepts(selectedProduct, 4);
      setGeneratedConcepts(creativeRes.data);
      setSelectedConcepts(creativeRes.data.slice(0, 3).map(c => c.id));

      const stratRes = await StrategistAgent.planStrategy(selectedProduct, targetGoal);
      setAiStrategySummary(stratRes.summary);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleConceptSelection = (id: string) => {
    setSelectedConcepts(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleLaunch = async () => {
    setIsLaunching(true);
    try {
      const activeCreatives = generatedConcepts.filter(c => selectedConcepts.includes(c.id));
      await launchNewCampaign({
        productId: selectedProductId,
        name: campaignName,
        objective: 'CONVERSIONS',
        dailyBudget,
        platform: selectedPlatform,
        country: targetCountry,
        creatives: activeCreatives.length > 0 ? activeCreatives : [
          {
            id: 'c_default',
            title: 'Concepto Lanzamiento Directo',
            angle: 'Oferta Exclusiva',
            hook: 'Descubre la solución número uno',
            headline: selectedProduct.name,
            primaryText: 'Envío prioritario y garantía total de satisfacción.',
            callToAction: 'Comprar Ahora',
            imagePrompt: '',
            videoPrompt: '',
            score: 90,
            status: 'TESTING',
            variantVersion: 1
          }
        ],
      });
      setLaunchedSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLaunching(false);
    }
  };

  const resetLauncher = () => {
    setCurrentStep(1);
    setLaunchedSuccess(false);
    setGeneratedConcepts([]);
    setSelectedConcepts([]);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Cabecera */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
          <Rocket className="w-6 h-6 text-indigo-400" />
          <span>Campaign Launcher (Asistente de Lanzamiento)</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Lanza campañas autónomas con validación financiera previa. AllSender calcula cuánto puedes pagar por adquisición antes de publicar anuncios.
        </p>
      </div>

      {/* Barra de Progreso del Wizard */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400 overflow-x-auto pb-2 sm:pb-0">
          {[
            '1. Producto',
            '2. Objetivo',
            '3. Presupuesto',
            '4. Plataformas',
            '5. Creatividades IA',
            '6. Revisión & Riesgo',
          ].map((label, index) => {
            const stepNum = index + 1;
            const isCurrent = currentStep === stepNum;
            const isPassed = currentStep > stepNum;

            return (
              <div key={label} className="flex items-center gap-2 shrink-0">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isPassed
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isPassed ? <Check className="w-3.5 h-3.5" /> : stepNum}
                </span>
                <span className={isCurrent ? 'text-white font-semibold' : 'text-slate-400'}>
                  {label}
                </span>
                {index < 5 && <ChevronRight className="w-4 h-4 text-slate-700 mx-1" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* CUERPO DEL WIZARD */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl">
        {/* ÉXITO AL LANZAR */}
        {launchedSuccess ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-emerald-950 border border-emerald-700 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">¡Campaña Desplegada con Éxito en Zernio!</h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto">
              La campaña <strong>{campaignName}</strong> ha sido inicializada en <strong>{selectedPlatform.toUpperCase()}</strong>. Las creatividades han entrado a la fase de experimentación con presupuesto protegido por el Risk Engine.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={resetLauncher}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-sm"
              >
                Lanzar Otra Campaña
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* PASO 1: SELECCIONAR PRODUCTO */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-white">Paso 1: Selecciona el Producto a Promocionar</h2>
                <p className="text-xs text-slate-400">
                  AllSender cargará automáticamente la estructura de costos y márgenes de este producto.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {products.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProductId(p.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedProductId === p.id
                          ? 'border-indigo-500 bg-indigo-950/40 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-mono block">{p.sku}</span>
                      <strong className="block text-sm font-bold text-white mt-1">{p.name}</strong>
                      <div className="mt-3 text-xs space-y-1 text-slate-400">
                        <div>Precio Venta: <strong className="text-slate-200">${p.sellingPrice}</strong></div>
                        <div>CPA Máx Rentable: <strong className="text-emerald-400">${p.maxProfitableCPA}</strong></div>
                        <div>Stock Disponible: <strong className="text-slate-200">{p.stock} unids</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 2: OBJETIVO & PAÍS */}
            {currentStep === 2 && (
              <div className="space-y-4 text-xs">
                <h2 className="text-base font-bold text-white">Paso 2: Objetivo Comercial & Geografía</h2>
                
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nombre de la Campaña</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Meta de Unidades a Vender</label>
                    <input
                      type="number"
                      value={targetUnits}
                      onChange={(e) => setTargetUnits(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">País o Región Objetivo</label>
                    <input
                      type="text"
                      value={targetCountry}
                      onChange={(e) => setTargetCountry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                    />
                  </div>
                </div>

                {/* Cálculo Matemático del Enunciado del Usuario */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 mt-2">
                  <div className="font-semibold text-white">Cálculo Determinista de Viabilidad:</div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Para tu objetivo de <strong>{targetUnits} unidades</strong> con <strong>${targetProfitPerUnit} USD</strong> de beneficio garantizado por venta:
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-slate-200 text-xs">
                    <div className="p-2 bg-slate-900 rounded">
                      <span className="text-[10px] text-slate-400 block">CPA Máximo Permitido</span>
                      <strong className="text-emerald-400 text-sm">${calculatedMaxAdmissibleCPA.toFixed(2)} USD</strong>
                    </div>
                    <div className="p-2 bg-slate-900 rounded">
                      <span className="text-[10px] text-slate-400 block">Ingresos Proyectados</span>
                      <strong className="text-white text-sm">${totalProjectedRevenue.toFixed(2)} USD</strong>
                    </div>
                    <div className="p-2 bg-slate-900 rounded">
                      <span className="text-[10px] text-slate-400 block">Beneficio Neto Meta</span>
                      <strong className="text-emerald-400 text-sm">${totalProjectedNetProfit.toFixed(2)} USD</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 3: PRESUPUESTO & CONTROL DE RIESGO */}
            {currentStep === 3 && (
              <div className="space-y-4 text-xs">
                <h2 className="text-base font-bold text-white">Paso 3: Presupuesto Diario & Regla 80/20</h2>
                
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Presupuesto Diario Inicial ($ USD)</label>
                  <input
                    type="number"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Presupuesto recomendado por Financial Engine: <strong>${selectedProduct.recommendedDailyBudget}/día</strong>
                  </span>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <span className="font-semibold text-slate-200 block">Distribución Automática de Capital (Principio Central):</span>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-400 block">Presupuesto Anuncios Ganadores (85%)</span>
                      <strong className="text-white text-sm">${Math.round(dailyBudget * 0.85)}/día</strong>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-400 block">Pool de Experimentación (15%)</span>
                      <strong className="text-indigo-400 text-sm">${Math.round(dailyBudget * 0.15)}/día</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 4: PLATAFORMAS */}
            {currentStep === 4 && (
              <div className="space-y-4 text-xs">
                <h2 className="text-base font-bold text-white">Paso 4: Selecciona Plataforma Publicitaria</h2>
                <p className="text-slate-400">
                  Despachado a través de Zernio Omni-Ads Hub.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    { id: 'meta' as const, name: 'Meta Ads', desc: 'Instagram & Facebook Reels / Feed', tag: 'Recomendado para UGC' },
                    { id: 'google' as const, name: 'Google Ads', desc: 'Search & Performance Max', tag: 'Alta Intención de Búsqueda' },
                    { id: 'tiktok' as const, name: 'TikTok Ads', desc: 'Spark Ads & Videos Virales', tag: 'Bajo CPM & Audiencia Joven' },
                  ].map(plat => (
                    <div
                      key={plat.id}
                      onClick={() => setSelectedPlatform(plat.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedPlatform === plat.id
                          ? 'border-indigo-500 bg-indigo-950/40 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <strong className="block text-sm font-bold text-white">{plat.name}</strong>
                      <span className="text-[11px] text-slate-400 block mt-1">{plat.desc}</span>
                      <span className="text-[10px] text-indigo-400 font-medium block mt-2">{plat.tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 5: CREATIVIDADES CON CREATIVE AGENT */}
            {currentStep === 5 && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white">Paso 5: Creatividades Generadas por IA</h2>
                    <p className="text-slate-400">
                      Creative Agent formula conceptos basados en psicología de compra y margen.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateCreatives}
                    disabled={isGenerating}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGenerating ? 'Generando en OpenRouter...' : 'Generar Creatividades'}</span>
                  </button>
                </div>

                {generatedConcepts.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <Sparkles className="w-8 h-8 text-indigo-400 mx-auto opacity-70" />
                    <div className="text-sm font-semibold text-white">Ningún concepto generado aún</div>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto">
                      Haz clic en "Generar Creatividades" para que el Creative Agent redacte hooks, titulares persuasivos y prompts visuales.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {generatedConcepts.map((concept) => {
                      const isSelected = selectedConcepts.includes(concept.id);
                      return (
                        <div
                          key={concept.id}
                          onClick={() => toggleConceptSelection(concept.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-950/20'
                              : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                                isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-600'
                              }`}>
                                {isSelected && '✓'}
                              </span>
                              <strong className="text-white text-sm">{concept.title}</strong>
                            </div>
                            <span className="text-[11px] text-emerald-400 font-semibold">
                              AI Score: {concept.score}/100
                            </span>
                          </div>
                          <div className="mt-2 text-slate-300">
                            <strong>Hook:</strong> "{concept.hook}"
                          </div>
                          <div className="mt-1 text-slate-400 text-[11px]">
                            <strong>Titular:</strong> {concept.headline} · <strong>CTA:</strong> {concept.callToAction}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* PASO 6: REVISIÓN & LANZAR */}
            {currentStep === 6 && (
              <div className="space-y-4 text-xs">
                <h2 className="text-base font-bold text-white">Paso 6: Revisión de Guardrails & Lanzamiento</h2>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">Producto:</span>
                    <strong className="text-white">{selectedProduct.name}</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">Plataforma:</span>
                    <strong className="text-white">{selectedPlatform.toUpperCase()} (vía Zernio)</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">Presupuesto Diario:</span>
                    <strong className="text-emerald-400">${dailyBudget} USD / día</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">CPA Máximo de Seguridad:</span>
                    <strong className="text-sky-400">${calculatedMaxAdmissibleCPA.toFixed(2)} USD</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Creatividades Seleccionadas:</span>
                    <strong className="text-white">{selectedConcepts.length || 1} variantes activas</strong>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-emerald-300 text-[11px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    Risk Engine validó esta orden. Presupuesto dentro del límite de cuenta y stock suficiente.
                  </span>
                </div>
              </div>
            )}

            {/* Botones de Navegación de Pasos */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>
              ) : <div />}

              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>Continuar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLaunch}
                  disabled={isLaunching}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <Rocket className="w-4 h-4" />
                  <span>{isLaunching ? 'Desplegando en Zernio...' : 'LANZAR CAMPAÑA'}</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
