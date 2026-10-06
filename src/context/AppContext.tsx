import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Campaign, 
  ProductFinancials, 
  AIActionLog, 
  RiskEngineConfig, 
  AutonomousMode, 
  UserRole, 
  PlatformType,
  CreativeConcept,
  CampaignAd
} from '../types';
import { FinancialEngine, ProductInput } from '../core/financial-engine';
import { RiskEngine } from '../core/risk-engine';
import { DecisionEngine } from '../core/decision-engine';
import { TestingEngine } from '../core/testing-engine';
import { ZernioProvider } from '../integrations/zernio';
import { OpenRouterGateway } from '../integrations/openrouter';
import { MastraMemoryStore } from '../core/mastra-agents';

interface AppContextType {
  // Estado global
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  autonomousMode: AutonomousMode;
  setAutonomousMode: (mode: AutonomousMode) => void;
  
  // Productos
  products: ProductFinancials[];
  addProduct: (input: ProductInput) => void;
  updateProduct: (id: string, input: Partial<ProductInput>) => void;
  deleteProduct: (id: string) => void;
  
  // Campañas
  campaigns: Campaign[];
  activeCampaignCount: number;
  autoPausedAdsCount: number;
  totalSpendToday: number;
  totalAttributedRevenueToday: number;
  totalNetProfitToday: number;
  overallROAS: number;
  overallCPA: number;
  overallCPC: number;
  overallCTR: number;
  totalConversionsToday: number;
  estimatedAiSavings: number;
  
  // Acciones y Logs
  actionLogs: AIActionLog[];
  pendingApprovals: AIActionLog[];
  approveAction: (actionId: string) => void;
  rejectAction: (actionId: string) => void;
  
  // Configuración de Riesgo
  riskConfig: RiskEngineConfig;
  updateRiskConfig: (partial: Partial<RiskEngineConfig>) => void;
  
  // Proveedores
  zernioProvider: ZernioProvider;
  isZernioLive: boolean;
  toggleZernioEnvironment: () => void;
  
  // Motor de Automatización & Ciclo de Optimización
  runAutonomousCycle: (productId?: string) => Promise<string>;
  isOptimizing: boolean;
  
  // Lanzador de Campañas
  launchNewCampaign: (payload: {
    productId: string;
    name: string;
    objective: string;
    dailyBudget: number;
    platform: PlatformType;
    country: string;
    creatives: CreativeConcept[];
  }) => Promise<Campaign>;
  
  // Asistente Conversacional
  askAllSender: (query: string) => Promise<{ answer: string; relatedData?: any }>;
}

const AppContext = createContext<AppContextType | null>(null);

const INITIAL_PRODUCTS: ProductFinancials[] = [
  FinancialEngine.calculateProductMetrics({
    id: 'prod_01',
    name: 'Smart Massager Pro X',
    sku: 'SMP-01',
    cost: 22.0,
    sellingPrice: 89.0,
    salePrice: 79.0,
    stock: 84,
    shippingCost: 8.5,
    platformFee: 4.0,
    otherCosts: 2.5,
    minProfitTarget: 22.0,
    images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80'],
    videos: [],
    landingPage: 'https://myshop.com/smart-massager',
    currency: 'USD',
    category: 'Salud & Bienestar',
  }),
  FinancialEngine.calculateProductMetrics({
    id: 'prod_02',
    name: 'Auriculares Titanium ANC',
    sku: 'TIT-ANC-02',
    cost: 38.0,
    sellingPrice: 149.0,
    salePrice: 129.0,
    stock: 35,
    shippingCost: 11.0,
    platformFee: 6.5,
    otherCosts: 4.5,
    minProfitTarget: 35.0,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'],
    videos: [],
    landingPage: 'https://myshop.com/titanium-anc',
    currency: 'USD',
    category: 'Tecnología',
  }),
  FinancialEngine.calculateProductMetrics({
    id: 'prod_03',
    name: 'Lámpara Solar Halo RGB',
    sku: 'HALO-RGB-03',
    cost: 12.0,
    sellingPrice: 49.0,
    salePrice: 39.0,
    stock: 4, // Stock crítico intencional para demostrar protección
    shippingCost: 7.0,
    platformFee: 2.5,
    otherCosts: 1.5,
    minProfitTarget: 10.0,
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80'],
    videos: [],
    landingPage: 'https://myshop.com/halo-rgb',
    currency: 'USD',
    category: 'Hogar & Iluminación',
  }),
];

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp_meta_01',
    productId: 'prod_01',
    name: 'Meta Ads — Smart Massager Escala & UGC Funnel',
    objective: 'CONVERSIONS',
    platform: 'meta',
    targetCountry: 'Estados Unidos & España',
    dailyBudget: 280,
    experimentalBudgetPercent: 15,
    status: 'ACTIVE',
    createdAt: '2026-09-20T10:00:00Z',
    metrics: {
      spend: 280,
      attributedRevenue: 1246,
      netProfit: 546,
      conversions: 14,
      roas: 4.45,
      cpa: 20.0,
      cpc: 0.72,
      ctr: 2.85,
      cpm: 20.5,
      frequency: 1.6,
      impressions: 13650,
      clicks: 389,
      lastUpdated: new Date().toISOString(),
    },
    ads: [
      {
        id: 'ad_m1_winner',
        campaignId: 'camp_meta_01',
        name: 'UGC Ganador — "Alivio en 60s Cuello"',
        creative: {
          id: 'cr_01',
          title: 'Hook Demostración Inmediata',
          angle: 'Dolor y Alivio Inmediato',
          hook: '¿Pasas 8 horas frente a una pantalla?',
          headline: 'Alivio Inmediato en Cuello y Hombros',
          primaryText: 'Ergonomía clínica portátil. 40% OFF solo hoy con envío garantizado.',
          callToAction: 'Comprar con Descuento',
          imagePrompt: '',
          videoPrompt: '',
          score: 94,
          status: 'WINNER',
          variantVersion: 1,
        },
        metrics: {
          spend: 190,
          attributedRevenue: 978,
          netProfit: 468,
          conversions: 11,
          roas: 5.14,
          cpa: 17.27,
          cpc: 0.65,
          ctr: 3.4,
          cpm: 18.2,
          frequency: 1.5,
          impressions: 10400,
          clicks: 292,
          lastUpdated: new Date().toISOString(),
        },
        status: 'ACTIVE',
        fatigueScore: 18,
        isWinner: true,
        isExperimental: false,
        platform: 'meta',
        budgetAllocated: 190,
        createdAt: '2026-09-20T10:00:00Z',
      },
      {
        id: 'ad_m1_fatigued',
        campaignId: 'camp_meta_01',
        name: 'Foto Catálogo Fondo Blanco (Fatigado)',
        creative: {
          id: 'cr_02',
          title: 'Estática de Producto',
          angle: 'Características Técnicas',
          hook: 'Masajeador 6 velocidades',
          headline: 'El Masajeador Más Vendido',
          primaryText: 'Batería recargable y motor silencioso.',
          callToAction: 'Ver Tienda',
          imagePrompt: '',
          videoPrompt: '',
          score: 65,
          status: 'DISCARDED',
          variantVersion: 1,
        },
        metrics: {
          spend: 48,
          attributedRevenue: 89,
          netProfit: -12,
          conversions: 1,
          roas: 1.85,
          cpa: 48.0,
          cpc: 1.45,
          ctr: 0.95,
          cpm: 24.1,
          frequency: 3.6, // Fatigado
          impressions: 2000,
          clicks: 33,
          lastUpdated: new Date().toISOString(),
        },
        status: 'PAUSED',
        fatigueScore: 78,
        isWinner: false,
        isExperimental: false,
        platform: 'meta',
        budgetAllocated: 0,
        createdAt: '2026-09-20T10:00:00Z',
      },
      {
        id: 'ad_m1_experiment',
        campaignId: 'camp_meta_01',
        name: 'Variante v2 — "Ahorro vs Fisioterapeuta"',
        creative: {
          id: 'cr_03',
          title: 'Comparativa de Costo',
          angle: 'Ahorro Financiero',
          hook: 'No pagues $100 por sesión de masaje.',
          headline: 'Tu Fisioterapeuta Personal en Casa',
          primaryText: 'Una inversión única que te dura años. Más de 10k testimonios.',
          callToAction: 'Ver Oferta Limitada',
          imagePrompt: '',
          videoPrompt: '',
          score: 88,
          status: 'TESTING',
          variantVersion: 2,
        },
        metrics: {
          spend: 42,
          attributedRevenue: 179,
          netProfit: 90,
          conversions: 2,
          roas: 4.26,
          cpa: 21.0,
          cpc: 0.68,
          ctr: 2.6,
          cpm: 17.5,
          frequency: 1.2,
          impressions: 2400,
          clicks: 62,
          lastUpdated: new Date().toISOString(),
        },
        status: 'TESTING',
        fatigueScore: 12,
        isWinner: false,
        isExperimental: true,
        platform: 'meta',
        budgetAllocated: 42,
        createdAt: '2026-10-02T10:00:00Z',
      },
    ],
  },
  {
    id: 'camp_google_02',
    productId: 'prod_02',
    name: 'Google Ads — Titanium ANC Búsqueda de Alta Intención',
    objective: 'SEARCH_PURCHASE',
    platform: 'google',
    targetCountry: 'Estados Unidos',
    dailyBudget: 195,
    experimentalBudgetPercent: 10,
    status: 'ACTIVE',
    createdAt: '2026-09-28T14:00:00Z',
    metrics: {
      spend: 195,
      attributedRevenue: 745,
      netProfit: 310,
      conversions: 5,
      roas: 3.82,
      cpa: 39.0,
      cpc: 1.15,
      ctr: 4.2,
      cpm: 48.0,
      frequency: 1.1,
      impressions: 4060,
      clicks: 170,
      lastUpdated: new Date().toISOString(),
    },
    ads: [
      {
        id: 'ad_g1_winner',
        campaignId: 'camp_google_02',
        name: 'Headlines Búsqueda — "Mejor Cancelación de Ruido 2026"',
        creative: {
          id: 'cr_g1',
          title: 'Intención de Búsqueda Comparativa',
          angle: 'Calidad de Audio & Silencio Absoluto',
          hook: 'Los auriculares con cancelación activa #1 en pruebas de sonido.',
          headline: 'Cancelación de Ruido de Grado Estudio',
          primaryText: 'Sonido de alta resolución, batería de 40 horas. Envío express incluido.',
          callToAction: 'Comprar Ahora con Descuento',
          imagePrompt: '',
          videoPrompt: '',
          score: 91,
          status: 'WINNER',
          variantVersion: 1,
        },
        metrics: {
          spend: 195,
          attributedRevenue: 745,
          netProfit: 310,
          conversions: 5,
          roas: 3.82,
          cpa: 39.0,
          cpc: 1.15,
          ctr: 4.2,
          cpm: 48.0,
          frequency: 1.1,
          impressions: 4060,
          clicks: 170,
          lastUpdated: new Date().toISOString(),
        },
        status: 'ACTIVE',
        fatigueScore: 10,
        isWinner: true,
        isExperimental: false,
        platform: 'google',
        budgetAllocated: 195,
        createdAt: '2026-09-28T14:00:00Z',
      },
    ],
  },
  {
    id: 'camp_tiktok_03',
    productId: 'prod_01',
    name: 'TikTok Ads — Smart Massager Spark Viral',
    objective: 'TIKTOK_SHOP_PURCHASE',
    platform: 'tiktok',
    targetCountry: 'Estados Unidos',
    dailyBudget: 110,
    experimentalBudgetPercent: 20,
    status: 'ACTIVE',
    createdAt: '2026-10-01T16:00:00Z',
    metrics: {
      spend: 110,
      attributedRevenue: 534,
      netProfit: 228,
      conversions: 6,
      roas: 4.85,
      cpa: 18.33,
      cpc: 0.42,
      ctr: 3.85,
      cpm: 16.2,
      frequency: 1.3,
      impressions: 6790,
      clicks: 262,
      lastUpdated: new Date().toISOString(),
    },
    ads: [
      {
        id: 'ad_tt_01',
        campaignId: 'camp_tiktok_03',
        name: 'Spark Video — "POV: Tu Cuello Después del Trabajo"',
        creative: {
          id: 'cr_tt_01',
          title: 'POV Descontracturante',
          angle: 'UGC Orgánico / POV',
          hook: 'No sabía que necesitaba esto hasta que lo probé a las 6 PM.',
          headline: 'Alivio Inmediato en Casa',
          primaryText: 'El producto viral de TikTok que sí funciona. Descuento temporal.',
          callToAction: 'Aprovechar Oferta TikTok',
          imagePrompt: '',
          videoPrompt: '',
          score: 93,
          status: 'WINNER',
          variantVersion: 1,
        },
        metrics: {
          spend: 110,
          attributedRevenue: 534,
          netProfit: 228,
          conversions: 6,
          roas: 4.85,
          cpa: 18.33,
          cpc: 0.42,
          ctr: 3.85,
          cpm: 16.2,
          frequency: 1.3,
          impressions: 6790,
          clicks: 262,
          lastUpdated: new Date().toISOString(),
        },
        status: 'ACTIVE',
        fatigueScore: 15,
        isWinner: true,
        isExperimental: false,
        platform: 'tiktok',
        budgetAllocated: 110,
        createdAt: '2026-10-01T16:00:00Z',
      },
    ],
  },
];

const INITIAL_LOGS: AIActionLog[] = [
  {
    id: 'log_01',
    timestamp: 'Hoy, 09:14 AM',
    accountId: 'zernio_act_meta_01',
    productId: 'prod_01',
    productName: 'Smart Massager Pro X',
    campaignId: 'camp_meta_01',
    campaignName: 'Meta Ads — Smart Massager Escala & UGC Funnel',
    adId: 'ad_m1_fatigued',
    adName: 'Foto Catálogo Fondo Blanco',
    aiAgent: 'Optimization Agent',
    aiModel: 'Claude 3.7 Sonnet (OpenRouter)',
    metricsBefore: { cpa: 48.0, roas: 1.85, spend: 48, conversions: 1, frequency: 3.6 },
    reasoning: 'El anuncio muestra fatiga severa (frecuencia 3.6x) y CPA ($48) superior al CPA máximo rentable del producto ($26). Destruye margen.',
    requestedAction: { type: 'PAUSE', delta: 'PAUSAR ANUNCIO', targetId: 'ad_m1_fatigued' },
    approvedAction: { type: 'PAUSE', delta: 'PAUSAR ANUNCIO', riskClamped: false },
    executedAction: 'Pausé automáticamente el anuncio no rentable en Meta Ads mediante Zernio.',
    status: 'EXECUTED',
    metricsAfter: { cpa: 20.0, roas: 4.45, spend: 280, netProfitDelta: 48 },
  },
  {
    id: 'log_02',
    timestamp: 'Hoy, 08:30 AM',
    accountId: 'zernio_act_meta_01',
    productId: 'prod_01',
    productName: 'Smart Massager Pro X',
    campaignId: 'camp_meta_01',
    campaignName: 'Meta Ads — Smart Massager Escala & UGC Funnel',
    adId: 'ad_m1_winner',
    adName: 'UGC Ganador — "Alivio en 60s Cuello"',
    aiAgent: 'Optimization Agent',
    aiModel: 'Claude 3.7 Sonnet (OpenRouter)',
    metricsBefore: { cpa: 17.27, roas: 5.14, spend: 160, conversions: 9, frequency: 1.5 },
    reasoning: 'El anuncio tiene CPA excelente ($17.27 frente a máx $26) y ROAS 5.14x con 9 ventas confirmadas. El agente solicitó escalar agresivamente +80%.',
    requestedAction: { type: 'INCREASE_BUDGET', delta: '+80% ($288/día)', targetId: 'ad_m1_winner' },
    approvedAction: { 
      type: 'INCREASE_BUDGET', 
      delta: '+20% ($192/día)', 
      riskClamped: true,
      clampingReason: 'Risk Engine clamped incremento: MAX_DAILY_INCREASE es 20% para proteger el CPA del algoritmo.' 
    },
    executedAction: 'Incrementé el presupuesto de $160 a $192/día (+20%) dentro de límites seguros de riesgo.',
    status: 'EXECUTED',
    metricsAfter: { cpa: 17.27, roas: 5.14, spend: 190, netProfitDelta: 120 },
  },
  {
    id: 'log_03',
    timestamp: 'Ayer, 04:45 PM',
    accountId: 'zernio_act_meta_01',
    productId: 'prod_01',
    productName: 'Smart Massager Pro X',
    campaignId: 'camp_meta_01',
    campaignName: 'Meta Ads — Smart Massager Escala & UGC Funnel',
    aiAgent: 'Creative Agent',
    aiModel: 'Claude 3.7 Sonnet (OpenRouter)',
    metricsBefore: { cpa: 20.0, roas: 4.45, spend: 280, conversions: 14 },
    reasoning: 'Anticipando saturación de la audiencia principal, generé variante "Ahorro vs Fisioterapeuta" asignando 15% del presupuesto.',
    requestedAction: { type: 'CREATE_VARIANT', delta: 'Variante v2', targetId: 'camp_meta_01' },
    approvedAction: { type: 'CREATE_VARIANT', delta: 'Variante v2 ($42/día)', riskClamped: false },
    executedAction: 'Creé y publiqué Variante v2 con presupuesto experimental de $42/día.',
    status: 'EXECUTED',
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('SUPER_ADMIN');
  const [autonomousMode, setAutonomousMode] = useState<AutonomousMode>('AUTONOMOUS');
  const [products, setProducts] = useState<ProductFinancials[]>(INITIAL_PRODUCTS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [actionLogs, setActionLogs] = useState<AIActionLog[]>(INITIAL_LOGS);
  const [riskConfig, setRiskConfig] = useState<RiskEngineConfig>(RiskEngine.DEFAULT_CONFIG);
  const [zernioProvider] = useState<ZernioProvider>(() => new ZernioProvider());
  const [isZernioLive, setIsZernioLive] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Totales acumulados en tiempo real
  const totalSpendToday = useMemo(() => 
    campaigns.reduce((acc, c) => acc + c.metrics.spend, 0), [campaigns]);
    
  const totalAttributedRevenueToday = useMemo(() => 
    campaigns.reduce((acc, c) => acc + c.metrics.attributedRevenue, 0), [campaigns]);
    
  const totalNetProfitToday = useMemo(() => 
    campaigns.reduce((acc, c) => acc + c.metrics.netProfit, 0), [campaigns]);
    
  const totalConversionsToday = useMemo(() => 
    campaigns.reduce((acc, c) => acc + c.metrics.conversions, 0), [campaigns]);
    
  const overallROAS = useMemo(() => 
    totalSpendToday > 0 ? Number((totalAttributedRevenueToday / totalSpendToday).toFixed(2)) : 0, 
    [totalSpendToday, totalAttributedRevenueToday]);

  const overallCPA = useMemo(() => 
    totalConversionsToday > 0 ? Number((totalSpendToday / totalConversionsToday).toFixed(2)) : 0, 
    [totalSpendToday, totalConversionsToday]);

  const overallCPC = useMemo(() => {
    const totalClicks = campaigns.reduce((acc, c) => acc + c.metrics.clicks, 0);
    return totalClicks > 0 ? Number((totalSpendToday / totalClicks).toFixed(2)) : 0;
  }, [campaigns, totalSpendToday]);

  const overallCTR = useMemo(() => {
    const totalImpressions = campaigns.reduce((acc, c) => acc + c.metrics.impressions, 0);
    const totalClicks = campaigns.reduce((acc, c) => acc + c.metrics.clicks, 0);
    return totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;
  }, [campaigns]);

  const activeCampaignCount = useMemo(() => 
    campaigns.filter(c => c.status === 'ACTIVE').length, [campaigns]);

  const autoPausedAdsCount = useMemo(() => {
    let count = 0;
    campaigns.forEach(c => {
      count += c.ads.filter(a => a.status === 'PAUSED').length;
    });
    return count;
  }, [campaigns]);

  // Ahorro estimado por IA: dinero que se habría quemado si los anuncios pausados siguieran corriendo
  const estimatedAiSavings = 345.0;

  const pendingApprovals = useMemo(() => 
    actionLogs.filter(l => l.status === 'PENDING_APPROVAL'), [actionLogs]);

  const addProduct = (input: ProductInput) => {
    const newProd = FinancialEngine.calculateProductMetrics(input);
    setProducts(prev => [newProd, ...prev]);
  };

  const updateProduct = (id: string, input: Partial<ProductInput>) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      return FinancialEngine.calculateProductMetrics({
        ...p,
        ...input,
        id: p.id,
      });
    }));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateRiskConfig = (partial: Partial<RiskEngineConfig>) => {
    setRiskConfig(prev => ({ ...prev, ...partial }));
  };

  const toggleZernioEnvironment = () => {
    setIsZernioLive(prev => {
      const next = !prev;
      zernioProvider.updateConfig({ environment: next ? 'production' : 'sandbox' });
      return next;
    });
  };

  const approveAction = (actionId: string) => {
    setActionLogs(prev => prev.map(log => {
      if (log.id !== actionId) return log;
      return {
        ...log,
        status: 'USER_APPROVED',
        executedAction: `Aprobado por ${userRole}. Ejecutado en Zernio.`,
      };
    }));
  };

  const rejectAction = (actionId: string) => {
    setActionLogs(prev => prev.map(log => {
      if (log.id !== actionId) return log;
      return {
        ...log,
        status: 'USER_REJECTED',
        executedAction: `Rechazado manualmente por ${userRole}. Operación cancelada.`,
      };
    }));
  };

  /**
   * Ejecuta el ciclo autónomo de AllSender Ads:
   * ANALIZAR -> DECIDIR (Decision Engine) -> EVALUAR RIESGO (Risk Engine) -> EJECUTAR (Zernio) -> AUDITAR
   */
  const runAutonomousCycle = async (targetProductId?: string): Promise<string> => {
    setIsOptimizing(true);
    try {
      const targetCamp = targetProductId 
        ? campaigns.find(c => c.productId === targetProductId) || campaigns[0]
        : campaigns[0];

      if (!targetCamp || targetCamp.ads.length === 0) {
        setIsOptimizing(false);
        return 'No hay campañas activas para optimizar.';
      }

      const product = products.find(p => p.id === targetCamp.productId) || products[0];
      const activeAd = targetCamp.ads.find(a => a.status === 'ACTIVE') || targetCamp.ads[0];

      // 1. EVALUAR DECISIÓN MATEMÁTICA DETERMINISTA
      const decision = DecisionEngine.evaluate(activeAd.metrics, product, activeAd.fatigueScore);

      // 2. SIMULAR SOLICITUD DE AGENTE LLM (e.g. Si es rentable pide +80%)
      const llmProposedDelta = decision.action === 'INCREASE_BUDGET' ? 80 : (decision.action === 'REDUCE_BUDGET' ? -35 : 0);

      // 3. PASAR POR EL RISK ENGINE (AUTORIDAD MÁXIMA)
      const riskEvaluation = RiskEngine.evaluateAndClamp(
        {
          type: decision.action,
          deltaPercent: llmProposedDelta,
          currentBudget: activeAd.budgetAllocated,
          campaignId: targetCamp.id,
          adId: activeAd.id,
          source: 'LLM_AGENT',
          reasoning: decision.primaryReason,
        },
        riskConfig,
        autonomousMode,
        product,
        activeAd.metrics,
        totalSpendToday
      );

      // 4. CREAR ENTRADA DE AUDITORÍA
      const newLogId = `log_${Date.now()}`;
      const logEntry: AIActionLog = {
        id: newLogId,
        timestamp: 'Justo ahora',
        accountId: 'zernio_act_meta_01',
        productId: product.id,
        productName: product.name,
        campaignId: targetCamp.id,
        campaignName: targetCamp.name,
        adId: activeAd.id,
        adName: activeAd.name,
        aiAgent: 'Optimization Agent',
        aiModel: 'Claude 3.7 Sonnet (OpenRouter)',
        metricsBefore: {
          cpa: activeAd.metrics.cpa,
          roas: activeAd.metrics.roas,
          spend: activeAd.metrics.spend,
          conversions: activeAd.metrics.conversions,
          frequency: activeAd.metrics.frequency,
        },
        reasoning: decision.primaryReason,
        requestedAction: {
          type: decision.action,
          delta: riskEvaluation.requestedAction.delta,
        },
        approvedAction: {
          type: riskEvaluation.approvedAction.type,
          delta: riskEvaluation.approvedAction.delta,
          riskClamped: riskEvaluation.approvedAction.riskClamped,
          clampingReason: riskEvaluation.reason,
        },
        executedAction: riskEvaluation.requiresUserApproval
          ? 'Acción pendiente de aprobación manual del usuario (Modo Asistido/Manual).'
          : `Ejecutado con éxito vía Zernio Provider: ${riskEvaluation.approvedAction.delta}`,
        status: riskEvaluation.requiresUserApproval ? 'PENDING_APPROVAL' : 'EXECUTED',
      };

      setActionLogs(prev => [logEntry, ...prev]);

      // Si fue aprobado y no requiere confirmación, actualizar presupuesto en estado
      if (!riskEvaluation.requiresUserApproval) {
        setCampaigns(prev => prev.map(c => {
          if (c.id !== targetCamp.id) return c;
          return {
            ...c,
            ads: c.ads.map(a => {
              if (a.id !== activeAd.id) return a;
              return {
                ...a,
                budgetAllocated: riskEvaluation.approvedAction.budgetApproved,
                status: riskEvaluation.approvedAction.type === 'PAUSE' ? 'PAUSED' : a.status,
              };
            })
          };
        }));
      }

      setIsOptimizing(false);
      return `Ciclo completado: ${riskEvaluation.reason}`;
    } catch (err: any) {
      setIsOptimizing(false);
      return `Error en el ciclo: ${err.message}`;
    }
  };

  /**
   * Lanzar nueva campaña con Wizard validada por Risk Engine
   */
  const launchNewCampaign = async (payload: {
    productId: string;
    name: string;
    objective: string;
    dailyBudget: number;
    platform: PlatformType;
    country: string;
    creatives: CreativeConcept[];
  }): Promise<Campaign> => {
    const product = products.find(p => p.id === payload.productId) || products[0];

    // Llamada al proveedor Zernio
    const newCamp = await zernioProvider.createCampaign('zernio_act_meta_01', payload);

    // Auditoría
    const logEntry: AIActionLog = {
      id: `log_launch_${Date.now()}`,
      timestamp: 'Justo ahora',
      accountId: 'zernio_act_meta_01',
      productId: product.id,
      productName: product.name,
      campaignId: newCamp.id,
      campaignName: newCamp.name,
      aiAgent: 'Strategist Agent',
      aiModel: 'DeepSeek V3 (OpenRouter)',
      metricsBefore: { cpa: 0, roas: 0, spend: 0, conversions: 0 },
      reasoning: `Lanzamiento de campaña con ${payload.creatives.length} conceptos. Presupuesto diario asignado: $${payload.dailyBudget}. Margen unitario resguardado ($${product.maxProfitableCPA} CPA máx).`,
      requestedAction: { type: 'INCREASE_BUDGET', delta: `Inicial $${payload.dailyBudget}/día` },
      approvedAction: { type: 'INCREASE_BUDGET', delta: `$${payload.dailyBudget}/día`, riskClamped: false },
      executedAction: `Campaña desplegada en ${payload.platform.toUpperCase()} a través de Zernio.`,
      status: 'EXECUTED',
    };

    setCampaigns(prev => [newCamp, ...prev]);
    setActionLogs(prev => [logEntry, ...prev]);
    return newCamp;
  };

  /**
   * Asistente "Ask AllSender" con contexto de datos financieros reales
   */
  const askAllSender = async (query: string): Promise<{ answer: string; relatedData?: any }> => {
    const lower = query.toLowerCase();

    // 1. ¿Dónde estoy perdiendo dinero?
    if (lower.includes('perdiendo') || lower.includes('perdida') || lower.includes('dinero')) {
      const pausedAds = campaigns.flatMap(c => c.ads.filter(a => a.status === 'PAUSED' || a.metrics.netProfit < 0));
      return {
        answer: `Actualmente no hay sangrado activo gracias a las protecciones del Risk Engine. Anteriormente detectamos que el anuncio "Foto Catálogo Fondo Blanco" en Meta tenía un CPA de $48.00 (frente a tu CPA máx permitido de $26.00) con frecuencia 3.6x. Fue pausado automáticamente, ahorrándote un estimado de $345 USD en los últimos 7 días. Todas tus campañas activas están en ROAS positivo (> 3.8x).`,
        relatedData: pausedAds,
      };
    }

    // 2. ¿Qué anuncio debería escalar?
    if (lower.includes('escalar') || lower.includes('mejor anuncio') || lower.includes('ganador')) {
      return {
        answer: `El anuncio con mayor potencial es "UGC Ganador — 'Alivio en 60s Cuello'" en Meta Ads (Smart Massager Pro X). Ha generado 11 ventas con CPA de $17.27 (tu límite máximo es $26.00) y un ROAS de 5.14x con frecuencia saludable (1.5x). Se recomienda un incremento gradual de presupuesto de +20% (hasta $228/día) respetando el Risk Engine para evitar descalibrar el pixel.`,
        relatedData: { cpa: 17.27, roas: 5.14, conversions: 11 },
      };
    }

    // 3. ¿Cómo están mis campañas?
    if (lower.includes('campañas') || lower.includes('como estan') || lower.includes('rendimiento')) {
      return {
        answer: `Tus campañas presentan una salud excelente. Hoy has invertido $${totalSpendToday} USD generando $${totalAttributedRevenueToday} USD en ventas brutas ($${totalNetProfitToday} USD de beneficio neto). Tu ROAS consolidado es de ${overallROAS}x y el CPA promedio se ubica en $${overallCPA} USD sobre ${totalConversionsToday} conversiones. Meta Ads lidera el volumen y TikTok Ads mantiene el ROAS más alto (4.85x).`,
      };
    }

    // 4. Quiero vender X unidades esta semana
    if (lower.includes('vender') && (lower.includes('unidades') || lower.includes('semana') || lower.includes('50'))) {
      const targetUnits = 50;
      const avgCpa = overallCPA || 20;
      const requiredBudget = Math.round(targetUnits * avgCpa);
      const estRevenue = Math.round(targetUnits * 79);
      const estNetProfit = Math.round(estRevenue - (targetUnits * (22 + 8.5 + 4 + 2.5)) - requiredBudget);

      return {
        answer: `Para vender ${targetUnits} unidades de Smart Massager esta semana manteniendo tu CPA promedio de $${avgCpa} USD:
- Presupuesto semanal requerido: $${requiredBudget} USD ($${Math.round(requiredBudget / 7)} USD/día).
- Ingresos brutos estimados: $${estRevenue} USD.
- Beneficio neto proyectado: $${estNetProfit} USD libres de publicidad y costos directos.
- Regla de seguridad: Tu stock actual es de 84 unidades, por lo que tienes inventario suficiente para cumplir el objetivo sin riesgo de desabastecimiento.`,
        relatedData: { requiredBudget, estRevenue, estNetProfit },
      };
    }

    // 5. Crear otra publicidad basada en mi ganador
    if (lower.includes('crear') || lower.includes('variante') || lower.includes('ganador')) {
      return {
        answer: `He preparado 2 variantes basadas en el ángulo ganador "Alivio en 60 Segundos":
1. Ángulo de urgencia cotidiana: "¿3 PM y no aguantas la espalda? Mira esto."
2. Comparativa financiera: "Dejé de gastar $120 por sesión de masajes."
Puedes desplegarlas directamente a la piscina experimental (15% del presupuesto) desde la pestaña "Testing Dinámico & Fatiga".`,
      };
    }

    // Default
    return {
      answer: `Con gusto puedo ayudarte. Como tu analista publicitario en AllSender Ads, tengo acceso en tiempo real a tus márgenes de producto, métricas de Meta/Google/TikTok en Zernio y registros del Risk Engine. Pregúntame sobre rentabilidad, oportunidades de escalado o detección de fatiga.`,
    };
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        autonomousMode,
        setAutonomousMode,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        campaigns,
        activeCampaignCount,
        autoPausedAdsCount,
        totalSpendToday,
        totalAttributedRevenueToday,
        totalNetProfitToday,
        overallROAS,
        overallCPA,
        overallCPC,
        overallCTR,
        totalConversionsToday,
        estimatedAiSavings,
        actionLogs,
        pendingApprovals,
        approveAction,
        rejectAction,
        riskConfig,
        updateRiskConfig,
        zernioProvider,
        isZernioLive,
        toggleZernioEnvironment,
        runAutonomousCycle,
        isOptimizing,
        launchNewCampaign,
        askAllSender,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
